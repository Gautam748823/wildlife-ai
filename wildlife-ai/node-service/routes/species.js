/**
 * node-service/routes/species.js
 * ================================
 * Firestore CRUD for the `species` collection.
 * Stores conservation info for each identifiable species.
 *
 * Endpoints:
 *   GET  /api/species        → list all species
 *   GET  /api/species/:name  → get one species by common name
 *   POST /api/species        → add a new species (admin only)
 */

const express = require("express");
const { db }  = require("../firestore");

const router     = express.Router();
const COLLECTION = "species";


// GET /api/species
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy("commonName").get();
    const species  = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ species, total: species.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/species/:name
router.get("/:name", async (req, res) => {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where("commonName", "==", req.params.name)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: `Species "${req.params.name}" not found` });
    }

    const doc = snapshot.docs[0];
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/species
router.post("/", async (req, res) => {
  try {
    const { commonName, scientificName, iucnStatus, habitat, description } = req.body;

    if (!commonName) return res.status(400).json({ error: "commonName is required" });

    const docData = {
      commonName, scientificName, iucnStatus, habitat, description,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(docData);
    res.status(201).json({ id: docRef.id, ...docData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
