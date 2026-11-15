import React, { createContext, useContext } from "react";
import { Health, useHealthViewModel } from "./useHealthViewModel";
const HealthContext = createContext<Health | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const health = useHealthViewModel();
  return (
    <HealthContext.Provider value={health}>{children}</HealthContext.Provider>
  );
}

export function useHealth() {
  const health = useContext(HealthContext);
  if (!health) throw Error("HealthMate screens require HealthProvider.");
  return health;
}
