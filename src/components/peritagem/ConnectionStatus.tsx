
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ConnectionStatusProps {
  status: 'checking' | 'online' | 'offline';
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
}
