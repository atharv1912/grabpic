import boto3
import os
import dotenv
import logging
logger = logging.getLogger(__name__)

dotenv.load_dotenv()

class R2Client:
    """R2 client for uploading and downloading files."""
    
    def __init__(self):
        """Initialize R2 client"""
        self.s3 = boto3.client(
            service_name='s3',
            # Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
            endpoint_url=os.getenv('R2_ENDPOINT_URL'),
            # Provide your R2 Access Key ID and Secret Access Key
            aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
            region_name='auto',  # Required by boto3, not used by R2
        )
        logger.info("R2 client initialized")
    




