
import React from "react";
import { Loader2 } from "lucide-react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Card } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  showTiming?: boolean;
  details?: string;
}

export default function LoadingState({ 
  message = "Carregando...", 
  showTiming = false,
  details
}: LoadingStateProps) {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  
  React.useEffect(() => {
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <PageLayoutWrapper>
      <Card className="border-none shadow-lg">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-xl font-semibold mb-2">{message}</h1>
            {showTiming && (
              <p className="text-sm text-gray-500">
                Tempo decorrido: {elapsedTime} {elapsedTime === 1 ? 'segundo' : 'segundos'}
              </p>
            )}
            {details && (
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                {details}
              </p>
            )}
          </div>
        </div>
      </Card>
    </PageLayoutWrapper>
  );
}
