"""FastAPI backend entrypoint for Wildlife AI prediction APIs."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.api.routes import router as api_router
from backend.models.classifier import SpeciesClassifier
from backend.services.cloudinary_service import CloudinaryUploadError, upload_image
from backend.services.firestore_service import FirestoreSaveError, save_sighting
from backend.utils.preprocess import validate_image_bytes, validate_image_metadata

load_dotenv()

NODE_SERVICE_URL = os.getenv("NODE_SERVICE_URL", "http://localhost:5001")
PROJECT_ROOT = Path(__file__).resolve().parents[1]

app = FastAPI(
    title="Wildlife AI API",
    description="Production-ready species identification backend",
    version="2.0.0",
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
allow_origins = [x.strip() for x in allowed_origins.split(",")] if allowed_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _resolve_path_from_env(env_key: str, fallback: str) -> str:
    raw = os.getenv(env_key, fallback)
    path = Path(raw)
    if not path.is_absolute():
        path = PROJECT_ROOT / raw
    return str(path)


@lru_cache(maxsize=1)
def get_classifier() -> SpeciesClassifier:
    model_path = _resolve_path_from_env("MODEL_PATH", "best_model.pth")
    class_names_path = _resolve_path_from_env("CLASS_NAMES_PATH", "class_names.json")
    return SpeciesClassifier(model_path=model_path, class_names_path=class_names_path, architecture="resnet50")


def _build_predict_response(predictions: list[dict], image_url: str) -> dict:
    top = predictions[0] if predictions else {"species": "Unknown", "confidence": 0.0}
    return {
        "top_species": top["species"],
        "confidence": top["confidence"],
        "image_url": image_url,
        "predictions": predictions,
    }


@app.get("/")
def root():
    return {"message": "Wildlife AI API running", "docs": "/docs"}


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "wildlife-ai-backend",
        "node_service": NODE_SERVICE_URL,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Image file is required")

    try:
        validate_image_metadata(file.filename, file.content_type or "")
        image_bytes = await file.read()
        validate_image_bytes(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        image_url = upload_image(image_bytes, file.filename)
    except CloudinaryUploadError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        classifier = get_classifier()
        predictions = classifier.predict_bytes(image_bytes, top_k=5)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Model inference failed: {exc}") from exc

    response = _build_predict_response(predictions, image_url)

    try:
        await save_sighting(
            image_url=image_url,
            top_species=response["top_species"],
            confidence=float(response["confidence"]),
            predictions=response["predictions"],
        )
    except FirestoreSaveError as exc:
        # Preserve successful prediction while reporting persistence issue.
        response["storage_warning"] = str(exc)

    return response


@app.post("/upload")
async def upload_only(file: UploadFile = File(...)) -> dict:
    """Upload image to Cloudinary and return secure URL without model inference."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Image file is required")

    try:
        validate_image_metadata(file.filename, file.content_type or "")
        image_bytes = await file.read()
        validate_image_bytes(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        image_url = upload_image(image_bytes, file.filename)
    except CloudinaryUploadError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {"image_url": image_url}


@app.post("/api/predict")
async def predict_legacy(file: UploadFile = File(...)) -> dict:
    """Backward-compatible alias for clients still using /api/predict."""
    return await predict(file)


@app.get("/api/sightings")
async def list_sightings(limit: int = 50) -> dict:
    """Proxy sightings list from Node Firestore service for frontend dashboard use."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(f"{NODE_SERVICE_URL}/api/sightings", params={"limit": limit})
            response.raise_for_status()
            return response.json()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail=f"Node service unavailable: {exc}") from exc


app.include_router(api_router, prefix="/api", tags=["aux"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
