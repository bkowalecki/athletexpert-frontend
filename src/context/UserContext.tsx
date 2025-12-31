import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  PropsWithChildren,
} from "react";
import { fetchUserSession } from "../api/user";
import { checkJustLoggedOut } from "../util/sessionUtils";
import type { User } from "../types/users";

/**
 * Normalizes partial or backend-provided user data
 * into a safe, fully-shaped User object.
 * Kept outside the component to avoid re-creation on each render.
 */
const normalizeUser = (data: Partial<User> | null | undefined): User => {
  const d = data ?? {};
  return {
    username: d.username ?? "",
    email: d.email ?? "",
    role: d.role ?? "user",
    isActive: d.isActive ?? true,

    authProvider: d.authProvider,

    firstName: d.firstName,
    lastName: d.lastName,
    profilePictureUrl: d.profilePictureUrl,
    bio: d.bio ?? null,

    sports: Array.isArray(d.sports) ? d.sports : [],
    location: d.location ?? null,
    city: d.city ?? null,
    state: d.state ?? null,
    country: d.country ?? null,
    gender: d.gender ?? null,
    dob: d.dob ?? null,
    favoriteColor: d.favoriteColor ?? null,

    savedBlogIds: Array.isArray(d.savedBlogIds) ? d.savedBlogIds : [],
    savedProductIds: Array.isArray(d.savedProductIds) ? d.savedProductIds : [],
  };
};

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isSessionChecked: boolean;
  checkSession: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const userData = await fetchUserSession();

      if (!userData) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("🔒 No valid session detected.");
        }
        sessionStorage.setItem("sessionExpired", "1");
        setUser(null);
        return;
      }

      const rawUser = (userData as any).user ?? userData;
      setUser(normalizeUser(rawUser));
    } catch (err) {
      console.error("❌ Session check error:", err);
      setUser(null);
    } finally {
      setIsSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    if (checkJustLoggedOut()) {
      setIsSessionChecked(true);
      return;
    }

    checkSession();
  }, [checkSession]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      isSessionChecked,
      checkSession,
    }),
    [user, isSessionChecked, checkSession]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
