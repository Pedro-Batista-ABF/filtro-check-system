
import { WifiOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfflineWarningProps {
  onRetryConnection?: () => void;
}

export default function OfflineWarning({ onRetryConnection }: OfflineWarningProps) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <WifiOff className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> 
                Modo offline ativado
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Você está trabalhando no modo offline. Suas alterações serão salvas localmente,
                mas não serão sincronizadas com o servidor até que a conexão seja restaurada.
              </p>
            </div>
            {onRetryConnection && (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={onRetryConnection}
              >
                Tentar reconectar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
