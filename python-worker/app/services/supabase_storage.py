from supabase import create_client, Client
import os
from dotenv import load_dotenv
import logging
import tempfile

load_dotenv()
logger = logging.getLogger(__name__)


class StorageClient:
    """
    Supabase Storage client for downloading images.
    Much simpler than R2 - uses existing Supabase client!
    """
    
    def __init__(self, bucket_name: str = 'event-photos'):
        """
        Initialize Supabase Storage client.
        
        Args:
            bucket_name: Name of the storage bucket in Supabase
        """
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')
        
        if not url or not key:
            raise ValueError("Missing Supabase credentials")
        
        self.client: Client = create_client(url, key)
        self.bucket_name = bucket_name
        
        logger.info(f"Storage client initialized for bucket: {bucket_name}")
    
    def download_image(self, path: str, local_path: str = None) -> str:
        """
        Download an image from Supabase Storage to local filesystem.
        
        Args:
            path: File path in bucket (e.g., 'events/event123/photo1.jpg')
            local_path: Optional local path. If None, creates temp file.
            
        Returns:
            Path to downloaded file
        """
        try:
            # Create temp file if no path provided
            if local_path is None:
                extension = os.path.splitext(path)[1] or '.jpg'
                temp_file = tempfile.NamedTemporaryFile(
                    delete=False, 
                    suffix=extension,
                    prefix='storage_download_'
                )
                local_path = temp_file.name
                temp_file.close()
            
            # Download from Supabase Storage
            logger.info(f"Downloading {path} from Supabase Storage")
            
            data = self.client.storage.from_(self.bucket_name).download(path)
            
            # Write to local file
            with open(local_path, 'wb') as f:
                f.write(data)
            
            # Verify file
            file_size = os.path.getsize(local_path)
            logger.info(f"Downloaded {file_size} bytes to {local_path}")
            
            if file_size == 0:
                raise ValueError("Downloaded file is empty")
            
            return local_path
            
        except Exception as e:
            logger.error(f"Error downloading {path}: {e}")
            raise
    
    def get_public_url(self, path: str) -> str:
        """
        Get public URL for a file (if bucket is public).
        
        Args:
            path: File path in bucket
            
        Returns:
            Public URL
        """
        try:
            url = self.client.storage.from_(self.bucket_name).get_public_url(path)
            return url
        except Exception as e:
            logger.error(f"Error getting public URL for {path}: {e}")
            raise
    
    def create_signed_url(self, path: str, expiration: int = 3600) -> str:
        """
        Create a signed URL for private files.
        
        Args:
            path: File path in bucket
            expiration: URL expiration in seconds (default 1 hour)
            
        Returns:
            Signed URL
        """
        try:
            result = self.client.storage.from_(self.bucket_name).create_signed_url(
                path, 
                expiration
            )
            return result['signedURL']
        except Exception as e:
            logger.error(f"Error creating signed URL for {path}: {e}")
            raise


if __name__ == "__main__":
    # Test Storage client
    logging.basicConfig(level=logging.INFO)
    
    try:
        client = StorageClient(bucket_name='event-photos')
        print("✅ Storage client initialized successfully")
        
        # To test download, you'll need to upload a test file first:
        # 1. Go to Supabase Dashboard > Storage
        # 2. Create bucket 'event-photos'
        # 3. Upload a test image
        # 4. Then uncomment below:
        
        # test_path = "test_images/sample.jpg"
        # local_file = client.download_image(test_path)
        # print(f"✅ Downloaded to: {local_file}")
        
    except Exception as e:
        print(f"❌ Error: {e}")