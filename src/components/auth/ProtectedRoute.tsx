
import { Navigate, useLocation } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useApi();
  const location = useLocation();

  // Show loading when auth is being checked
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Return children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
