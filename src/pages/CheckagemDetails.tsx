
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSectorFetch } from '@/hooks/useSectorFetch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExitTabContent from '@/components/sectors/forms/quality/ExitTabContent';
import ServicesTabContent from '@/components/sectors/forms/quality/ServicesTabContent';
import { Sector } from '@/types';
import { useApi } from '@/contexts/ApiContextExtended';
import { toast } from 'sonner';
import ConnectionErrorFallback from '@/components/fallback/ConnectionErrorFallback';

export default function CheckagemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sector, fetchSector, error, loading } = useSectorFetch(id);
  const api = useApi();
  
  // Buscar dados do setor ao carregar a página
  useEffect(() => {
    if (id) {
      fetchSector();
    }
  }, [id, fetchSector]);
  
  const handleSaveQualityCheck = async (updatedSector: Partial<Sector>) => {
    if (!id) return;
    
    try {
      // Update sector status
      await api.updateSector(id, {
        ...updatedSector,
        status: 'concluido'
      });
      
      // Mostrar mensagem de sucesso
      toast.success('Checagem final concluída com sucesso!');
      
      // Redirecionar para a lista de checagens
      setTimeout(() => {
        navigate('/checagem');
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar checagem final:', error);
      toast.error('Erro ao salvar checagem final');
    }
  };
  
  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayoutWrapper>
    );
  }
  
  if (error || !sector) {
    return (
      <ConnectionErrorFallback 
        message="Erro ao carregar setor ou setor não encontrado"
        onRetry={() => fetchSector()}
        showHomeButton={true}
        showBackButton={true}
      />
    );
  }
  
  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/checagem')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Checagem Final - {sector?.tagNumber || 'Carregando...'}
            </h1>
          </div>
        </div>
        
        <Tabs defaultValue="services">
          <TabsList>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="exit">Saída</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            {/* @ts-ignore - Vamos ignorar o erro de tipagem temporariamente até que os components sejam corretamente tipados */}
            <ServicesTabContent sector={sector} />
          </TabsContent>
          
          <TabsContent value="exit">
            {/* @ts-ignore - Vamos ignorar o erro de tipagem temporariamente até que os components sejam corretamente tipados */}
            <ExitTabContent 
              sector={sector}
              onSave={handleSaveQualityCheck}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayoutWrapper>
  );
}
