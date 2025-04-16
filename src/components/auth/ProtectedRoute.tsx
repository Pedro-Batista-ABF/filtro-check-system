
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, refreshAuthSession } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { hasActiveSession, logSessionDetails } from "@/utils/sessionUtils";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [sessionRefreshAttempted, setSessionRefreshAttempted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("ProtectedRoute: Verificando autenticação...");
        
        // Primeiro tentar obter a sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        // Logar detalhes da sessão para diagnóstico
        await logSessionDetails();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          
          if (!sessionRefreshAttempted) {
            console.log("ProtectedRoute: Tentando atualizar sessão...");
            const refreshed = await refreshAuthSession();
            setSessionRefreshAttempted(true);
            
            if (refreshed) {
              // Se a sessão foi atualizada com sucesso, verificar novamente
              console.log("ProtectedRoute: Sessão atualizada, verificando novamente...");
              checkAuth();
              return;
            }
          }
          
          setIsUserAuthenticated(false);
          toast.error("Erro de autenticação", {
            description: "Ocorreu um erro ao verificar sua sessão. Por favor, faça login novamente."
          });
          navigate('/login');
          return;
        }
        
        // Se temos uma sessão válida, o usuário está autenticado
        if (data.session) {
          console.log("ProtectedRoute: Sessão válida encontrada, expira em:", 
            new Date(data.session.expires_at * 1000).toLocaleString());
          
          // Verificar se a sessão está próxima de expirar (menos de 5 minutos)
          const expiresAt = data.session.expires_at * 1000;
          const now = Date.now();
          const timeToExpire = expiresAt - now;
          
          if (timeToExpire < 300000) { // 5 minutos
            console.warn("ProtectedRoute: Sessão próxima de expirar, renovando...");
            await refreshAuthSession();
          }
          
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
    
    // Configurar verificação periódica da sessão
    const intervalId = setInterval(async () => {
      const sessionActive = await hasActiveSession();
      if (!sessionActive && (isUserAuthenticated || isAuthenticated)) {
        console.warn("ProtectedRoute: Sessão expirada detectada durante verificação periódica");
        toast.error("Sessão expirada", {
          description: "Sua sessão expirou. Por favor, faça login novamente."
        });
        navigate('/login');
      }
    }, 120000); // Verificar a cada 2 minutos
    
    return () => clearInterval(intervalId);
    
  }, [navigate, sessionRefreshAttempted]);

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
