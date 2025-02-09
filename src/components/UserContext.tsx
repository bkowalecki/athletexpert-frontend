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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/session`, {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
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
  }, []);

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
