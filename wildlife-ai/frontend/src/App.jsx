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

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";

import Upload    from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Results   from "./pages/Results";

import "./styles/main.css";

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ theme, onToggleTheme }) {
  return (
    <nav className="top-nav">
      <div className="brand-pill">
        <span className="brand-icon">🦁</span>
        <div>
          <div className="brand-title">Wildlife AI</div>
          <div className="brand-subtitle">Conservation Intelligence</div>
        </div>
      </div>
      <div className="top-nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `top-nav-link${isActive ? " active" : ""}`}
        >
          Identify Species
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `top-nav-link${isActive ? " active" : ""}`}
        >
          Dashboard
        </NavLink>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="route-transition">
      <Routes location={location}>
        <Route path="/" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </div>
  );
}

// ── App Root ─────────────────────────────────────────────────────────────────
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("wildlife_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("wildlife_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <Router>
      <div className="app-shell">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
