
import { RefreshCw, AlertTriangle, Clock, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TimeoutErrorProps {
  forceRefreshing: boolean;
  mountTime: number;
  authVerified: boolean;
  services?: any[];
  connectionStatus: 'checking' | 'online' | 'offline';
  defaultSector: any;
  sector: any;
  errorMessage: string | null;
  onRetry: () => void;
  onBack: () => void;
  onRetryConnection?: () => void;
}

export default function TimeoutError({
  forceRefreshing,
  mountTime,
  authVerified,
  services,
  connectionStatus,
  defaultSector,
  sector,
  errorMessage,
  onRetry,
  onBack,
  onRetryConnection
}: TimeoutErrorProps) {
  const elapsedTime = Date.now() - mountTime;
  const elapsedSeconds = Math.floor(elapsedTime / 1000);
  
  return (
    <Card className="border-none shadow-lg">
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          {forceRefreshing ? (
            <RefreshCw className="h-10 w-10 text-amber-500 mb-4 animate-spin" />
          ) : connectionStatus === 'offline' ? (
            <WifiOff className="h-10 w-10 text-red-500 mb-4" />
          ) : (
            <Clock className="h-10 w-10 text-amber-500 mb-4" />
          )}
          
          <h2 className="text-xl font-bold mb-2">
            {forceRefreshing ? "Recarregando página..." : 
             connectionStatus === 'offline' ? "Problemas de conexão" :
             "Carregamento prolongado"}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {forceRefreshing 
              ? "Aguarde enquanto a página é recarregada..." 
              : connectionStatus === 'offline'
              ? "Não conseguimos nos conectar ao servidor. Verifique sua conexão com a internet."
              : `O carregamento está demorando mais do que o esperado (${elapsedSeconds}s). Você pode aguardar mais um pouco ou tentar novamente.`}
          </p>
          
          <div className="space-y-2 w-full max-w-md">
            {!forceRefreshing && (
              <>
                {connectionStatus === 'offline' && onRetryConnection && (
                  <Button onClick={onRetryConnection} variant="default" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Verificar conexão
                  </Button>
                )}
                
                <Button onClick={onRetry} variant={connectionStatus === 'offline' ? "outline" : "default"} className="w-full">
                  Tentar novamente
                </Button>
                
                <Button onClick={onBack} variant="outline" className="w-full">
                  Voltar para Peritagem
                </Button>
              </>
            )}
            
            <details className="mt-4 text-left border p-2 rounded-md">
              <summary className="font-medium cursor-pointer">Informações de diagnóstico</summary>
              <div className="text-xs mt-2 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                <p>Tempo decorrido: {elapsedSeconds}s ({elapsedTime}ms)</p>
                <p>Autenticado: {authVerified ? 'Sim' : 'Não'}</p>
                <p>Serviços: {services?.length || 0}</p>
                <p>Conexão: {connectionStatus}</p>
                <p>Default Sector: {defaultSector ? 'Sim' : 'Não'}</p>
                <p>Setor em Edição: {sector ? 'Sim' : 'Não'}</p>
                <p>Erro: {errorMessage || 'Nenhum'}</p>
                <p>Timestamp atual: {Date.now()}</p>
                <p>Horário atual: {new Date().toISOString()}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </Card>
  );
}
