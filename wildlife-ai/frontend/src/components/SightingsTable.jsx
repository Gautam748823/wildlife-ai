/**
 * frontend/src/components/SightingsTable.jsx
 * =============================================
 * Reusable table component that displays wildlife sightings.
 * Used by Dashboard.jsx.
 *
 * Props:
 *   sightings: array of sighting objects from Firestore
 */

import React from "react";

const IUCN_COLORS = {
  CR: { bg: "#ffebee", color: "#c62828", label: "Critically Endangered" },
  EN: { bg: "#fff3e0", color: "#e65100", label: "Endangered" },
  VU: { bg: "#fff9c4", color: "#f57f17", label: "Vulnerable" },
  NT: { bg: "#e3f2fd", color: "#1565c0", label: "Near Threatened" },
  LC: { bg: "#e8f5e9", color: "#2e7d32", label: "Least Concern" },
};

export default function SightingsTable({ sightings }) {
  if (!sightings || sightings.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#aaa", fontStyle: "italic", padding: "2rem" }}>
        No sightings recorded yet. Upload a wildlife image to get started!
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={s.table}>
        <thead>
          <tr>
            {["#", "Species", "Confidence", "Location", "Date & Time", "IUCN Status"].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sightings.map((sighting, i) => {
            const iucn = IUCN_COLORS[sighting.iucnStatus] || IUCN_COLORS.LC;
            return (
              <tr key={sighting.id || i} style={i % 2 === 0 ? s.trEven : {}}>
                <td style={s.td}>{i + 1}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>{sighting.speciesName || "Unknown"}</td>
                <td style={s.td}>{sighting.confidence ? `${sighting.confidence.toFixed(1)}%` : "—"}</td>
                <td style={s.td}>{sighting.location || "—"}</td>
                <td style={s.td}>
                  {sighting.createdAt
                    ? new Date(sighting.createdAt).toLocaleString()
                    : "—"}
                </td>
                <td style={s.td}>
                  {sighting.iucnStatus ? (
                    <span style={{ background: iucn.bg, color: iucn.color, padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
                      {sighting.iucnStatus}
                    </span>
                  ) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  table:  { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th:     { background: "#e8f5e9", color: "#1b5e20", padding: "0.7rem 1rem", textAlign: "left", fontWeight: 600 },
  td:     { padding: "0.7rem 1rem", borderBottom: "1px solid #f5f5f5" },
  trEven: { background: "#fafafa" },
};
