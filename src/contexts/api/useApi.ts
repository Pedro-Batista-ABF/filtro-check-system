
import { useContext } from "react";
import { ApiContext } from "./ApiContext";
import { ApiContextType } from "./types";

/**
 * Hook to use the API context
 */
export function useApi(): ApiContextType {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}
