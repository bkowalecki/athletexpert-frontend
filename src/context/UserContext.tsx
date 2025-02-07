import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

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
  isAuthenticated: boolean;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/session`, {
          withCredentials: true, // ✅ Ensures cookies are sent
        });

        if (response.status === 200) {
          console.log("✅ Session Active:", response.data);
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          console.warn("⚠️ No active session, user is logged out.");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.warn("⚠️ Session check failed, user is logged out.");
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkSession(); // ✅ Always check session on page load
  }, []);

  return <UserContext.Provider value={{ user, setUser, isAuthenticated }}>{children}</UserContext.Provider>;
};
