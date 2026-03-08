/**
 * frontend/src/App.jsx
 * ======================
 * Root React component. Handles routing between pages.
 *
 * Pages:
 *   /           → Upload   (species identification)
 *   /dashboard  → Dashboard (research charts & sightings table)
 *   /results    → Results  (shown after identification)
 *
 * Install dependencies:
 *   npm install react-router-dom axios
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Upload    from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Results   from "./pages/Results";

import "./styles/main.css";

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>🦁 Wildlife AI</div>
      <div style={styles.navLinks}>
        <NavLink
          to="/"
          style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.activeLink : {}) })}
        >
          Identify Species
        </NavLink>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.activeLink : {}) })}
        >
          Dashboard
        </NavLink>
      </div>
    </nav>
  );
}

// ── App Root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results"   element={<Results />} />
      </Routes>
    </Router>
  );
}

// ── Inline Styles ─────────────────────────────────────────────────────────────
const styles = {
  navbar: {
    background:     "#1b5e20",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "0 2rem",
    height:         "60px",
    boxShadow:      "0 2px 8px rgba(0,0,0,0.3)",
    position:       "sticky",
    top:            0,
    zIndex:         100,
  },
  brand: {
    color:      "#fff",
    fontSize:   "1.3rem",
    fontWeight: 700,
  },
  navLinks: {
    display: "flex",
    gap:     "1.5rem",
  },
  navLink: {
    color:          "#a5d6a7",
    textDecoration: "none",
    fontWeight:     500,
    padding:        "0.4rem 0.8rem",
    borderRadius:   "6px",
    transition:     "background 0.2s",
  },
  activeLink: {
    background: "rgba(255,255,255,0.15)",
    color:      "#fff",
  },
};

export default App;
