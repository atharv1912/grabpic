import cv2
import numpy as np
from face_worker_optimized import FaceEmbeddingWorker
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FaceMatcher:
    """Test face matching between reference and query images"""
    
    def __init__(self, similarity_threshold: float = 0.6):
        """
        Initialize face matcher.
        
        Args:
            similarity_threshold: Minimum similarity to consider a match
                                 Typical values: 0.5-0.7
                                 Higher = stricter matching
        """
        self.worker = FaceEmbeddingWorker(min_confidence=0.5)
        self.threshold = similarity_threshold
        
    def find_matches(self, reference_image: str, query_images: list) -> dict:
        """
        Find which query images contain the person from reference image.
        
        Args:
            reference_image: Path to reference image (e.g., user's selfie)
            query_images: List of paths to query images (e.g., event photos)
            
        Returns:
            Dictionary with match results
        """
        results = {
            'reference': reference_image,
            'reference_faces': 0,
            'matches': [],
            'no_matches': [],
            'errors': []
        }
        
        # Step 1: Process reference image
        logger.info(f"Processing reference image: {reference_image}")
        try:
            ref_faces = self.worker.process_image(reference_image)
            results['reference_faces'] = len(ref_faces)
            
            if len(ref_faces) == 0:
                logger.warning("No face found in reference image!")
                return results
            
            if len(ref_faces) > 1:
                logger.warning(f"Multiple faces ({len(ref_faces)}) found in reference. Using the largest face.")
            
            # Use the largest face as reference (most prominent)
            ref_face = max(ref_faces, key=lambda f: f.get_face_area())
            ref_embedding = ref_face.embedding
            
            logger.info(f"Reference face: confidence={ref_face.confidence:.3f}, area={ref_face.get_face_area()}px")
            
        except Exception as e:
            logger.error(f"Error processing reference image: {e}")
            results['errors'].append({'image': reference_image, 'error': str(e)})
            return results
        
        # Step 2: Process each query image
        logger.info(f"\nProcessing {len(query_images)} query image(s)...")
        
        for query_path in query_images:
            try:
                query_faces = self.worker.process_image(query_path)
                
                if len(query_faces) == 0:
                    logger.info(f"  {query_path}: No faces detected")
                    results['no_matches'].append({
                        'image': query_path,
                        'reason': 'no_faces_detected'
                    })
                    continue
                
                # Compare reference embedding with all faces in query image
                best_match = None
                best_similarity = -1
                
                for idx, query_face in enumerate(query_faces):
                    similarity = self.worker.calculate_similarity(
                        ref_embedding, 
                        query_face.embedding
                    )
                    
                    logger.debug(f"    Face {idx}: similarity={similarity:.3f}")
                    
                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_match = {
                            'face_index': idx,
                            'similarity': float(similarity),
                            'confidence': float(query_face.confidence),
                            'bbox': query_face.bbox.tolist(),
                            'face_area': query_face.get_face_area()
                        }
                
                # Check if best match exceeds threshold
                if best_similarity >= self.threshold:
                    logger.info(f"  ✅ {query_path}: MATCH (similarity={best_similarity:.3f})")
                    results['matches'].append({
                        'image': query_path,
                        'total_faces': len(query_faces),
                        'best_match': best_match
                    })
                else:
                    logger.info(f"  ❌ {query_path}: No match (best={best_similarity:.3f} < {self.threshold})")
                    results['no_matches'].append({
                        'image': query_path,
                        'reason': 'below_threshold',
                        'best_similarity': float(best_similarity),
                        'total_faces': len(query_faces)
                    })
                    
            except Exception as e:
                logger.error(f"  Error processing {query_path}: {e}")
                results['errors'].append({'image': query_path, 'error': str(e)})
        
        return results
    
    def visualize_matches(self, reference_image: str, query_image: str, output_path: str = 'match_result.jpg'):
        """
        Create a visual comparison of reference and query images with bboxes.
        
        Args:
            reference_image: Path to reference image
            query_image: Path to query image
            output_path: Where to save the visualization
        """
        import cv2
        
        # Process both images
        ref_faces = self.worker.process_image(reference_image)
        query_faces = self.worker.process_image(query_image)
        
        if not ref_faces or not query_faces:
            logger.warning("Cannot visualize: missing faces in one or both images")
            return
        
        # Load images
        ref_img = cv2.imread(reference_image)
        query_img = cv2.imread(query_image)
        
        # Draw bounding box on reference (green)
        ref_face = max(ref_faces, key=lambda f: f.get_face_area())
        x1, y1, x2, y2 = ref_face.bbox.astype(int)
        cv2.rectangle(ref_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(ref_img, "REFERENCE", (x1, y1-10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Find best match in query image
        ref_embedding = ref_face.embedding
        best_match = None
        best_similarity = -1
        
        for query_face in query_faces:
            similarity = self.worker.calculate_similarity(ref_embedding, query_face.embedding)
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = query_face
        
        # Draw bounding box on best match
        x1, y1, x2, y2 = best_match.bbox.astype(int)
        color = (0, 255, 0) if best_similarity >= self.threshold else (0, 0, 255)  # Green if match, red if not
        cv2.rectangle(query_img, (x1, y1), (x2, y2), color, 2)
        
        label = f"{'MATCH' if best_similarity >= self.threshold else 'NO MATCH'} ({best_similarity:.3f})"
        cv2.putText(query_img, label, (x1, y1-10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Combine images side by side
        h1, w1 = ref_img.shape[:2]
        h2, w2 = query_img.shape[:2]
        
        # Resize to same height
        target_height = min(h1, h2, 800)
        ref_img = cv2.resize(ref_img, (int(w1 * target_height / h1), target_height))
        query_img = cv2.resize(query_img, (int(w2 * target_height / h2), target_height))
        
        # Concatenate
        combined = np.hstack([ref_img, query_img])
        
        cv2.imwrite(output_path, combined)
        logger.info(f"Visualization saved to {output_path}")


def print_results(results: dict):
    """Pretty print matching results"""
    print("\n" + "="*60)
    print("FACE MATCHING RESULTS")
    print("="*60)
    
    print(f"\nReference Image: {results['reference']}")
    print(f"Faces detected: {results['reference_faces']}")
    
    print(f"\n✅ MATCHES: {len(results['matches'])}")
    for match in results['matches']:
        print(f"  • {match['image']}")
        print(f"    Similarity: {match['best_match']['similarity']:.3f}")
        print(f"    Total faces in image: {match['total_faces']}")
    
    print(f"\n❌ NO MATCHES: {len(results['no_matches'])}")
    for no_match in results['no_matches']:
        print(f"  • {no_match['image']}")
        if no_match['reason'] == 'no_faces_detected':
            print(f"    Reason: No faces detected")
        else:
            print(f"    Reason: Best similarity {no_match.get('best_similarity', 0):.3f} < threshold")
    
    if results['errors']:
        print(f"\n⚠️  ERRORS: {len(results['errors'])}")
        for error in results['errors']:
            print(f"  • {error['image']}: {error['error']}")
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    matcher = FaceMatcher(similarity_threshold=0.6)
    
    reference = 'test_images/reference.jpg'
    query_images = [
        'test_images/match_same.jpg',      # Should match
        'test_images/match_different.jpg', # Should NOT match
        'test_images/group_photo.jpg',     # Should match
    ]
    
    results = matcher.find_matches(reference, query_images)
    print_results(results)
    
    # Visualize each match
    for query in query_images:
        output_name = f"viz_{query.split('/')[-1]}"
        matcher.visualize_matches(reference, query, output_name)