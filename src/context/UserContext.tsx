// src/context/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  username: string;
  email: string;
}

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  isSessionChecked: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

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
