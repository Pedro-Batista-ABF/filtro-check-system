
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
        
        if (session) {
          console.log("Sessão válida encontrada:", session.user.email);
          setIsUserAuthenticated(true);
          
          // Verificar também se o token está válido
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.warn("Token inválido, usuário não encontrado");
            setIsUserAuthenticated(false);
            toast.error("Sessão expirada", {
              description: "Sua sessão expirou. Por favor, faça login novamente."
            });
          }
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
