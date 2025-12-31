import React, {
  createContext,
  useContext,
  useMemo,
  PropsWithChildren,
} from "react";
import sportsData from "../data/sports.json";

export interface Sport {
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
  sports: readonly Sport[];
}

const SportsContext = createContext<SportsContextType | undefined>(undefined);

// Robust custom hook
export function useSports(): SportsContextType {
  const context = useContext(SportsContext);
  if (!context) {
    throw new Error("useSports must be used within a SportsProvider");
  }
  return context;
}

// Static, immutable sports list (module-level, loaded once)
const SPORTS: readonly Sport[] = Object.freeze(
  sportsData as Sport[]
);

export const SportsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const value = useMemo(
    () => ({ sports: SPORTS }),
    []
  );

  return (
    <SportsContext.Provider value={value}>
      {children}
    </SportsContext.Provider>
  );
};
