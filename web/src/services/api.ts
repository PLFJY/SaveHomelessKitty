import axios from "axios";
import { notifyError } from "../utils/notifications";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 15000
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("shk_session");
    if (raw) {
      const session = JSON.parse(raw) as { token?: string };
      if (session.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem("shk_session");
      } catch {
        // ignore
      }
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const detail = error?.response?.data;
    const text = typeof detail === "string" ? detail : "Request failed";
    notifyError(text);
    return Promise.reject(error);
  }
);

export default api;
