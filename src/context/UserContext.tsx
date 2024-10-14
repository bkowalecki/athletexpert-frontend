import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define the user object structure
interface User {
  username: string;
  email: string;
  bio: string | null; // bio can be null
  sports: string[] | null; // sports can be null or an empty array
  [key: string]: any; // Extend with more fields as needed
}

// Define the shape of the context, including isAuthenticated
interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

// Create the context
export const UserContext = createContext<UserContextProps | undefined>(undefined);

// Define the props for the provider component
interface UserProviderProps {
  children: ReactNode;
}

// UserProvider implementation
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // This isAuthenticated variable will be true when a user is set
  const isAuthenticated = !!user;

  useEffect(() => {
    // Auto-login logic: check for stored token
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.username) {
            // Provide default values for bio and sports if not returned by API
            const userData: User = {
              username: data.username,
              email: data.email,
              bio: data.bio ?? null, // Use nullish coalescing to ensure bio can be null
              sports: data.sports ?? [], // Use nullish coalescing to ensure sports can be an empty array
            };
            setUser(userData);
          } else {
            localStorage.removeItem('authToken'); // Remove invalid token
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken'); // Remove token on error
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};
