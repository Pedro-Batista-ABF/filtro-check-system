
import React, { useEffect, useState } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ConnectionErrorFallback from "@/components/fallback/ConnectionErrorFallback";

export default function PeritagemNew() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    document.title = "Nova Peritagem - Gestão de Recuperação";
    
    // Verificar autenticação
    if (!authLoading && !isAuthenticated) {
      toast.error("Você precisa estar autenticado para acessar esta página");
      navigate("/login");
      return;
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
    
    if (!authLoading && isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, navigate, authLoading]);
  
  if (authLoading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayoutWrapper>
    );
  }
  
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
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Para iniciar uma nova peritagem, clique no botão abaixo para acessar o formulário.
              </p>
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => navigate('/peritagem/form')} 
                  className="w-full max-w-xs"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Iniciar Peritagem
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageLayoutWrapper>
  );
}
