// src/api/user.ts

import api from "./axios";
import type { UserProfile } from "../types/users";

// Fetch the current user session (for UserContext bootstrapping)
export const fetchUserSession = async () => {
  const { data } = await api.get(`/users/session`, { withCredentials: true });
  return data;
};

// ---- GET USER PROFILE ----
// Optionally type your profile if you have a type (example below).
// interface UserProfile { ... }
export const fetchUserProfile = async () => {
  const { data } = await api.get(`/users/profile`, { withCredentials: true });
  return data;
};

// Login (email/password)
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
    { withCredentials: true }
  );
  return data;
};

// Register
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
    { withCredentials: true }
  );
  return data;
};

// ---- GET SAVED BLOG IDS ----
export const fetchSavedBlogIds = async (): Promise<number[]> => {
  const { data } = await api.get(`/users/profile`, { withCredentials: true });
  // Assumes user profile returns savedBlogIds array.
  return data.savedBlogIds || [];
};

// ---- SAVE OR UNSAVE A BLOG ----
export const toggleSaveBlog = async (
  blogId: number,
  isSaved: boolean
): Promise<void> => {
  await api({
    method: isSaved ? "DELETE" : "POST",
    url: `/users/saved-blogs/${blogId}`,
    withCredentials: true,
  });
};

// ---- EXTRAS (if needed) ----
// You can add more user functions here as you grow (update profile, change password, get notifications, etc).

// Example: Get all saved blogs (full objects, not just IDs)
// export const fetchSavedBlogs = async () => {
//   const { data } = await api.get(`/users/saved-blogs`, { withCredentials: true });
//   return data; // Array of BlogPost objects
// };

// ---- GET SAVED PRODUCT IDS ----
export const fetchSavedProductIds = async (): Promise<number[]> => {
  const { data } = await api.get(`/users/profile`, { withCredentials: true });
  // Assumes user profile returns savedProductIds array.
  return data.savedProductIds || [];
};

// ---- SAVE OR UNSAVE A PRODUCT ----
export const toggleSaveProduct = async (
  productId: number,
  isSaved: boolean
): Promise<void> => {
  await api({
    method: isSaved ? "DELETE" : "POST",
    url: `/users/saved-products/${productId}`,
    withCredentials: true,
  });
};

// ---- UPDATE PROFILE ----
export const updateUserProfile = async (
  profile: UserProfile
): Promise<UserProfile> => {
  const { data } = await api.put("/users/profile", profile, {
    withCredentials: true,
  });
  return data;
};

// ---- DELETE ACCOUNT ----
export const deleteUserAccount = async (): Promise<void> => {
  await api.delete("/users/delete", { withCredentials: true });
};
