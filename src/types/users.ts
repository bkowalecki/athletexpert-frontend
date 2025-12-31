// src/types/users.ts

export type AuthProvider = "local" | "auth0";

/**
 * Canonical "logged in user" object used across the app.
 * UserContext should normalize missing values so required fields are always present.
 */
export type User = {
  username: string;
  email: string;

  authProvider?: AuthProvider;

  role: string;
  isActive: boolean;

  firstName?: string;
  lastName?: string;

  profilePictureUrl?: string;
  bio?: string | null;

  sports?: string[];

  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;

  gender?: string | null;
  dob?: string | null;

  favoriteColor?: string | null;

  savedBlogIds?: number[];
  savedProductIds?: number[];
};

/**
 * Editable profile fields (what AccountSettings/Onboarding is concerned with).
 * Keep this limited to "fields you show/edit" so `Record<keyof UserProfile, string>`
 * doesn't break when you add backend-only fields.
 */
export type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;

  bio: string;
  profilePictureUrl: string;

  sports: string[];

  city?: string;
  state?: string;
  country?: string;

  gender?: string;
  dob?: string;

  favoriteColor?: string;
};

/**
 * What the backend commonly returns for GET /users/profile.
 * It may include saved IDs and other fields, so keep it flexible.
 */
export type UserProfileResponse = UserProfile & {
  savedBlogIds?: number[];
  savedProductIds?: number[];
};

/**
 * Some endpoints return a "session wrapper" like:
 * { user: {...}, ... } or just {...}.
 * Keep this type permissive to reduce coupling to backend response shape.
 */
export type UserSessionResponse =
  | { user: Partial<User> }
  | Partial<User>;
