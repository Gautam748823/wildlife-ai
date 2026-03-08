/**
 * node-service/server.js
 * ========================
 * Node.js microservice that manages all Google Firestore operations.
 * The FastAPI Python backend calls THIS service to read/write data,
 * keeping Firestore logic cleanly separated from AI/ML code.
 *
 * Collections in Firestore:
 *   sightings  — every wildlife identification logged
 *   species    — known species and conservation info
 *   reports    — auto-generated AI wildlife reports
 *
 * Run locally:
 *   node node-service/server.js
 *   (or: npm run node-service from root)
 *
 * Runs on port 5001 by default.
 */

const express    = require("express");
const cors       = require("cors");
const dotenv     = require("dotenv");
const sightingsRouter = require("./routes/sightings");
const speciesRouter   = require("./routes/species");

dotenv.config();

const app  = express();
const PORT = process.env.NODE_PORT || 5001;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/",         (req, res) => res.json({ message: "Wildlife AI Node Service running!", port: PORT }));
app.get("/health",   (req, res) => res.json({ status: "ok" }));

app.use("/api/sightings", sightingsRouter);
app.use("/api/species",   speciesRouter);

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Node Service] Running on http://localhost:${PORT}`);
  console.log(`[Node Service] Firestore project: ${process.env.FIREBASE_PROJECT_ID || "NOT SET — add to .env"}`);
});
