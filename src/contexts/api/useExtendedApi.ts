
import { useContext } from "react";
import { ApiContextExtended } from "./ApiContextExtendedProvider";
import type { ApiContextExtendedType } from "./types";

/**
 * Hook to use the extended API context
 */
export function useExtendedApi(): ApiContextExtendedType {
  const context = useContext(ApiContextExtended);
  if (!context) {
    throw new Error("useExtendedApi must be used within ApiContextExtendedProvider");
  }
  return context;
}
