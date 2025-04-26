import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from "react";

export type User = {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  bio?: string | null;
  sports?: string[] | null;
  authProvider?: 'local' | 'auth0';
};

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isSessionChecked: boolean;
  checkSession: () => Promise<void>; // ✨ Expose checkSession manually
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      console.log("🔍 Checking session...");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/session`, {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({ ...userData, authProvider: 'auth0' });
        console.log("✅ Session valid:", userData);
      } else {
        console.warn("⚠️ No active session detected. Clearing user.");
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Error checking session:", error);
      setUser(null);
    } finally {
      setIsSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    checkSession(); // ✅ Only run once on mount
  }, [checkSession]);

  return (
    <UserContext.Provider value={{ user, setUser, isSessionChecked, checkSession }}>
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
