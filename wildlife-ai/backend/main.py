"""
Wildlife AI — FastAPI Backend Entry Point
==========================================
Handles:
  - Image upload + Cloudinary storage
  - AI species prediction (classifier + detector)
  - Generative AI report creation
  - Delegates database writes to Node.js Firestore service

Run locally:
    uvicorn backend.main:app --reload --port 8000

API docs:
    http://localhost:8000/docs
"""

import os
import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

NODE_SERVICE_URL = os.getenv("NODE_SERVICE_URL", "http://localhost:5001")

# ── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Wildlife AI API",
    description="AI-powered wildlife species identification — Cloudinary + Firestore",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # In production: set to your React app URL
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Wildlife AI API running!", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "node_service": NODE_SERVICE_URL}


@app.post("/api/predict")
async def predict_species(file: UploadFile = File(...), location: str = "Unknown"):
    """
    Full pipeline:
      1. Upload image to Cloudinary
      2. Run AI species prediction
      3. Generate wildlife report via Generative AI
      4. Save sighting to Firestore via Node.js service
      5. Return results to React frontend
    """
    # ── Step 1: Upload to Cloudinary ─────────────────────────────────────
    from backend.utils.cloudinary_upload import upload_image_to_cloudinary
    image_bytes = await file.read()
    cloudinary_result = upload_image_to_cloudinary(image_bytes, file.filename)
    image_url = cloudinary_result.get("secure_url", "")

    # ── Step 2: Run AI Classification ────────────────────────────────────
    from backend.models.classifier import SpeciesClassifier
    clf = SpeciesClassifier(
        model_path=os.getenv("MODEL_PATH", "best_model.pth"),
        class_names_path=os.getenv("CLASS_NAMES_PATH", "class_names.json"),
    )
    predictions = clf.predict_bytes(image_bytes)
    top = predictions[0] if predictions else {"species": "Unknown", "confidence": 0}

    # ── Step 3: Generate Wildlife Report ────────────────────────────────
    from backend.utils.report_generator import generate_report
    report = generate_report(top["species"], top["confidence"], location)

    # ── Step 4: Save sighting to Firestore via Node service ─────────────
    sighting_data = {
        "speciesName": top["species"],
        "confidence":  top["confidence"],
        "imageUrl":    image_url,
        "location":    location,
        "report":      report,
        "allPredictions": predictions,
    }
    try:
        async with httpx.AsyncClient() as client:
            await client.post(f"{NODE_SERVICE_URL}/api/sightings", json=sighting_data)
    except Exception as e:
        print(f"[Warning] Could not save to Firestore: {e}")

    # ── Step 5: Return results ───────────────────────────────────────────
    return {
        "success":     True,
        "topSpecies":  top["species"],
        "confidence":  top["confidence"],
        "imageUrl":    image_url,
        "predictions": predictions,
        "report":      report,
        "location":    location,
    }


@app.get("/api/sightings")
async def get_sightings():
    """Proxy: fetch all sightings from Firestore via Node service."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NODE_SERVICE_URL}/api/sightings")
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Node service unavailable: {e}")


# ── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
