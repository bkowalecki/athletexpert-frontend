// src/api/axios.ts

import axios, { InternalAxiosRequestConfig } from "axios";

// Set your base URL
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// 🔒 Grab cookie value by name (for CSRF token)
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

// ✅ Create Axios instance
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor to attach CSRF token on mutating requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const csrfToken = getCookie("XSRF-TOKEN");
  const method = config.method?.toLowerCase();
  const needsCsrf = ["post", "put", "delete"].includes(method || "");

  if (csrfToken && needsCsrf) {
    config.headers["X-XSRF-TOKEN"] = csrfToken;
  }

  return config;
});

// ✅ Global response handler (optional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Optional: toast or redirect
      sessionStorage.removeItem("ax_id_token");
      window.location.href = "/auth"; // or use navigate if inside component
    }
    return Promise.reject(err);
  }
);

export default api;
