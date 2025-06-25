import React, { createContext, useContext, useMemo, useState } from "react";
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

const SportsContext = createContext<SportsContextType>({ sports: [] });

export const useSports = () => useContext(SportsContext);

export const SportsProvider: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const [sports] = useState<Sport[]>(sportsData);
  const value = useMemo(() => ({ sports }), [sports]);

  return (
    <SportsContext.Provider value={value}>
      {children}
    </SportsContext.Provider>
  );
});
