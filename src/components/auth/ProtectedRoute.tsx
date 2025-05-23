
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Se não está mais carregando, podemos parar de verificar
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  // Se ainda está verificando, mostra uma tela de carregamento
  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Verificando autenticação...</div>
      </div>
    );
  }

  // Se não houver usuário autenticado, redireciona para a página de login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se o usuário estiver autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
