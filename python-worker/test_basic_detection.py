import insightface
from insightface.app import FaceAnalysis
import cv2
import numpy as np

# Load model
app = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))

# Load image
img = cv2.imread('image.png')
print(f"Image shape: {img.shape}")  # Understand: (height, width, channels)

# Detect faces
faces = app.get(img)
print(f"Found {len(faces)} face(s)")

# Examine first face
if faces:
    face = faces[0]
    print(f"\nFace attributes:")
    print(f"  Bounding box: {face.bbox}")  # [x1, y1, x2, y2]
    print(f"  Confidence: {face.det_score}")  # Detection confidence
    print(f"  Embedding shape: {face.embedding.shape}")  # Should be (512,)
    print(f"  Embedding dtype: {face.embedding.dtype}")  # float32
    print(f"  Embedding sample: {face.embedding[:5]}")  # First 5 values