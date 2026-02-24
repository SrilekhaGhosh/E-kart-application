export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8001").replace(/\/+$/, "");

export const apiUrl = (path) => {
  const safePath = String(path || "");
  if (!safePath) return API_BASE_URL;
  if (safePath.startsWith("http://") || safePath.startsWith("https://")) return safePath;
  return `${API_BASE_URL}${safePath.startsWith("/") ? "" : "/"}${safePath}`;
};
