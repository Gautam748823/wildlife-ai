import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export async function predictImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function getSightings(limit = 50) {
  const { data } = await api.get("/api/sightings", { params: { limit } });
  return data;
}
