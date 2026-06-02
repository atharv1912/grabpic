from supabase import create_client, Client
import os
from dotenv import load_dotenv
import logging
from typing import List, Dict, Optional
import numpy as np

load_dotenv()
logger = logging.getLogger(__name__)


class SupabaseClient:
    """Supabase client for storing face embeddings and metadata."""
    
    def __init__(self):
        """Initialize Supabase client"""
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')
        
        if not url or not key:
            raise ValueError("Missing Supabase credentials in environment variables")
        
        self.client: Client = create_client(url, key)
        logger.info("Supabase client initialized")
    
    def store_face_embedding(
        self,
        photo_id: str,
        face_index: int,
        embedding: np.ndarray,
        bbox: List[float],
        confidence: float,
        face_area: int
    ) -> Dict:
        """
        Store a face embedding in Supabase.
        
        Args:
            photo_id: UUID of the photo
            face_index: Index of face in photo (0, 1, 2...)
            embedding: 512-dimensional normalized embedding
            bbox: Bounding box [x1, y1, x2, y2]
            confidence: Detection confidence (0-1)
            face_area: Face area in pixels
            
        Returns:
            Inserted record
        """
        try:
            # Convert numpy array to list for JSON serialization
            embedding_list = embedding.tolist() if isinstance(embedding, np.ndarray) else embedding
            
            # Unpack bounding box
            x1, y1, x2, y2 = bbox
            
            data = {
                'photo_id': photo_id,
                'face_index': face_index,
                'embedding': embedding_list,
                'bbox_x1': float(x1),
                'bbox_y1': float(y1),
                'bbox_x2': float(x2),
                'bbox_y2': float(y2),
                'confidence': float(confidence),
                'face_area': int(face_area),
            }
            
            # Insert into faces table
            result = self.client.table('faces').insert(data).execute()
            
            logger.info(f"Stored embedding for photo {photo_id}, face {face_index}")
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error storing embedding: {e}")
            raise
    
    def update_photo_processed(
        self,
        photo_id: str,
        face_count: int,
        error: str = None
    ) -> Dict:
        """
        Mark a photo as processed.
        
        Args:
            photo_id: UUID of the photo
            face_count: Number of faces detected
            error: Optional error message if processing failed
            
        Returns:
            Updated record
        """
        try:
            data = {
                'status': 'processed',
                
            }
            
            if error:
                data['processing_error'] = error
            
            # Remove None values so we don't overwrite DB defaults/columns that don't exist
            clean_data = {k: v for k, v in data.items() if v is not None}

            result = self.client.table('photos').update(clean_data).eq('id', photo_id).execute()
            
            logger.info(f"Marked photo {photo_id} as processed (faces: {face_count})")
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error updating photo status: {e}")
            raise
    
    def find_similar_faces(
        self,
        query_embedding: np.ndarray,
        event_id: str,
        threshold: float = 0.6,
        limit: int = 50
    ) -> List[Dict]:
        """
        Find similar faces using the match_faces function.
        
        Args:
            query_embedding: Embedding to search for
            event_id: Event UUID to search within
            threshold: Minimum similarity threshold
            limit: Maximum number of results
            
        Returns:
            List of matching faces with similarity scores
        """
        try:
            # Convert embedding to list
            embedding_list = query_embedding.tolist() if isinstance(query_embedding, np.ndarray) else query_embedding
            
            # Prepare params for the `match_faces` RPC; keep event filter optional
            rpc_params = {
                'query_embedding': embedding_list,
                'match_threshold': float(threshold),
                'match_count': int(limit),
            }

            if event_id:
                rpc_params['filter_event_id'] = event_id

            result = self.client.rpc('match_faces', rpc_params).execute()

            matches = result.data or []
            logger.info(f"match_faces returned {len(matches)} results for event={event_id}")
            return matches
            
        except Exception as e:
            logger.error(f"Error finding similar faces: {e}")
            raise
    
    def get_photos_with_matching_face(
        self,
        query_embedding: np.ndarray,
        event_id: str,
        threshold: float = 0.6
    ) -> List[Dict]:
        """
        Get all photos containing a matching face.
        
        Args:
            query_embedding: Embedding to search for
            event_id: Event UUID
            threshold: Minimum similarity threshold
            
        Returns:
            List of photos with matching faces
        """
        try:
            embedding_list = query_embedding.tolist() if isinstance(query_embedding, np.ndarray) else query_embedding
            
            # Log embedding details for debugging
            logger.info(f"Query embedding norm: {np.linalg.norm(query_embedding):.4f}")
            logger.info(f"Query embedding shape: {np.array(embedding_list).shape}")
            
            rpc_params = {
                'query_embedding': embedding_list,
                'match_threshold': float(threshold),
            }

            if event_id:
                rpc_params['target_event_id'] = event_id

            logger.info(f"Calling RPC with params: event_id={event_id}, threshold={threshold}")
            result = self.client.rpc('get_photos_with_face', rpc_params).execute()

            photos = result.data or []
            logger.info(f"get_photos_with_face returned {len(photos)} photos for event={event_id}")
            
            if photos:
                logger.info(f"First match details: {photos[0]}")
            
            return photos
            
        except Exception as e:
            logger.error(f"Error getting photos: {e}")
            logger.error(f"RPC params were: {rpc_params}")
            raise


if __name__ == "__main__":
    # Test Supabase client
    logging.basicConfig(level=logging.INFO)
    
    try:
        client = SupabaseClient()
        print("✅ Supabase client initialized successfully")
        
        # Test with dummy data
        # test_embedding = np.random.randn(512)
        # test_embedding = test_embedding / np.linalg.norm(test_embedding)
        # 
        # result = client.store_face_embedding(
        #     photo_id="550e8400-e29b-41d4-a716-446655440000",  # Example UUID
        #     face_index=0,
        #     embedding=test_embedding,
        #     bbox=[100.5, 150.2, 250.8, 350.9],
        #     confidence=0.95,
        #     face_area=15000
        # )
        # print(f"✅ Stored test embedding: {result}")
        
    except Exception as e:
        print(f"❌ Error: {e}")