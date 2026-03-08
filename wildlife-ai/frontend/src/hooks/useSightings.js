/**
 * frontend/src/hooks/useSightings.js
 * =====================================
 * Custom React hook for fetching sightings data from the backend.
 *
 * Usage:
 *   const { sightings, loading, error, refetch } = useSightings();
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useSightings(limit = 50) {
  const [sightings, setSightings] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchSightings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/api/sightings?limit=${limit}`);
      setSightings(data.sightings || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load sightings from server.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  return { sightings, loading, error, refetch: fetchSightings };
}
