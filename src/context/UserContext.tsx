import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  PropsWithChildren,
} from "react";
import { fetchUserSession } from "../api/user";
import { checkJustLoggedOut } from "../util/sessionUtils";
import type { User } from "../types/users"; // Make sure it's centralized now

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isSessionChecked: boolean;
  checkSession: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

// Optional default user object for fallback/guest mode
// const defaultUser: User = { ... };

export const UserProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  const normalizeUser = (data: any): User => {
    return {
      sports: [],
      savedBlogIds: [],
      savedProductIds: [],
      ...data,
    };
  };

  const checkSession = useCallback(async () => {
    try {
      const userData = await fetchUserSession();

      if (!userData) {
        console.warn("🔒 No valid session. Logging out user.");
        sessionStorage.setItem("sessionExpired", "1");
        setUser(null);
      } else {
        const rawUser = userData.user ?? userData;
        setUser(normalizeUser(rawUser));
      }
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

  return (
    <UserContext.Provider value={{ user, setUser, isSessionChecked, checkSession }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUserContext must be used within a UserProvider");
  return context;
};
