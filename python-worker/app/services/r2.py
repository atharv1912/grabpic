import boto3
import numpy as np
from config import R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET

# R2 client — same S3-compatible API you used in Node
r2 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",
)

def fetch_image_from_r2(storage_path: str) -> np.ndarray:
    """
    Downloads image from R2 into memory and returns as numpy array (BGR).
    InsightFace expects BGR format — same as OpenCV default.
    """
    import cv2

    response = r2.get_object(Bucket=R2_BUCKET, Key=storage_path)
    image_bytes = response["Body"].read()

    # Convert bytes → numpy array → decoded image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)  # BGR

    if img is None:
        raise ValueError(f"Could not decode image at {storage_path}")

    return img