/**
 * frontend/src/components/UploadCard.jsx
 * =========================================
 * Reusable upload card component (can be embedded in any page).
 * Wraps the drag-and-drop image input with preview functionality.
 *
 * Props:
 *   onFileSelected(file) — called when user selects a valid image
 */

import React, { useRef, useState } from "react";

export default function UploadCard({ onFileSelected }) {
  const [preview,    setPreview]    = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    onFileSelected?.(file);
  };

  return (
    <div>
      {!preview ? (
        <div
          style={{ ...s.zone, ...(dragActive ? s.zoneActive : {}) }}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <div style={{ fontSize: "3rem" }}>📸</div>
          <p style={{ fontWeight: 600, color: "#2e7d32", margin: "0.5rem 0" }}>Drop your image here</p>
          <p style={{ color: "#888", fontSize: "0.85rem" }}>or click to browse</p>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <img src={preview} alt="Preview" style={s.preview} />
          <br />
          <button style={s.removeBtn} onClick={() => { setPreview(null); onFileSelected?.(null); }}>
            ✕ Remove image
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  zone:       { border: "2.5px dashed #4caf50", borderRadius: 12, padding: "2.5rem", textAlign: "center", cursor: "pointer" },
  zoneActive: { background: "#f1f8e9" },
  preview:    { maxWidth: "100%", maxHeight: 260, borderRadius: 10, border: "2px solid #c8e6c9" },
  removeBtn:  { marginTop: "0.5rem", background: "none", border: "1px solid #ccc", borderRadius: 6, padding: "0.3rem 0.8rem", cursor: "pointer", color: "#666" },
};
