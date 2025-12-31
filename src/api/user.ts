// src/api/user.ts

import api from "./axios";
import type { UserProfile, UserProfileResponse } from "../types/users";

const COOKIE_AUTH_CONFIG = { withCredentials: true } as const;

/**
 * Fetch the current authenticated session.
 * Used for UserContext bootstrapping.
 * Returns null if session is invalid/expired.
 */
export async function fetchUserSession(): Promise<any | null> {
  try {
    const { data } = await api.get("/users/session", COOKIE_AUTH_CONFIG);
    return data;
  } catch (err: any) {
    const status = err?.response?.status;

    // Depending on backend config/filter behavior, invalid session may be 401 or 403.
    if (status === 401 || status === 403) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("🕒 Session expired or invalid.");
      }
      return null;
    }

    throw err;
  }
}

/**
 * Fetch the full user profile.
 */
export const fetchUserProfile = async (): Promise<UserProfileResponse> => {
  const { data } = await api.get<UserProfileResponse>(
    "/users/profile",
    COOKIE_AUTH_CONFIG
  );
  return data;
};

/**
 * Login (email/password)
 */
export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { data } = await api.post(
    "/users/login",
    { email, password },
    COOKIE_AUTH_CONFIG
  );
  return data;
};

/**
 * Register new user
 */
export const registerUser = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const { data } = await api.post(
    "/users/register",
    { username, email, password },
    COOKIE_AUTH_CONFIG
  );
  return data;
};

/**
 * ---- SAVED BLOGS ----
 */

export const fetchSavedBlogIds = async (): Promise<number[]> => {
  const profile = await fetchUserProfile();
  return profile.savedBlogIds ?? [];
};

export const toggleSaveBlog = async (
  blogId: number,
  isSaved: boolean
): Promise<void> => {
  await api.request({
    method: isSaved ? "DELETE" : "POST",
    url: `/users/saved-blogs/${blogId}`,
    withCredentials: true,
  });
};

/**
 * ---- SAVED PRODUCTS ----
 */

export const fetchSavedProductIds = async (): Promise<number[]> => {
  const profile = await fetchUserProfile();
  return profile.savedProductIds ?? [];
};

export const toggleSaveProduct = async (
  productId: number,
  isSaved: boolean
): Promise<void> => {
  await api.request({
    method: isSaved ? "DELETE" : "POST",
    url: `/users/saved-products/${productId}`,
    withCredentials: true,
  });
};

/**
 * ---- PROFILE MANAGEMENT ----
 */

export const updateUserProfile = async (
  profile: UserProfile
): Promise<UserProfile> => {
  const { data } = await api.put<UserProfile>(
    "/users/profile",
    profile,
    COOKIE_AUTH_CONFIG
  );
  return data;
};

/**
 * ---- ACCOUNT ----
 */

export const deleteUserAccount = async (): Promise<void> => {
  await api.delete("/users/delete", COOKIE_AUTH_CONFIG);
};
