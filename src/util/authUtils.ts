// src/util/authUtils.ts

import api from "../api/axios";
import { User } from "../context/UserContext";

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
    const { data: userData } = await api.post(
      "/users/auth0-login",
      { token },
      { withCredentials: true }
    );

    setUser({ ...userData, authProvider: "auth0" });
    navigate("/profile", { replace: true });
  } catch (error) {
    console.error("❌ Error in loginWithAuth0Token:", error);
    setUser(null); // <- Clear user on error to avoid UI issues
    navigate(fallbackRoute, { replace: true });
  }
}
