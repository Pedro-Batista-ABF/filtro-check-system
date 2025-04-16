
import React from 'react';
import ConnectionErrorFallback from './fallback/ConnectionErrorFallback';
import { useConnectionAuth } from '@/hooks/useConnectionAuth';

interface FallbackRootProps {
  children: React.ReactNode;
}

const FallbackRoot: React.FC<FallbackRootProps> = ({ children }) => {
  const { connectionStatus, handleRetryConnection } = useConnectionAuth();
  
  if (connectionStatus === 'offline') {
    return (
      <ConnectionErrorFallback 
        onRetry={handleRetryConnection}
        message="Não foi possível estabelecer conexão com o servidor. Verifique sua conexão com a internet ou tente novamente mais tarde."
      />
    );
  }
  
  return <>{children}</>;
};

export default FallbackRoot;
