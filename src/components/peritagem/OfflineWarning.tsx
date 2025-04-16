
import { WifiOff } from "lucide-react";

export default function OfflineWarning() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <WifiOff className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Você está trabalhando no modo offline. Suas alterações serão salvas localmente,
            mas não serão sincronizadas com o servidor até que a conexão seja restaurada.
          </p>
        </div>
      </div>
    </div>
  );
}
