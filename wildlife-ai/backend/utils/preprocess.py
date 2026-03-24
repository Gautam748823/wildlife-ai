"""Image preprocessing and validation helpers for inference."""

from __future__ import annotations

import io
from pathlib import Path
from typing import Tuple

from PIL import Image, UnidentifiedImageError
from torchvision import transforms

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}

INFERENCE_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)


def validate_image_metadata(filename: str, content_type: str) -> None:
    if not filename:
        raise ValueError("Filename is missing")

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Only JPG and PNG files are supported")

    if content_type and content_type.lower() not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Invalid content type. Expected image/jpeg or image/png")


def validate_image_bytes(image_bytes: bytes) -> Tuple[int, int]:
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.verify()

        with Image.open(io.BytesIO(image_bytes)) as img:
            width, height = img.size
            if width < 20 or height < 20:
                raise ValueError("Image is too small for reliable inference")
            return width, height
    except UnidentifiedImageError as exc:
        raise ValueError("Uploaded file is not a valid image") from exc
    except OSError as exc:
        raise ValueError("Uploaded image appears corrupted") from exc
