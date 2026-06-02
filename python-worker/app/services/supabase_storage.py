import boto3
import cv2
import os
import logging
import tempfile
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class StorageClient:
    """
    R2 Storage client — drop-in replacement for Supabase Storage.
    Only download_image() is used by the worker, interface stays the same.
    """

    def __init__(self):
        endpoint_url = os.getenv("R2_ENDPOINT") or os.getenv("R2_ENDPOINT_URL")
        access_key = os.getenv("R2_ACCESS_KEY") or os.getenv("R2_ACCESS_KEY_ID")
        secret_key = os.getenv("R2_SECRET_KEY") or os.getenv("R2_SECRET_ACCESS_KEY")
        self.bucket = os.getenv("R2_BUCKET") or os.getenv("R2_BUCKET_NAME")

        missing = []
        if not endpoint_url:
            missing.append("R2_ENDPOINT")
        if not access_key:
            missing.append("R2_ACCESS_KEY")
        if not secret_key:
            missing.append("R2_SECRET_KEY")
        if not self.bucket:
            missing.append("R2_BUCKET")

        if missing:
            raise ValueError(f"Missing R2 configuration: {', '.join(missing)}")

        self.r2 = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="auto",
        )
        logger.info("R2 storage client initialized")

    def download_image(self, path: str, local_path: str = None) -> str:
        """
        Downloads image from R2 and returns a local file path.
        
        NOTE: The face worker expects a filesystem path, so this helper
        materializes the object to a temporary file and returns that path.
        local_path is kept for compatibility; when provided it is used as-is.
        """
        try:
            if not path:
                raise ValueError("Storage path is required")

            logger.info(f"Downloading {path} from R2")

            response = self.r2.get_object(Bucket=self.bucket, Key=path)
            image_bytes = response["Body"].read()

            if not image_bytes:
                raise ValueError("Downloaded file is empty")

            if local_path:
                output_path = local_path
                with open(output_path, "wb") as file_handle:
                    file_handle.write(image_bytes)
            else:
                suffix = os.path.splitext(path)[1] or ".jpg"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                    tmp_file.write(image_bytes)
                    output_path = tmp_file.name

            decoded_image = cv2.imread(output_path)
            if decoded_image is None:
                raise ValueError(f"Could not decode image at {path}")

            logger.info(f"Downloaded image to: {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"Error downloading {path} from R2: {e}")
            raise

    def get_public_url(self, path: str) -> str:
        """Returns public URL using R2 public domain."""
        public_url = os.getenv("R2_PUBLIC_URL")
        return f"{public_url}/{path}"

    def create_signed_url(self, path: str, expiration: int = 3600) -> str:
        """Generates a presigned URL for private access."""
        url = self.r2.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": path},
            ExpiresIn=expiration,
        )
        return url