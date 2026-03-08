"""
backend/api/routes.py
======================
All additional FastAPI route definitions.
These are imported and registered in main.py with prefix /api.

Add new endpoint groups here as the project grows:
  - /api/species    → species database queries
  - /api/reports    → report history
  - /api/dashboard  → aggregated stats
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/species")
def list_species():
    """Return list of all species the model can identify."""
    import json, os
    path = os.getenv("CLASS_NAMES_PATH", "class_names.json")
    try:
        with open(path) as f:
            names = json.load(f)
        return {"species": names, "total": len(names)}
    except FileNotFoundError:
        return {"species": [], "total": 0, "note": "class_names.json not found — run training first"}


@router.get("/dashboard/stats")
def dashboard_stats():
    """
    Aggregated stats for the React dashboard.
    TODO: query Firestore via Node service for real data.
    """
    return {
        "totalSightings":  0,
        "totalSpecies":    0,
        "endangeredCount": 0,
        "todaySightings":  0,
        "note": "Connect to Node service to load real Firestore data",
    }
