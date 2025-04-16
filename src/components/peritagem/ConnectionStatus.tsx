
import { Wifi, WifiOff, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConnectionStatusProps {
  status: 'checking' | 'online' | 'offline';
  onRetryConnection?: () => void;
  showDetails?: boolean;
}

export default function ConnectionStatus({ 
  status, 
  onRetryConnection,
  showDetails = false 
}: ConnectionStatusProps) {
  const [lastStatusChange, setLastStatusChange] = useState(Date.now());
  const [pingTime, setPingTime] = useState<number | null>(null);
  
  // Rastrear mudanças de status para animar a transição
  useEffect(() => {
    setLastStatusChange(Date.now());
  }, [status]);
  
  // Quando estiver online, verificar o tempo de ping periodicamente
  useEffect(() => {
    if (status === 'online') {
      const checkPing = async () => {
        const startTime = Date.now();
        try {
          await fetch('https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/', {
            method: 'HEAD',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4'
            },
            cache: 'no-store',
          });
          setPingTime(Date.now() - startTime);
        } catch {
          setPingTime(null);
        }
      };
      
      checkPing();
      const interval = setInterval(checkPing, 60000); // Verificar a cada minuto
      return () => clearInterval(interval);
    } else {
      setPingTime(null);
    }
  }, [status]);
  
  const statusDisplay = () => {
    return (
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
    );
  };
  
  return (
    <div className="flex items-center gap-2">
      {showDetails && pingTime ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {statusDisplay()}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Ping: {pingTime}ms</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        statusDisplay()
      )}
      
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
