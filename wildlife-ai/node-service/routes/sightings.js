/**
 * node-service/routes/sightings.js
 * ==================================
 * Firestore CRUD operations for the `sightings` collection.
 *
 * Endpoints:
 *   POST   /api/sightings        → save a new sighting
 *   GET    /api/sightings        → get all sightings (most recent first)
 *   GET    /api/sightings/:id    → get one sighting by Firestore document ID
 *   DELETE /api/sightings/:id    → delete a sighting
 *
 * Called by:
 *   - FastAPI backend (POST — after AI prediction)
 *   - React frontend (GET — to populate dashboard)
 */

const express = require("express");
const { db }  = require("../firestore");

const router     = express.Router();
const COLLECTION = "sightings";


// ── POST /api/sightings ───────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      speciesName,
      confidence,
      imageUrl,
      location,
      report,
      allPredictions,
    } = req.body;

    if (!speciesName) {
      return res.status(400).json({ error: "speciesName is required" });
    }

    const docData = {
      speciesName,
      confidence:       confidence || 0,
      imageUrl:         imageUrl   || "",
      location:         location   || "Unknown",
      report:           report     || "",
      allPredictions:   allPredictions || [],
      createdAt:        new Date().toISOString(),
      timestamp:        require("firebase-admin").firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTION).add(docData);

    console.log(`[Sightings] Saved sighting ID: ${docRef.id} — ${speciesName}`);
    res.status(201).json({ id: docRef.id, ...docData });

  } catch (err) {
    console.error("[Sightings] POST error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ── GET /api/sightings ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit) || 50;
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const sightings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ sightings, total: sightings.length });

  } catch (err) {
    console.error("[Sightings] GET error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ── GET /api/sightings/:id ────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Sighting not found" });
    }

    res.json({ id: doc.id, ...doc.data() });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── DELETE /api/sightings/:id ─────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ message: `Sighting ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
