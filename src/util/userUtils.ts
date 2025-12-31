// src/util/userUtils.ts

import type { User } from "../types/users";

type NormalizeOverrides = Partial<Pick<User, "authProvider">> & Partial<User>;

/**
 * Produces a fully valid `User` object (satisfies required fields)
 * while still preserving backend-provided values.
 *
 * IMPORTANT: Defaults here should be "safe" and not accidentally grant privileges.
 */
export function normalizeUser(
  data: Partial<User> | null | undefined,
  overrides?: NormalizeOverrides
): User {
  const d = data ?? {};

  return {
    // Required fields (make TS happy + keep app stable)
    username: d.username ?? "",
    email: d.email ?? "",
    role: d.role ?? "user",
    isActive: d.isActive ?? true,

    // Optional fields + arrays normalized to consistent defaults
    firstName: d.firstName,
    lastName: d.lastName,
    profilePictureUrl: d.profilePictureUrl,
    bio: d.bio ?? null,
    sports: Array.isArray(d.sports) ? d.sports : [],
    authProvider: d.authProvider,
    location: d.location ?? null,
    city: d.city ?? null,
    state: d.state ?? null,
    country: d.country ?? null,
    gender: d.gender ?? null,
    dob: d.dob ?? null,
    favoriteColor: d.favoriteColor ?? null,
    savedBlogIds: Array.isArray(d.savedBlogIds) ? d.savedBlogIds : [],
    savedProductIds: Array.isArray(d.savedProductIds) ? d.savedProductIds : [],

    // Allow callers to override final values (Auth0, etc.)
    ...(overrides ?? {}),
  };
}
