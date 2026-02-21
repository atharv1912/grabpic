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
    bbox: np.ndarray
    embedding: np.ndarray
    confidence: float
    
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
    Memory-optimized face detection and embedding generation.
    Target: Under 512MB total memory usage.
    """
    
    def __init__(self, 
                 model_name: str = 'buffalo_sc',  # Changed to smaller model
                 det_size: tuple = (640, 640),
                 max_image_size: int = 1280,
                 min_confidence: float = 0.5):
        """
        Initialize the face recognition model.
        
        Args:
            model_name: InsightFace model ('buffalo_sc' for low memory, 'buffalo_s' for better accuracy)
            det_size: Detection input size
            max_image_size: Resize images larger than this
            min_confidence: Minimum detection confidence threshold
        """
        self.max_image_size = max_image_size
        self.min_confidence = min_confidence
        
        logger.info(f"Initializing FaceEmbeddingWorker with {model_name}")
        logger.info(f"Memory target: < 512MB")
        
        # Initialize with only detection and recognition models
        self.app = FaceAnalysis(
            name=model_name, 
            providers=['CPUExecutionProvider'],
            allowed_modules=['detection', 'recognition']  # Only load what we need!
        )
        self.app.prepare(ctx_id=0, det_size=det_size)
        
        logger.info("Model loaded successfully")
    
    def _normalize_embedding(self, embedding: np.ndarray) -> np.ndarray:
        """L2 normalize the embedding vector."""
        norm = np.linalg.norm(embedding)
        if norm == 0:
            logger.warning("Zero norm embedding detected")
            return embedding
        return embedding / norm
    
    def _resize_image_if_needed(self, img: np.ndarray) -> tuple:
        """Resize image if it exceeds max_image_size to save memory."""
        h, w = img.shape[:2]
        
        if h > self.max_image_size or w > self.max_image_size:
            scale = self.max_image_size / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            img_resized = cv2.resize(img, (new_w, new_h))
            logger.info(f"Resized image from {w}x{h} to {new_w}x{new_h}")
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
        
        logger.info(f"Processing: {image_path} (shape: {img.shape})")
        
        # Resize if needed
        img_processed, scale = self._resize_image_if_needed(img)
        
        # Detect faces
        faces = self.app.get(img_processed)
        logger.info(f"Found {len(faces)} face(s)")
        
        # Convert to DetectedFace objects
        detected_faces = []
        for idx, face in enumerate(faces):
            if face.det_score >= self.min_confidence:
                normalized_embedding = self._normalize_embedding(face.embedding)
                
                detected_faces.append(DetectedFace(
                    bbox=face.bbox,
                    embedding=normalized_embedding,
                    confidence=face.det_score
                ))
        
        # Clean up
        del img, img_processed, faces
        
        return detected_faces
    
    @staticmethod
    def calculate_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate similarity between two normalized embeddings."""
        return float(np.dot(embedding1, embedding2))


if __name__ == "__main__":
    worker = FaceEmbeddingWorker(min_confidence=0.6)
    
    try:
        faces = worker.process_image('test_image.jpg')
        
        print(f"\n{'='*50}")
        print(f"RESULTS: Found {len(faces)} face(s)")
        print(f"{'='*50}\n")
        
        for i, face in enumerate(faces):
            print(f"Face {i+1}:")
            print(f"  Confidence: {face.confidence:.3f}")
            print(f"  Embedding norm: {np.linalg.norm(face.embedding):.4f}")
            print()
            
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)