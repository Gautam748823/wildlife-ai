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

import React from "react";
import SightingsTable from "../components/SightingsTable";
import { useSightings } from "../hooks/useSightings";

export default function Dashboard() {
  const { sightings, loading, error, refetch } = useSightings(50);

  // Compute stat card values from sightings data
  const uniqueSpecies  = new Set(
    sightings.map((s) => s.speciesName || s.predicted_species || "Unknown")
  ).size;
  const today          = new Date().toDateString();
  const todayCount     = sightings.filter((s) => new Date(s.createdAt || s.timestamp_client || Date.now()).toDateString() === today).length;
  const endangeredList = ["Snow Leopard", "Bengal Tiger", "Indian Rhinoceros", "Giant Panda"];
  const endangeredCount= sightings.filter((s) =>
    endangeredList.includes(s.speciesName || s.predicted_species || "")
  ).length;

  return (
    <div className="page-shell">
      <div className="hero-banner">
        <p className="hero-kicker">Live Intelligence</p>
        <h1 className="hero-heading">Research Dashboard</h1>
        <p className="hero-text">Monitor sightings, confidence trends, and field activity in real time.</p>
      </div>

      <div className="dashboard-container">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="stats-grid">
            <StatCard title="Total Sightings" value={sightings.length} accentClass="accent-green" />
            <StatCard title="Species Found" value={uniqueSpecies} accentClass="accent-blue" />
            <StatCard title="Endangered Spotted" value={endangeredCount} accentClass="accent-red" />
            <StatCard title="Sightings Today" value={todayCount} accentClass="accent-orange" />
          </div>
        )}

        <div className="glass-panel dashboard-table-panel">
          <div className="dashboard-table-header">
            <h3 className="section-heading">Recent Sightings</h3>
            <button className="btn-secondary btn-compact" onClick={refetch}>🔄 Refresh</button>
          </div>

          {loading && <TableSkeleton />}
          {error && <p className="notice-error">⚠️ {error}</p>}
          {!loading && !error && <SightingsTable sightings={sightings} />}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card component ────────────────────────────────────────────────────
function StatCard({ title, value, accentClass }) {
  return (
    <div className={`stat-card ${accentClass}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="stats-grid">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="stat-card skeleton-card">
          <div className="skeleton skeleton-value" />
          <div className="skeleton skeleton-label" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="table-skeleton">
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
    </div>
  );
}
