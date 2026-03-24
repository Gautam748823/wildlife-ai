"""Firestore persistence service via Node.js middleware."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, List

import httpx


class FirestoreSaveError(RuntimeError):
    """Raised when Firestore write fails."""


def _build_payload(
    image_url: str,
    top_species: str,
    confidence: float,
    predictions: List[Dict[str, Any]],
) -> Dict[str, Any]:
    timestamp = datetime.now(timezone.utc).isoformat()

    # Keep both snake_case and legacy camelCase keys for compatibility.
    return {
        "timestamp": timestamp,
        "image_url": image_url,
        "predicted_species": top_species,
        "confidence": confidence,
        "all_predictions": predictions,
        "speciesName": top_species,
        "imageUrl": image_url,
        "allPredictions": predictions,
        "createdAt": timestamp,
    }


async def save_sighting(
    image_url: str,
    top_species: str,
    confidence: float,
    predictions: List[Dict[str, Any]],
) -> Dict[str, Any]:
    node_service_url = os.getenv("NODE_SERVICE_URL", "http://localhost:5001")
    payload = _build_payload(image_url, top_species, confidence, predictions)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(f"{node_service_url}/api/sightings", json=payload)
            response.raise_for_status()
            return response.json()
    except Exception as exc:  # noqa: BLE001
        raise FirestoreSaveError(f"Could not save sighting to Firestore service: {exc}") from exc
