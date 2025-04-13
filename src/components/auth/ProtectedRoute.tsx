
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsUserAuthenticated(!!session);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setIsUserAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading when auth is being checked
  if (loading || isCheckingAuth) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated && !isUserAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Return children if authenticated
  console.log("Usuário autenticado, renderizando conteúdo protegido");
  return <>{children}</>;
};

export default ProtectedRoute;
