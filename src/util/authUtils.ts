// src/util/authUtils.ts

import api from "../api/axios";
import type { User } from "../types/users";
import { normalizeUser } from "./userUtils";

export async function loginWithAuth0Token({
  token,
  setUser,
  navigate,
  fallbackRoute = "/auth",
}: {
  token: string;
  setUser: (user: User | null) => void;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  fallbackRoute?: string;
}) {
  try {
    const { data } = await api.post(
      "/users/auth0-login",
      { token },
      { withCredentials: true }
    );

    // Backend may return { user: {...} } or just the user
    const rawUser = (data && (data.user ?? data)) as Partial<User>;
    setUser(normalizeUser(rawUser, { authProvider: "auth0" }));

    navigate("/profile", { replace: true });
  } catch (error) {
    // Keep behavior: fail safe and bounce to auth
    // eslint-disable-next-line no-console
    console.error("❌ Error in loginWithAuth0Token:", error);
    setUser(null);
    navigate(fallbackRoute, { replace: true });
  }
}
