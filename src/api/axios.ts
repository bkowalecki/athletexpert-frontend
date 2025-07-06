// src/api/axios.ts

import axios from "axios";

// Build the base API URL from env vars
const baseURL = process.env.REACT_APP_API_URL;

// Create the axios instance with your base config
const api = axios.create({
  baseURL,
  withCredentials: true, // Send cookies for auth/session by default
  headers: {
    "Content-Type": "application/json",
  },
  // You can add timeout, etc., if needed
  // timeout: 15000,
});

// --- OPTIONAL: Add interceptors for auth, logging, or error handling ---

// Add a response interceptor for global error handling/logging if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Show a toast on error (if you want)
    // import { toast } from "react-toastify";
    // toast.error(error?.response?.data?.message || "API Error");
    // Optionally log error to a monitoring service here

    // Always reject so downstream code knows about the error
    return Promise.reject(error);
  }
);

// --- OPTIONAL: Attach JWT token if you use Auth0 or other JWT-based auth ---

// api.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem("ax_id_token");
//   if (token) config.headers["Authorization"] = `Bearer ${token}`;
//   return config;
// });

export default api;
