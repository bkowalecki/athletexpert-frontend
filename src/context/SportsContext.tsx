import React, { createContext, useContext, useEffect, useState } from "react";
import sportsData from "../data/sports.json"; // Adjust path if needed

interface Sport {
  title: string;
  backgroundImage: string;
  extra_data: {
    category: string;
    type: string;
    popularity: string;
    summary?: string;
  };
}

interface SportsContextType {
  sports: Sport[];
}

const SportsContext = createContext<SportsContextType>({
  sports: [],
});

export const useSports = () => useContext(SportsContext);

export const SportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    // Preload immediately
    setSports(sportsData);
    console.log("✅ Sports data preloaded:", sportsData);
  }, []);

  return (
    <SportsContext.Provider value={{ sports }}>
      {children}
    </SportsContext.Provider>
  );
};
