// src/api/helper.js

export const getImageUrl = (path) => {
  if (!path) {
    return "https://placehold.co/300x200?text=No+Image";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Read from .env → fallback to localhost if not set
  const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendBase}${cleanPath}`;
};