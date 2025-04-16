
import { Wifi, WifiOff, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ConnectionStatusProps {
  status: 'checking' | 'online' | 'offline';
  onRetryConnection?: () => void;
}

export default function ConnectionStatus({ status, onRetryConnection }: ConnectionStatusProps) {
  const [lastStatusChange, setLastStatusChange] = useState(Date.now());
  
  // Rastrear mudanças de status para animar a transição
  useEffect(() => {
    setLastStatusChange(Date.now());
  }, [status]);
  
  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        status === 'online' ? 'bg-green-100 text-green-800' : 
        status === 'offline' ? 'bg-red-100 text-red-800' : 
        'bg-yellow-100 text-yellow-800'
      }`}>
        {status === 'online' ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            Conectado
          </>
        ) : status === 'offline' ? (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Desconectado
          </>
        ) : (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Verificando
          </>
        )}
      </div>
      
      {(status === 'offline' || (status === 'checking' && Date.now() - lastStatusChange > 5000)) && onRetryConnection && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs" 
          onClick={onRetryConnection}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reconectar
        </Button>
      )}
    </div>
  );
}
