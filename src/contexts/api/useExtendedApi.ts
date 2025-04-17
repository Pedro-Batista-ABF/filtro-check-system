
import { useContext } from "react";
import { ApiContextExtended } from "./ApiContextExtendedProvider";
import { ApiContextExtendedType } from "./types";

/**
 * Hook to use the extended API context
 */
export function useApi(): ApiContextExtendedType {
  const context = useContext(ApiContextExtended);
  if (!context) {
    throw new Error("useApi must be used within ApiContextExtendedProvider");
  }
  return context;
}
