
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("ProtectedRoute: Verificando autenticação...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setIsUserAuthenticated(false);
          toast.error("Erro de autenticação", {
            description: "Ocorreu um erro ao verificar sua sessão. Por favor, faça login novamente."
          });
          navigate('/login');
          return;
        }
        
        // Se temos uma sessão válida, o usuário está autenticado
        if (data.session) {
          console.log("ProtectedRoute: Sessão válida encontrada");
          setIsUserAuthenticated(true);
        } else {
          console.log("ProtectedRoute: Nenhuma sessão encontrada");
          setIsUserAuthenticated(false);
          navigate('/login');
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setIsUserAuthenticated(false);
        navigate('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    
  }, [navigate]);

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
    return <Navigate to="/login" replace />;
  }

  // Return children if authenticated
  console.log("Usuário autenticado, renderizando conteúdo protegido");
  return <>{children}</>;
};

export default ProtectedRoute;
