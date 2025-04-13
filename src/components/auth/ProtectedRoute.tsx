
import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  // Always render children without authentication checks
  return <>{children}</>;
};

export default ProtectedRoute;
