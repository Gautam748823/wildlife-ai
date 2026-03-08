/**
 * frontend/src/pages/Dashboard.jsx
 * ===================================
 * Research dashboard — shows aggregated sighting data from Firestore.
 *
 * Displays:
 *   - Summary stat cards (total sightings, species, endangered count, today's count)
 *   - Sightings table (most recent first)
 *   - TODO: Add Chart.js charts for population trends
 *
 * Data source: GET /api/sightings (FastAPI → Node.js → Firestore)
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import SightingsTable from "../components/SightingsTable";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const [sightings, setSightings] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/sightings`);
      setSightings(data.sightings || []);
    } catch (err) {
      setError("Could not load sightings. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Compute stat card values from sightings data
  const uniqueSpecies  = new Set(sightings.map(s => s.speciesName)).size;
  const today          = new Date().toDateString();
  const todayCount     = sightings.filter(s => new Date(s.createdAt).toDateString() === today).length;
  const endangeredList = ["Snow Leopard", "Bengal Tiger", "Indian Rhinoceros", "Giant Panda"];
  const endangeredCount= sightings.filter(s => endangeredList.includes(s.speciesName)).length;

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Research Dashboard</h1>
        <p style={s.heroSub}>Wildlife sightings monitored via Firestore database</p>
      </div>

      <div style={s.container}>

        {/* Stat Cards */}
        <div style={s.statsGrid}>
          <StatCard title="Total Sightings"   value={sightings.length} color="#2e7d32" />
          <StatCard title="Species Found"     value={uniqueSpecies}    color="#1565c0" />
          <StatCard title="Endangered Spotted" value={endangeredCount} color="#c62828" />
          <StatCard title="Sightings Today"   value={todayCount}       color="#e65100" />
        </div>

        {/* Table */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h3 style={s.tableTitle}>Recent Sightings</h3>
            <button style={s.refreshBtn} onClick={fetchSightings}>🔄 Refresh</button>
          </div>

          {loading && <p style={s.info}>Loading sightings from Firestore...</p>}
          {error   && <p style={s.errorText}>⚠️ {error}</p>}
          {!loading && !error && <SightingsTable sightings={sightings} />}
        </div>

      </div>
    </div>
  );
}

// ── Stat Card component ────────────────────────────────────────────────────
function StatCard({ title, value, color }) {
  return (
    <div style={{ ...s.card, borderTop: `4px solid ${color}` }}>
      <div style={{ ...s.cardValue, color }}>{value}</div>
      <div style={s.cardLabel}>{title}</div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  page:        { minHeight: "100vh", background: "#f0f4ec", fontFamily: "Segoe UI, sans-serif" },
  hero:        { background: "linear-gradient(135deg,#2e7d32,#1b5e20)", color: "#fff", textAlign: "center", padding: "2.5rem 1rem 1.5rem" },
  heroTitle:   { fontSize: "1.8rem", margin: 0 },
  heroSub:     { opacity: 0.85, marginTop: "0.4rem" },
  container:   { maxWidth: 1000, margin: "2rem auto", padding: "0 1rem" },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" },
  card:        { background: "#fff", borderRadius: 12, padding: "1.5rem", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" },
  cardValue:   { fontSize: "2.2rem", fontWeight: 700 },
  cardLabel:   { fontSize: "0.85rem", color: "#888", marginTop: "0.3rem" },
  tableCard:   { background: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  tableTitle:  { color: "#2e7d32", margin: 0 },
  refreshBtn:  { background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer", fontWeight: 600 },
  info:        { color: "#888", textAlign: "center", padding: "2rem" },
  errorText:   { color: "#c62828", padding: "1rem" },
};
