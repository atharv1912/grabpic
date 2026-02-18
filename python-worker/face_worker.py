import insightface
from insightface.app import FaceAnalysis
import cv2
import numpy as np
from typing import List, Optional
from dataclasses import dataclass
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DetectedFace:
    """Structure to hold face detection results"""
    bbox: np.ndarray  # [x1, y1, x2, y2]
    embedding: np.ndarray  # (512,) vector - L2 normalized
    confidence: float
    landmarks: Optional[np.ndarray] = None
    
    def get_face_area(self) -> int:
        """Calculate face area in pixels"""
        x1, y1, x2, y2 = self.bbox
        return int((x2 - x1) * (y2 - y1))
    
    def to_dict(self) -> dict:
        """Convert to dictionary for serialization"""
        return {
            'bbox': self.bbox.tolist(),
            'embedding': self.embedding.tolist(),
            'confidence': float(self.confidence),
            'face_area': self.get_face_area()
        }

class FaceEmbeddingWorker:
    """
    Core worker for face detection and embedding generation.
    Optimized for 512MB memory constraint.
    """
    
    def __init__(self, 
                 model_name: str = 'buffalo_s',
                 det_size: tuple = (640, 640),
                 max_image_size: int = 1920,
                 min_confidence: float = 0.5):
        """
        Initialize the face recognition model.
        
        Args:
            model_name: InsightFace model name
            det_size: Detection input size (larger = more accurate but slower)
            max_image_size: Resize images larger than this (memory optimization)
            min_confidence: Minimum detection confidence threshold
        """
        self.max_image_size = max_image_size
        self.min_confidence = min_confidence
        
        logger.info(f"Initializing FaceEmbeddingWorker with {model_name}")
        
        self.app = FaceAnalysis(name=model_name, providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=det_size)
        
        logger.info("Model loaded successfully")
    
    def _normalize_embedding(self, embedding: np.ndarray) -> np.ndarray:
        """
        L2 normalize the embedding vector.
        
        Why? Makes similarity calculation simpler and faster:
        similarity = np.dot(emb1, emb2)  # Instead of cosine formula
        
        Args:
            embedding: Raw embedding vector
            
        Returns:
            Normalized embedding (L2 norm = 1.0)
        """
        norm = np.linalg.norm(embedding)
        if norm == 0:
            logger.warning("Zero norm embedding detected")
            return embedding
        return embedding / norm
    
    def _resize_image_if_needed(self, img: np.ndarray) -> tuple:
        """
        Resize image if it exceeds max_image_size to save memory.
        
        Args:
            img: Input image (numpy array)
            
        Returns:
            Tuple of (resized_image, scale_factor)
        """
        h, w = img.shape[:2]
        
        if h > self.max_image_size or w > self.max_image_size:
            scale = self.max_image_size / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            img_resized = cv2.resize(img, (new_w, new_h))
            logger.info(f"Resized image from {w}x{h} to {new_w}x{new_h} (scale: {scale:.2f})")
            return img_resized, scale
        
        return img, 1.0
    
    def process_image(self, image_path: str) -> List[DetectedFace]:
        """
        Process an image and return all detected faces with embeddings.
        
        Args:
            image_path: Path to image file
            
        Returns:
            List of DetectedFace objects with normalized embeddings
        """
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image at {image_path}")
        
        logger.info(f"Processing image: {image_path} (shape: {img.shape})")
        
        # Resize if needed
        img_processed, scale = self._resize_image_if_needed(img)
        
        # Detect faces
        faces = self.app.get(img_processed)
        logger.info(f"Found {len(faces)} face(s)")
        
        # Filter by confidence and convert to DetectedFace objects
        detected_faces = []
        for idx, face in enumerate(faces):
            if face.det_score >= self.min_confidence:
                # IMPORTANT: Normalize the embedding
                normalized_embedding = self._normalize_embedding(face.embedding)
                
                detected_faces.append(DetectedFace(
                    bbox=face.bbox,
                    embedding=normalized_embedding,
                    confidence=face.det_score,
                    landmarks=face.kps if hasattr(face, 'kps') else None
                ))
                logger.debug(f"Face {idx}: confidence={face.det_score:.3f}, bbox={face.bbox}")
            else:
                logger.debug(f"Face {idx} rejected: confidence={face.det_score:.3f} < {self.min_confidence}")
        
        # Clean up
        del img, img_processed, faces
        
        return detected_faces
    
    @staticmethod
    def calculate_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate similarity between two embeddings.
        
        Assumes embeddings are L2-normalized.
        Returns value between -1 (opposite) and 1 (identical).
        Typically, same person: > 0.6, different person: < 0.4
        
        Args:
            embedding1: First normalized embedding
            embedding2: Second normalized embedding
            
        Returns:
            Similarity score (cosine similarity)
        """
        return float(np.dot(embedding1, embedding2))


# Test the worker
if __name__ == "__main__":
    # Initialize worker
    worker = FaceEmbeddingWorker(min_confidence=0.6)
    
    # Process test image
    try:
        faces = worker.process_image('test_image.jpg')
        
        print(f"\n{'='*50}")
        print(f"RESULTS: Found {len(faces)} face(s)")
        print(f"{'='*50}\n")
        
        for i, face in enumerate(faces):
            print(f"Face {i+1}:")
            print(f"  Confidence: {face.confidence:.3f}")
            print(f"  Bounding Box: {face.bbox}")
            print(f"  Face Area: {face.get_face_area()} pixels")
            print(f"  Embedding shape: {face.embedding.shape}")
            print(f"  Embedding norm: {np.linalg.norm(face.embedding):.4f} ← Should be 1.0 now!")
            print(f"  First 5 values: {face.embedding[:5]}")
            print()
        
        # Test similarity calculation (same face should be ~1.0)
        if len(faces) >= 1:
            print("Testing similarity calculation:")
            print(f"  Same embedding vs itself: {worker.calculate_similarity(faces[0].embedding, faces[0].embedding):.4f}")
            print("  ↑ Should be 1.0 (perfect match)\n")
            
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)