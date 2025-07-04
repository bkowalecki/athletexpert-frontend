import React, {
  createContext,
  useContext,
  useMemo,
  PropsWithChildren,
} from "react";
import sportsData from "../data/sports.json";

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

const SportsContext = createContext<SportsContextType | undefined>(undefined);

// Robust custom hook
export function useSports(): SportsContextType {
  const context = useContext(SportsContext);
  if (!context) throw new Error("useSports must be used within a SportsProvider");
  return context;
}

export const SportsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // No need for useState since sports never changes (immutable)
  const sports = useMemo(() => sportsData as Sport[], []);
  const value = useMemo(() => ({ sports }), [sports]);
  return (
    <SportsContext.Provider value={value}>{children}</SportsContext.Provider>
  );
};
