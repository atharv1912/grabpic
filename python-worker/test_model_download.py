import insightface
from insightface.app import FaceAnalysis

# This will download the model on first run
app = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))

print("Model loaded successfully!")
print(f"Available tasks: {app.models.keys()}")