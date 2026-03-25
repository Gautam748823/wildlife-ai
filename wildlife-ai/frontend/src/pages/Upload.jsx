/**
 * frontend/src/pages/Upload.jsx
 * ==============================
 * Image upload page — the main entry point for species identification.
 *
 * Flow:
 *   1. User selects / drags & drops a wildlife image
 *   2. Enters location (optional)
 *   3. Clicks "Identify Species"
 *   4. Image POSTed to FastAPI /predict
 *   5. On success → navigate to /results with prediction data
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { predictImage, API_BASE } from "../utils/api";

export default function Upload() {
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
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

    try {
      const data = await predictImage(file);
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
    <div className="page-shell">
      <div className="hero-banner">
        <p className="hero-kicker">Field-Ready AI</p>
        <h1 className="hero-heading">Wildlife Species Identifier</h1>
        <p className="hero-text">Upload a camera trap or field photo and get high-confidence identification in seconds.</p>
      </div>

      <div className="glass-panel upload-panel">

        {!preview ? (
          <div
            className={`upload-dropzone${dragActive ? " active" : ""}`}
            onClick={() => inputRef.current.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="upload-drop-icon">📸</div>
            <p className="upload-drop-title">Drag and drop your wildlife image</p>
            <p className="upload-drop-sub">or click to browse your files</p>
            <div className="upload-chip-row">
              <span className="upload-chip">JPG</span>
              <span className="upload-chip">PNG</span>
              <span className="upload-chip">WEBP</span>
              <span className="upload-chip">Max 10MB</span>
            </div>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onInputChange} />
          </div>
        ) : (
          <div className="upload-preview-wrap">
            <img src={preview} alt="Preview" className="upload-preview-img" />
            <div className="upload-preview-meta">
              <div className="upload-file-name">{file?.name}</div>
              <div className="upload-file-sub">Ready for AI identification</div>
            </div>
            <button className="btn-ghost" onClick={() => { setFile(null); setPreview(null); }}>
              ✕ Remove
            </button>
          </div>
        )}

        {error && <div className="notice-error">⚠️ {error}</div>}

        <button className="btn-primary ui-btn-block" onClick={handleSubmit} disabled={loading}>
          {loading ? "🔍 Analysing..." : "🔍 Identify Species"}
        </button>
      </div>
    </div>
  );
}
