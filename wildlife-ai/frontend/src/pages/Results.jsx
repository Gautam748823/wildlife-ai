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
      <div className="page-shell">
        <div className="glass-panel results-panel">
          <p>No results found. Please upload an image first.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>← Go to Upload</button>
        </div>
      </div>
    );
  }

  const predictions = result.predictions || [];
  const top         = predictions[0] || {};
  const topSpecies  = result.top_species || result.topSpecies || top.species || "Unknown";
  const imageUrl    = result.image_url || result.imageUrl || "";
  const confidence  = Number(result.confidence ?? top.confidence ?? 0);
  const iucnStatus  = result.iucn_status || result.iucnStatus;
  const iucnColor   = getIucnColor(iucnStatus);
  const reportText  = result.report || "Report generation is optional and currently not enabled in the API response.";

  return (
    <div className="page-shell">
      <div className="hero-banner">
        <p className="hero-kicker">Prediction Complete</p>
        <h1 className="hero-heading">Identification Results</h1>
        <p className="hero-text">Confidence scores and alternative predictions from your live model.</p>
      </div>

      <div className="glass-panel results-panel">
        <div className="result-top-row">
          {imageUrl && (
            <img src={imageUrl} alt="Sighting" className="result-image" />
          )}
          {!imageUrl && <div className="result-image-placeholder skeleton" />}
          <div className="result-top-info">
            <div className="result-label">🐾 Identified Species</div>
            <h2 className="result-species-name">{topSpecies}</h2>
            <p className="result-confidence">Confidence: {confidence}%</p>
            <div className="confidence-track">
              <div className="confidence-fill" style={{ width: `${confidence}%` }} />
            </div>
            {iucnStatus && (
              <span className="iucn-pill" style={{ background: iucnColor }}>
                IUCN: {iucnStatus}
              </span>
            )}
          </div>
        </div>

        <hr className="ui-divider" />

        <h3 className="section-heading">All Predictions</h3>
        <div className="predictions-list">
          {predictions.length === 0 && (
            <>
              <div className="prediction-row skeleton-row-holder">
                <span className="skeleton skeleton-inline-name" />
                <span className="skeleton skeleton-inline-track" />
                <span className="skeleton skeleton-inline-conf" />
              </div>
              <div className="prediction-row skeleton-row-holder">
                <span className="skeleton skeleton-inline-name" />
                <span className="skeleton skeleton-inline-track" />
                <span className="skeleton skeleton-inline-conf" />
              </div>
            </>
          )}
          {predictions.map((p, i) => (
            <div key={i} className="prediction-row">
              <span className="prediction-name">{i + 1}. {p.species}</span>
              <div className="prediction-track">
                <div className="prediction-fill" style={{ width: `${p.confidence}%` }} />
              </div>
              <span className="prediction-conf">{p.confidence}%</span>
            </div>
          ))}
        </div>

        <hr className="ui-divider" />

        <h3 className="section-heading">🌿 Wildlife Conservation Report</h3>
        <div className="notice-info">{reportText}</div>

        <div className="result-actions">
          <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
            📊 View Dashboard
          </button>
          <button className="btn-primary" onClick={() => navigate("/")}>
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
