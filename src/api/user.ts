// src/api/user.ts

import api from "./axios";
import type { UserProfile, UserProfileResponse } from "../types/users";

/**
 * Fetch the current authenticated session.
 * Used for UserContext bootstrapping.
 * Returns null if session is invalid/expired.
 */
export async function fetchUserSession(): Promise<any | null> {
  try {
    const { data } = await api.get("/users/session");
    return data;
  } catch (err: any) {
    if (err?.response?.status === 401) {
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
  const { data } = await api.get<UserProfileResponse>("/users/profile");
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
  const { data } = await api.post("/users/login", { email, password });
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
  const { data } = await api.post("/users/register", {
    username,
    email,
    password,
  });
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
  });
};

/**
 * ---- PROFILE MANAGEMENT ----
 */

export const updateUserProfile = async (
  profile: UserProfile
): Promise<UserProfile> => {
  const { data } = await api.put<UserProfile>("/users/profile", profile);
  return data;
};

/**
 * ---- ACCOUNT ----
 */

export const deleteUserAccount = async (): Promise<void> => {
  await api.delete("/users/delete");
};
