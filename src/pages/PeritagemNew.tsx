
import React, { useEffect, useState } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ConnectionErrorFallback from "@/components/fallback/ConnectionErrorFallback";

export default function PeritagemNew() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    document.title = "Nova Peritagem - Gestão de Recuperação";
    
    // Verificar autenticação
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado para acessar esta página");
      navigate("/login");
    }
    
    // Aqui poderia buscar dados iniciais se necessário
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Simular carregamento inicial
        await new Promise(resolve => setTimeout(resolve, 500));
        // Nenhum erro ocorreu
        setHasError(false);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [isAuthenticated, navigate]);
  
  if (hasError) {
    return (
      <ConnectionErrorFallback 
        message="Erro ao carregar dados iniciais para nova peritagem"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nova Peritagem</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/peritagem')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Este é um componente placeholder para a página de nova peritagem.
              O formulário real seria implementado aqui.
            </p>
            <div className="mt-4">
              <Button onClick={() => navigate('/peritagem/form')}>
                Prosseguir para Formulário
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageLayoutWrapper>
  );
}
