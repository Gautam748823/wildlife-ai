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
      <p className="notice-muted">
        No sightings recorded yet. Upload a wildlife image to get started!
      </p>
    );
  }

  return (
    <div className="table-scroll">
      <table className="sightings-table">
        <thead>
          <tr>
            {["#", "Species", "Confidence", "Location", "Date & Time", "Image", "IUCN Status"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sightings.map((sighting, i) => {
            const species = sighting.speciesName || sighting.predicted_species || "Unknown";
            const confidenceValue = Number(sighting.confidence ?? 0);
            const imageUrl = sighting.imageUrl || sighting.image_url || "";
            const createdAt = sighting.createdAt || sighting.timestamp_client;
            const iucnCode = sighting.iucnStatus || sighting.iucn_status;
            const iucn = IUCN_COLORS[iucnCode] || IUCN_COLORS.LC;

            return (
              <tr key={sighting.id || i}>
                <td>{i + 1}</td>
                <td className="species-cell">{species}</td>
                <td>{`${confidenceValue.toFixed(1)}%`}</td>
                <td>{sighting.location || "Unknown"}</td>
                <td>
                  {createdAt
                    ? new Date(createdAt).toLocaleString()
                    : "—"}
                </td>
                <td>
                  {imageUrl ? (
                    <a href={imageUrl} target="_blank" rel="noreferrer" className="table-link">View</a>
                  ) : "—"}
                </td>
                <td>
                  {iucnCode ? (
                    <span className="iucn-tag" style={{ background: iucn.bg, color: iucn.color }}>
                      {iucnCode}
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
