/**
 * frontend/src/pages/Upload.jsx
 * ==============================
 * Image upload page — the main entry point for species identification.
 *
 * Flow:
 *   1. User selects / drags & drops a wildlife image
 *   2. Enters location (optional)
 *   3. Clicks "Identify Species"
 *   4. Image POSTed to FastAPI /api/predict
 *   5. On success → navigate to /results with prediction data
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Upload() {
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [location,   setLocation]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [dragActive, setDragActive] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  // ── File selection ────────────────────────────────────────────────────────
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }
    setFile(selectedFile);
    setError("");
    setPreview(URL.createObjectURL(selectedFile));
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragActive(true);  };
  const onDragLeave = ()  => setDragActive(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file) { setError("Please select an image first."); return; }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file",     file);
    formData.append("location", location || "Unknown");

    try {
      const { data } = await axios.post(`${API_BASE}/api/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/results", { state: { result: data } });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        `Could not connect to the backend at ${API_BASE}. Make sure the server is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Wildlife Species Identifier</h1>
        <p style={s.heroSub}>Upload a camera trap or field photo — AI identifies the species instantly</p>
      </div>

      {/* Card */}
      <div style={s.card}>

        {/* Drop Zone */}
        {!preview ? (
          <div
            style={{ ...s.dropZone, ...(dragActive ? s.dropZoneActive : {}) }}
            onClick={() => inputRef.current.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div style={s.dropIcon}>📸</div>
            <p style={s.dropText}>Drag & drop your image here</p>
            <p style={s.dropSub}>or click to browse</p>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onInputChange} />
          </div>
        ) : (
          <div style={s.previewWrap}>
            <img src={preview} alt="Preview" style={s.previewImg} />
            <button style={s.removeBtn} onClick={() => { setFile(null); setPreview(null); }}>
              ✕ Remove
            </button>
          </div>
        )}

        {/* Location input */}
        <input
          style={s.input}
          type="text"
          placeholder="📍 Location (e.g., Sundarbans, India)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {/* Error */}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {/* Submit */}
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? "🔍 Analysing..." : "🔍 Identify Species"}
        </button>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page:         { minHeight: "100vh", background: "#f0f4ec", fontFamily: "Segoe UI, sans-serif" },
  hero:         { background: "linear-gradient(135deg,#2e7d32,#1b5e20)", color: "#fff", textAlign: "center", padding: "3rem 1rem 2rem" },
  heroTitle:    { fontSize: "2rem", margin: 0 },
  heroSub:      { opacity: 0.85, marginTop: "0.5rem" },
  card:         { maxWidth: 600, margin: "2rem auto", background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  dropZone:     { border: "2.5px dashed #4caf50", borderRadius: 12, padding: "2.5rem", textAlign: "center", cursor: "pointer", transition: "background 0.2s" },
  dropZoneActive:{ background: "#f1f8e9" },
  dropIcon:     { fontSize: "3rem" },
  dropText:     { fontWeight: 600, color: "#2e7d32", margin: "0.5rem 0" },
  dropSub:      { color: "#888", fontSize: "0.85rem" },
  previewWrap:  { textAlign: "center", marginBottom: "1rem" },
  previewImg:   { maxWidth: "100%", maxHeight: 260, borderRadius: 10, border: "2px solid #c8e6c9" },
  removeBtn:    { marginTop: "0.5rem", background: "none", border: "1px solid #ccc", borderRadius: 6, padding: "0.3rem 0.8rem", cursor: "pointer", color: "#666" },
  input:        { width: "100%", padding: "0.7rem 1rem", border: "1.5px solid #c8e6c9", borderRadius: 8, fontSize: "0.95rem", margin: "1rem 0", boxSizing: "border-box", outline: "none" },
  errorBox:     { background: "#fff3e0", border: "1px solid #ffb74d", borderRadius: 8, padding: "0.7rem 1rem", color: "#e65100", marginBottom: "1rem" },
  btn:          { width: "100%", padding: "0.9rem", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 10, fontSize: "1.05rem", fontWeight: 600, cursor: "pointer" },
};
