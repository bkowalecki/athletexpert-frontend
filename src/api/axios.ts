// src/api/axios.ts

import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";

const baseURL = process.env.REACT_APP_API_URL ?? "http://localhost:8080";

// --- Constants (easy to change later) ---
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
const REQUEST_TIMEOUT_MS = 15_000;

// --- Safe cookie reader ---
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// --- Axios instance ---
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request interceptor: attach CSRF token ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toLowerCase();
  const needsCsrf = method === "post" || method === "put" || method === "delete";

  if (needsCsrf) {
    const csrfToken = getCookie(CSRF_COOKIE_NAME);
    if (csrfToken) {
      config.headers[CSRF_HEADER_NAME] = csrfToken;
    }
  }

  return config;
});

// --- Response interceptor: global auth handling ---
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear any cached auth artifacts
      sessionStorage.removeItem("ax_id_token");

      // Hard redirect keeps behavior consistent outside React tree
      if (typeof window !== "undefined") {
        window.location.assign("/auth");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
