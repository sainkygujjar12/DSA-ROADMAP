import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.match(/\/auth\/(login|google|change-password)/)) {
    window.dispatchEvent(new Event("auth:expired"));
  }
  return Promise.reject(error);
});

export default api;