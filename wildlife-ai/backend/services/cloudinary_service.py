"""Cloudinary integration service for uploaded wildlife images."""

from __future__ import annotations

import os

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()


class CloudinaryUploadError(RuntimeError):
    """Raised when Cloudinary upload fails."""


def _configure_cloudinary() -> None:
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )


def upload_image(image_bytes: bytes, filename: str) -> str:
    _configure_cloudinary()

    if not os.getenv("CLOUDINARY_CLOUD_NAME"):
        raise CloudinaryUploadError("Cloudinary is not configured. Missing CLOUDINARY_CLOUD_NAME.")

    try:
        public_id = f"sighting_{os.path.splitext(filename)[0]}"
        result = cloudinary.uploader.upload(
            image_bytes,
            folder="wildlife-ai/uploads",
            public_id=public_id,
            overwrite=True,
            resource_type="image",
            tags=["wildlife", "ai", "species-identification"],
        )
        return result["secure_url"]
    except Exception as exc:  # noqa: BLE001
        raise CloudinaryUploadError(f"Cloudinary upload failed: {exc}") from exc
