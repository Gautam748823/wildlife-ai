/**
 * frontend/src/pages/Results.jsx
 * ================================
 * Shows species identification results after image upload.
 * Receives data via React Router `location.state` from Upload.jsx.
 *
 * Displays:
 *   - Top species + confidence score + animated bar
 *   - All top-5 predictions
 *   - Cloudinary image (if uploaded)
 *   - AI-generated wildlife report
 *   - Save / Identify Again buttons
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Results() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const result     = state?.result;

  // Guard: if no result data, redirect to upload page
  if (!result) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p>No results found. Please upload an image first.</p>
          <button style={s.btnPrimary} onClick={() => navigate("/")}>← Go to Upload</button>
        </div>
      </div>
    );
  }

  const top         = result.predictions?.[0] || {};
  const confidence  = top.confidence || 0;
  const iucnColor   = getIucnColor(result.iucnStatus);

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Identification Results</h1>
        <p style={s.heroSub}>AI analysis complete — {result.location || "Unknown location"}</p>
      </div>

      <div style={s.card}>

        {/* Image + top result row */}
        <div style={s.topRow}>
          {result.imageUrl && (
            <img src={result.imageUrl} alt="Sighting" style={s.sightingImg} />
          )}
          <div style={s.topInfo}>
            <div style={s.speciesLabel}>🐾 Identified Species</div>
            <h2 style={s.speciesName}>{result.topSpecies || "Unknown"}</h2>
            <p style={s.confText}>Confidence: {confidence}%</p>
            {/* Confidence bar */}
            <div style={s.barTrack}>
              <div style={{ ...s.barFill, width: `${confidence}%` }} />
            </div>
            {result.iucnStatus && (
              <span style={{ ...s.badge, background: iucnColor }}>
                IUCN: {result.iucnStatus}
              </span>
            )}
          </div>
        </div>

        <hr style={s.divider} />

        {/* All predictions */}
        <h3 style={s.sectionTitle}>All Predictions</h3>
        {(result.predictions || []).map((p, i) => (
          <div key={i} style={s.predRow}>
            <span style={s.predName}>{i + 1}. {p.species}</span>
            <div style={s.predTrack}>
              <div style={{ ...s.predFill, width: `${p.confidence}%` }} />
            </div>
            <span style={s.predConf}>{p.confidence}%</span>
          </div>
        ))}

        <hr style={s.divider} />

        {/* Wildlife report */}
        <h3 style={s.sectionTitle}>🌿 Wildlife Conservation Report</h3>
        <div style={s.reportBox}>{result.report || "Report not available."}</div>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.btnSecondary} onClick={() => navigate("/dashboard")}>
            📊 View Dashboard
          </button>
          <button style={s.btnPrimary} onClick={() => navigate("/")}>
            🔄 Identify Another
          </button>
        </div>

      </div>
    </div>
  );
}

// Helper: IUCN status badge colour
function getIucnColor(status) {
  const map = { CR: "#c62828", EN: "#e65100", VU: "#f57f17", NT: "#1565c0", LC: "#2e7d32" };
  return map[status] || "#555";
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page:        { minHeight: "100vh", background: "#f0f4ec", fontFamily: "Segoe UI, sans-serif" },
  hero:        { background: "linear-gradient(135deg,#2e7d32,#1b5e20)", color: "#fff", textAlign: "center", padding: "2.5rem 1rem 1.5rem" },
  heroTitle:   { fontSize: "1.8rem", margin: 0 },
  heroSub:     { opacity: 0.85, marginTop: "0.4rem" },
  card:        { maxWidth: 720, margin: "2rem auto", background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  topRow:      { display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" },
  sightingImg: { width: 200, borderRadius: 12, border: "2px solid #c8e6c9", objectFit: "cover" },
  topInfo:     { flex: 1 },
  speciesLabel:{ fontSize: "0.85rem", color: "#888", marginBottom: "0.3rem" },
  speciesName: { fontSize: "1.8rem", color: "#1b5e20", margin: "0 0 0.3rem" },
  confText:    { color: "#555", margin: "0 0 0.6rem" },
  barTrack:    { background: "#e8f5e9", borderRadius: 50, height: 10, marginBottom: "0.8rem" },
  barFill:     { background: "linear-gradient(90deg,#4caf50,#2e7d32)", height: 10, borderRadius: 50, transition: "width 0.6s ease" },
  badge:       { color: "#fff", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600 },
  divider:     { border: "none", borderTop: "1px solid #f0f0f0", margin: "1.5rem 0" },
  sectionTitle:{ color: "#2e7d32", marginBottom: "0.8rem" },
  predRow:     { display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.5rem", fontSize: "0.9rem" },
  predName:    { width: 180, flexShrink: 0 },
  predTrack:   { flex: 1, background: "#f5f5f5", borderRadius: 4, height: 6 },
  predFill:    { background: "#a5d6a7", height: 6, borderRadius: 4 },
  predConf:    { width: 50, textAlign: "right", color: "#555" },
  reportBox:   { background: "#f9fbe7", borderLeft: "4px solid #4caf50", borderRadius: "0 8px 8px 0", padding: "1rem 1.2rem", fontSize: "0.92rem", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: "1.5rem" },
  actions:     { display: "flex", gap: "1rem", flexWrap: "wrap" },
  btnPrimary:  { flex: 1, padding: "0.8rem", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
  btnSecondary:{ flex: 1, padding: "0.8rem", background: "#e8f5e9", color: "#2e7d32", border: "1.5px solid #a5d6a7", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
};
