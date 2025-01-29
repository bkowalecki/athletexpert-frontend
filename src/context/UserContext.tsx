import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";

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
  const { isAuthenticated, user: auth0User, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (isAuthenticated && auth0User) {
          const token = await getAccessTokenSilently(); // ✅ Retrieve fresh token

          localStorage.setItem("authToken", token); // ✅ Save token for persistence

          const userData: User = {
            username: auth0User.nickname ?? "Guest",
            email: auth0User.email ?? "no-email@unknown.com",
            firstName: auth0User.given_name ?? "",
            lastName: auth0User.family_name ?? "",
            profilePictureUrl: auth0User.picture ?? "",
            bio: null,
            sports: [],
          };

          setUser(userData);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  return <UserContext.Provider value={{ user, setUser, isAuthenticated }}>{children}</UserContext.Provider>;
};
