
import { RefreshCw } from "lucide-react";
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
  onBack
}: TimeoutErrorProps) {
  return (
    <Card className="border-none shadow-lg">
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <RefreshCw className="h-10 w-10 text-amber-500 mb-4 animate-spin" />
          <h2 className="text-xl font-bold mb-2">
            {forceRefreshing ? "Recarregando página..." : "Carregamento prolongado"}
          </h2>
          <p className="text-gray-600 mb-4">
            {forceRefreshing 
              ? "Aguarde enquanto a página é recarregada..." 
              : "O carregamento está demorando mais do que o esperado. Você pode aguardar mais um pouco ou tentar novamente."}
          </p>
          <div className="space-y-2 w-full max-w-md">
            {!forceRefreshing && (
              <>
                <Button onClick={onRetry} variant="default" className="w-full">
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
                <p>Tempo: {Date.now() - mountTime}ms</p>
                <p>Autenticado: {authVerified ? 'Sim' : 'Não'}</p>
                <p>Serviços: {services?.length || 0}</p>
                <p>Conexão: {connectionStatus}</p>
                <p>Default Sector: {defaultSector ? 'Sim' : 'Não'}</p>
                <p>Setor em Edição: {sector ? 'Sim' : 'Não'}</p>
                <p>Erro: {errorMessage || 'Nenhum'}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </Card>
  );
}
