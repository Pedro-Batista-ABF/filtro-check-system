
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector } from '@/types';
import { toast } from 'sonner';
import SectorFormWrapper from '@/components/sectors/SectorFormWrapper';
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSectorFetch } from '@/hooks/useSectorFetch';

export default function ExecucaoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateSector } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hook to fetch sector data
  const { sector, isLoading, error } = useSectorFetch(id || '');

  useEffect(() => {
    // Set page title
    document.title = sector 
      ? `Execução: Setor ${sector.tagNumber}` 
      : 'Execução de Serviços';

    // Handle errors
    if (error) {
      toast.error('Erro ao carregar dados do setor', {
        description: error
      });
    }
  }, [sector, error]);

  const handleSubmit = async (updatedSector: Sector) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      
      // Mark production as completed
      const result = await updateSector(id, {
        ...updatedSector,
        productionCompleted: true,
        status: 'checagemFinalPendente'
      });
      
      if (result) {
        toast.success('Setor concluído com sucesso!');
        navigate('/execucao');
      } else {
        throw new Error('Falha ao atualizar setor');
      }
    } catch (error) {
      console.error('Erro ao finalizar execução:', error);
      toast.error('Erro ao concluir execução do setor', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center p-12">
          <p>Carregando dados do setor...</p>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!sector && !isLoading) {
    return (
      <PageLayoutWrapper>
        <div className="flex flex-col items-center justify-center p-12">
          <h2 className="text-xl font-semibold mb-4">Setor não encontrado</h2>
          <p className="mb-6">O setor solicitado não foi encontrado ou não está disponível.</p>
          <Button onClick={() => navigate('/execucao')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Execução
          </Button>
        </div>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Execução de Serviços: Setor {sector?.tagNumber}</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/execucao')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {sector && (
          <SectorFormWrapper
            initialSector={sector}
            onSubmit={handleSubmit}
            mode="production"
            isLoading={isSubmitting}
            disableEntryFields={true}
          />
        )}
      </div>
    </PageLayoutWrapper>
  );
}
