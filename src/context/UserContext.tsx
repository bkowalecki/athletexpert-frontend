import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";

export type User = {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  bio?: string | null;
  sports?: string[] | null;
};

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isSessionChecked: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [sessionRequested, setSessionRequested] = useState(false); // ✅ Prevents duplicate calls

  useEffect(() => {
    if (sessionRequested) return; // ✅ Avoids double request on mount
    setSessionRequested(true); // ✅ Set flag to true on first call

    const checkSession = async () => {
      try {
        console.log("🔍 Checking session...");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/session`, {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log("✅ Session valid:", userData);
        } else {
          console.warn("⚠️ No active session");
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Error checking session:", error);
        setUser(null);
      } finally {
        setIsSessionChecked(true);
      }
    };

    checkSession();
  }, []); // ✅ Only run once on mount

  return (
    <UserContext.Provider value={{ user, setUser, isSessionChecked }}>
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
