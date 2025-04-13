
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setIsUserAuthenticated(false);
          toast.error("Erro de autenticação", {
            description: "Ocorreu um erro ao verificar sua sessão. Por favor, faça login novamente."
          });
          return;
        }
        
        // Se temos uma sessão válida, o usuário está autenticado
        if (session) {
          console.log("Sessão válida encontrada");
          setIsUserAuthenticated(true);
        } else {
          console.log("Nenhuma sessão encontrada");
          setIsUserAuthenticated(false);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setIsUserAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    
    // Adicionar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsUserAuthenticated(true);
        } else {
          setIsUserAuthenticated(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading when auth is being checked
  if (loading || isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-gray-500">Verificando autenticação...</p>
      </div>
    );
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
