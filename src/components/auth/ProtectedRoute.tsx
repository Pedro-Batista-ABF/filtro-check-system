
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, session } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("ProtectedRoute: Usuário não autenticado, redirecionando para login");
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-gray-500">Verificando autenticação...</p>
      </div>
    );
  }
  
  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !session) {
    console.log("Redirecionando para login: sem autenticação");
    return <Navigate to="/login" replace />;
  }

  // Renderizar conteúdo protegido se autenticado
  return <>{children}</>;
};

export default ProtectedRoute;
