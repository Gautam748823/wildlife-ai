"""
backend/utils/cloudinary_upload.py
=====================================
Handles uploading wildlife images to Cloudinary cloud storage.

Every uploaded image is stored with:
  - folder:   wildlife-ai/uploads/
  - tags:     ["wildlife", "camera-trap"]
  - format:   auto-detected (jpg/png/webp)

Returns the Cloudinary response which includes:
  - secure_url  → HTTPS link to the stored image
  - public_id   → Cloudinary asset ID (used for deletion/editing)
  - width/height, format, bytes, etc.

Setup:
    Add to .env:
        CLOUDINARY_CLOUD_NAME=your-cloud-name
        CLOUDINARY_API_KEY=your-api-key
        CLOUDINARY_API_SECRET=your-api-secret
"""

import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary from environment variables
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key    = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure     = True,   # Always use HTTPS
)


def upload_image_to_cloudinary(image_bytes: bytes, filename: str = "wildlife_image") -> dict:
    """
    Upload raw image bytes to Cloudinary.

    Args:
        image_bytes: Raw image data from FastAPI UploadFile.read()
        filename:    Original filename (used as part of public_id)

    Returns:
        Cloudinary upload response dict containing 'secure_url', 'public_id', etc.
    """
    if not os.getenv("CLOUDINARY_CLOUD_NAME"):
        # Return a placeholder so the rest of the pipeline still works during development
        print("[Cloudinary] WARNING: CLOUDINARY_CLOUD_NAME not set in .env — skipping upload")
        return {"secure_url": "", "public_id": "placeholder", "note": "Add Cloudinary credentials to .env"}

    result = cloudinary.uploader.upload(
        image_bytes,
        folder        = "wildlife-ai/uploads",
        public_id     = f"sighting_{filename.rsplit('.', 1)[0]}",
        overwrite     = True,
        resource_type = "image",
        tags          = ["wildlife", "camera-trap", "ai-identified"],
    )

    print(f"[Cloudinary] Uploaded: {result['secure_url']}")
    return result


def delete_image_from_cloudinary(public_id: str) -> dict:
    """Delete an image from Cloudinary by its public_id."""
    return cloudinary.uploader.destroy(public_id)
