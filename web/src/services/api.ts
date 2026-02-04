import axios from "axios";
import { notifyError } from "../utils/notifications";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 15000
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data;
    const text = typeof detail === "string" ? detail : "Request failed";
    notifyError(text);
    return Promise.reject(error);
  }
);

export default api;
