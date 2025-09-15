import os
import time
from datetime import datetime
from PIL import Image
from picamera2 import Picamera2
from Waste_recognition import CloudinaryUploader
import tempfile


class CameraManager:
    """
    Manages camera operations for waste recognition system.
    Handles image capture, local storage, and cloud upload functionality.
    """
    
    def __init__(self):
        """
        Initialize the camera manager with PiCamera2 configuration.
        
        Sets up:
        - High-resolution camera capture (3280x2464)
        - RGB888 format for color image processing
        - Scaler crop for optimized image area
        - Cloudinary uploader for cloud storage
        - Local temporary images directory
        """
        # Initialize and configure for still capture
        self.picam2 = Picamera2()
        self.picam2.configure(self.picam2.create_still_configuration(
            main={"format": "RGB888", "size": (3280, 2464)}
        ))
        self.picam2.set_controls({"ScalerCrop": (820, 616, 1640, 1232)})
        self.picam2.start()

        self.cloudinary_manager = CloudinaryUploader.CloudinaryUploader()

        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.images_dir = os.path.join(base_dir, "temporary_images")
        os.makedirs(self.images_dir, exist_ok=True)

    def capture_image(self):
        """
        Capture a single image from the camera and save it locally.
        
        Process:
        1. Wait 0.2 seconds for camera stabilization
        2. Capture image array in BGR format
        3. Convert BGR to RGB for proper color representation
        4. Save image locally as 'current_image.jpg'
        5. Return RGB array for immediate processing
        
        Returns:
            numpy.ndarray: RGB image array for waste classification
        """
        time.sleep(0.2)
        frame_bgr = self.picam2.capture_array("main")
        frame_rgb = frame_bgr[..., ::-1]

        im = Image.fromarray(frame_rgb)
        im.save(os.path.join(self.images_dir, "current_image.jpg"))

        return frame_rgb

    def upload_image_to_cloudinary(self, bin_id, predicted_label, confidence, timestamp=None):
        """
        Upload the captured image to Cloudinary cloud storage.
        
        This method is typically called for wrong classifications or low confidence
        predictions to maintain a record for system improvement.
        
        Args:
            bin_id (str): Unique identifier of the recycling bin
            predicted_label (str): AI model's predicted waste type
            confidence (float): Confidence score of the prediction (0.0-1.0)
            timestamp (str, optional): Custom timestamp. If None, uses current time.
            
        Returns:
            str or None: Cloudinary image URL if successful, None if no image found
            
        Process:
        1. Generate timestamp if not provided
        2. Check if local image exists
        3. Create descriptive filename with metadata
        4. Upload via temporary file to avoid file locking issues
        5. Return public URL for database storage
        """
        if timestamp is None:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        image_path = os.path.join(self.images_dir, "current_image.jpg")
        if not os.path.exists(image_path):
            print("No image found to upload.")
            return None

        image = Image.open(image_path)
        filename = f"{bin_id}_{predicted_label}_{confidence}_{timestamp}.jpg"

        # Use a temporary file for upload
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=True) as tmp_file:
            image.save(tmp_file.name)
            image_url = self.cloudinary_manager.upload_image(
                local_path=tmp_file.name,
                label=predicted_label,
                bin_id=bin_id,
                confidence=confidence,
                timestamp=timestamp
            )

            print(f"Uploaded {filename} to Cloudinary")

        return image_url

    def __del__(self):
        """
        Destructor method to properly clean up camera resources.
        
        Ensures the camera preview is stopped when the CameraManager
        object is destroyed to prevent resource leaks and camera conflicts.
        This is important for the Raspberry Pi's limited resources.
        """
        # Stop the camera preview before exiting
        self.picam2.stop_preview()
