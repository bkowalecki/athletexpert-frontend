import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  PropsWithChildren,
} from "react";
import { fetchUserSession } from "../api/user"; // <--- Use this!

export type User = {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  bio?: string | null;
  sports?: string[] | null;
  authProvider?: "local" | "auth0";
  role: string;
  isActive: boolean;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gender?: string | null;
  dob?: string | null;
  favoriteColor?: string | null;
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
      const data = await fetchUserSession();
      setUser(data?.user ?? data ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsSessionChecked(true);
    }
  }, []);

  useEffect(() => {
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
