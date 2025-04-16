
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConnectionErrorFallbackProps {
  onRetry?: () => void;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

const ConnectionErrorFallback: React.FC<ConnectionErrorFallbackProps> = ({
  onRetry,
  message = "Não foi possível estabelecer conexão com o servidor.",
  showHomeButton = true,
  showBackButton = true,
  children
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md border-red-100 shadow-lg">
        <CardHeader className="pb-2 border-b border-red-100">
          <CardTitle className="flex items-center text-lg text-red-700">
            <WifiOff className="h-5 w-5 mr-2" />
            Erro de Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-red-50 p-4 rounded-full">
              <WifiOff className="h-12 w-12 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Conexão Interrompida</h3>
              <p className="text-gray-600 text-sm">{message}</p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-left mt-4">
                <p className="text-sm text-yellow-800">
                  Verifique sua conexão com a internet e tente novamente. Se o problema persistir, 
                  o servidor pode estar temporariamente indisponível.
                </p>
              </div>
            </div>
          </div>
          
          {children}
          
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
          <div className="flex gap-2">
            {showBackButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            )}
            {showHomeButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-1" />
                Início
              </Button>
            )}
          </div>
          {onRetry && (
            <Button onClick={onRetry} size="sm" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-1" />
              Tentar Novamente
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConnectionErrorFallback;
