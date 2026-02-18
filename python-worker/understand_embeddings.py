import insightface
from insightface.app import FaceAnalysis
import cv2
import numpy as np

app = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))

img = cv2.imread('test_image.jpg')
faces = app.get(img)

if faces:
    embedding = faces[0].embedding
    
    print("Embedding Analysis:")
    print(f"Shape: {embedding.shape}")
    print(f"Data type: {embedding.dtype}")
    print(f"Min value: {embedding.min():.4f}")
    print(f"Max value: {embedding.max():.4f}")
    print(f"Mean value: {embedding.mean():.4f}")
    print(f"\nFirst 10 values:\n{embedding[:10]}")
    
    # Calculate L2 norm (Euclidean length of the vector)
    norm = np.linalg.norm(embedding)
    print(f"\nL2 Norm: {norm:.4f}")
    
    # Is it normalized?
    print(f"Is normalized (norm ≈ 1)? {np.isclose(norm, 1.0)}")