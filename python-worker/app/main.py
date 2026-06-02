from flask import Flask, request, jsonify
import os
import logging
from dotenv import load_dotenv
import traceback
import numpy as np
import json
from app.services.supabase_storage import StorageClient
from app.services.face_worker_optimized import FaceEmbeddingWorker
from app.services.supabase_client import SupabaseClient
# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)



# Initialize clients (singleton pattern - created once)
face_worker = None
storage_client = None
supabase_client = None


def get_face_worker():
    """Lazy initialization of face worker (heavy model loading)"""
    global face_worker
    if face_worker is None:
        logger.info("Initializing Face Worker...")
        face_worker = FaceEmbeddingWorker(
            model_name='buffalo_sc',
            min_confidence=float(os.getenv('MIN_FACE_CONFIDENCE', '0.5'))
        )
        logger.info("Face Worker initialized")
    return face_worker


def get_storage_client():
    """Lazy initialization of R2 storage client"""
    global storage_client
    if storage_client is None:
        storage_client = StorageClient()
    return storage_client


def get_supabase_client():
    """Lazy initialization of Supabase client"""
    global supabase_client
    if supabase_client is None:
        supabase_client = SupabaseClient()
    return supabase_client


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'service': 'face-recognition-worker',
        'model_loaded': face_worker is not None
    }), 200


@app.route('/process-photo', methods=['POST'])
def process_photo():
    """
    Main endpoint to process a photo.
    
    Expected JSON payload from QStash:
    {
        "photo_id": "uuid-here",
        "event_id": "uuid-here", 
        "storage_path": "test_events/event1/photo1.jpg"
    }
    """
    try:
        # 1. Parse request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON payload provided'}), 400
        
        photo_id = data.get('photo_id')
        event_id = data.get('event_id')
        storage_path = data.get('storage_path')
        
        # Validate required fields
        if not all([photo_id, event_id, storage_path]):
            return jsonify({
                'error': 'Missing required fields',
                'required': ['photo_id', 'event_id', 'storage_path']
            }), 400
        
        logger.info(f"Processing photo: {photo_id} (event: {event_id})")
        
        # 2. Download image from R2 bucket
        storage = get_storage_client()
        local_image_path = None
        
        try:
            logger.info(f"Downloading from R2: {storage_path}")
            local_image_path = storage.download_image(storage_path)
            logger.info(f"Downloaded to: {local_image_path}")
            
        except Exception as e:
            logger.error(f"Failed to download image: {e}")
            
            # Mark photo as failed in database
            supabase = get_supabase_client()
            supabase.update_photo_processed(
                photo_id=photo_id,
                face_count=0,
                error=f"Download failed: {str(e)}"
            )
            
            return jsonify({
                'error': 'Failed to download image',
                'details': str(e)
            }), 500
        
        # 3. Process faces
        worker = get_face_worker()
        
        try:
            logger.info("Detecting faces...")
            faces = worker.process_image(local_image_path)
            logger.info(f"Detected {len(faces)} face(s)")
            
        except Exception as e:
            logger.error(f"Face detection failed: {e}")
            logger.error(traceback.format_exc())
            
            # Mark as failed
            supabase = get_supabase_client()
            supabase.update_photo_processed(
                photo_id=photo_id,
                face_count=0,
                error=f"Face detection failed: {str(e)}"
            )

            if local_image_path and os.path.exists(local_image_path):
                os.remove(local_image_path)
            
            return jsonify({
                'error': 'Face detection failed',
                'details': str(e)
            }), 500
        
        # 4. Store embeddings in Supabase
        supabase = get_supabase_client()
        stored_faces = []
        
        try:
            for idx, face in enumerate(faces):
                logger.info(f"Storing face {idx + 1}/{len(faces)}...")
                
                result = supabase.store_face_embedding(
                    photo_id=photo_id,
                    face_index=idx,
                    embedding=face.embedding,
                    bbox=face.bbox.tolist(),
                    confidence=face.confidence,
                    face_area=face.get_face_area()
                )
                
                stored_faces.append({
                    'face_index': idx,
                    'confidence': float(face.confidence),
                    'face_area': face.get_face_area()
                })
            
            # 5. Mark photo as processed
            supabase.update_photo_processed(
                photo_id=photo_id,
                face_count=len(faces),
                error=None
            )
            
            logger.info(f"Successfully processed photo {photo_id}")
            
        except Exception as e:
            logger.error(f"Failed to store embeddings: {e}")
            logger.error(traceback.format_exc())
            
            # Mark as failed
            supabase.update_photo_processed(
                photo_id=photo_id,
                face_count=0,
                error=f"Database storage failed: {str(e)}"
            )
            
            # Clean up temp file
            if local_image_path and os.path.exists(local_image_path):
                os.remove(local_image_path)
            
            return jsonify({
                'error': 'Failed to store embeddings',
                'details': str(e)
            }), 500
        
        # 6. Clean up temp file
        if local_image_path and os.path.exists(local_image_path):
            os.remove(local_image_path)
            logger.info("Cleaned up temp file")
        
        # 7. Return success response
        return jsonify({
            'success': True,
            'photo_id': photo_id,
            'event_id': event_id,
            'faces_detected': len(faces),
            'faces': stored_faces
        }), 200
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@app.route('/search-faces', methods=['POST'])
def search_faces():
    """
    Endpoint to search for similar faces (for user selfie matching).
    
    Expected JSON payload:
    {
        "event_id": "uuid-here",
        "selfie_storage_path": "selfies/user123/selfie.jpg",
        "threshold": 0.6  // optional
    }
    """
    try:
        data = request.get_json()
        local_selfie_path = None
        
        if not data:
            return jsonify({'error': 'No JSON payload provided'}), 400
        
        event_id = data.get('event_id')
        selfie_path = data.get('selfie_storage_path')
        threshold = float(data.get('threshold', os.getenv('SIMILARITY_THRESHOLD', '0.6')))
        
        if not all([event_id, selfie_path]):
            return jsonify({
                'error': 'Missing required fields',
                'required': ['event_id', 'selfie_storage_path']
            }), 400
        
        logger.info(f"Searching for faces in event {event_id} with threshold {threshold}")
        
        # 1. Download selfie from R2
        storage = get_storage_client()
        logger.info(f"Downloading selfie from R2: {selfie_path}")
        local_selfie_path = storage.download_image(selfie_path)
        
        # 2. Extract face from selfie
        worker = get_face_worker()
        selfie_faces = worker.process_image(local_selfie_path)
        logger.info(f"Detected {len(selfie_faces)} face(s) in selfie")

        if len(selfie_faces) == 0:
            return jsonify({
                'error': 'No face detected in selfie',
                'matches': []
            }), 400
        
        if len(selfie_faces) > 1:
            logger.warning(f"Multiple faces in selfie ({len(selfie_faces)}), using largest")
        
        # Use the largest face
        selfie_face = max(selfie_faces, key=lambda f: f.get_face_area())
        logger.info(f"Using selfie face with confidence: {selfie_face.confidence:.3f}")
        
        # 3. Get all photos in event and calculate similarities
        supabase = get_supabase_client()
        
        try:
            photos_result = supabase.client.table('photos').select('id').eq('event_id', event_id).execute()
            photo_ids = [p['id'] for p in photos_result.data or []]
            logger.info(f"Found {len(photo_ids)} photos in event")
            
            if not photo_ids:
                return jsonify({
                    'success': True,
                    'event_id': event_id,
                    'matches': 0,
                    'threshold': threshold,
                    'photos': []
                }), 200
            
            # Get all faces and calculate similarities
            matching_photos = []
            
            for photo_id in photo_ids:
                faces_result = supabase.client.table('faces').select('*').eq('photo_id', photo_id).execute()
                faces = faces_result.data or []
                
                for face_data in faces:
                    try:
                        stored_embedding = face_data.get('embedding', [])
                        
                        # Parse embedding (handle both string JSON and list formats)
                        if isinstance(stored_embedding, str):
                            stored_embedding = np.array(json.loads(stored_embedding))
                        elif isinstance(stored_embedding, list):
                            stored_embedding = np.array(stored_embedding)
                        else:
                            continue
                        
                        if stored_embedding.size == 0:
                            continue
                        
                        # Calculate similarity
                        similarity = float(np.dot(selfie_face.embedding, stored_embedding))
                        
                        if similarity >= threshold:
                            matching_photos.append({
                                'photo_id': photo_id,
                                'similarity': similarity,
                                'confidence': face_data.get('confidence')
                            })
                    except Exception as e:
                        logger.warning(f"Error processing face: {e}")
                        continue
            
            # Sort by similarity
            matching_photos.sort(key=lambda x: x['similarity'], reverse=True)
            
            logger.info(f"Found {len(matching_photos)} matching photos")
            
            return jsonify({
                'success': True,
                'event_id': event_id,
                'matches': len(matching_photos),
                'threshold': threshold,
                'photos': matching_photos
            }), 200
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            logger.error(traceback.format_exc())
            return jsonify({
                'error': 'Search failed',
                'details': str(e)
            }), 500
    
    except Exception as e:
        logger.error(f"Search failed: {e}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Search failed',
            'details': str(e)
        }), 500
    finally:
        if local_selfie_path and os.path.exists(local_selfie_path):
            os.remove(local_selfie_path)


if __name__ == '__main__':
    port = int(os.getenv('WORKER_PORT', '8000'))
    
    # Pre-load the model on startup (optional but recommended)
    logger.info("Pre-loading face recognition model...")
    get_face_worker()
    logger.info("Model pre-loaded successfully")
    
    # Start Flask server
    logger.info(f"Starting worker on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)