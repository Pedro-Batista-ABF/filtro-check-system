
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector } from '@/types';
import CheckagemFormContent from '@/components/checagem/CheckagemFormContent';

export default function CheckagemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sectors, loading } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sector, setSector] = useState<Sector | null>(null);

  useEffect(() => {
    if (!loading && id) {
      const foundSector = sectors.find(s => s.id === id);
      if (foundSector) {
        setSector(foundSector);
      } else {
        toast.error('Setor não encontrado');
        navigate('/checagem');
      }
    }
  }, [id, sectors, loading, navigate]);

  useEffect(() => {
    document.title = sector ? `Checagem: ${sector.tagNumber}` : 'Checagem de Setor';
  }, [sector]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector || !id) return;
    
    setIsSubmitting(true);
    
    try {
      // Simular a atualização do setor
      // Normalmente aqui teria uma chamada API real
      toast.success('Checagem finalizada com sucesso!');
      navigate('/checagem');
    } catch (error) {
      console.error('Erro ao finalizar checagem:', error);
      toast.error('Erro ao finalizar checagem');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Carregando informações do setor...</p>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!sector) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/checagem')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Card className="p-6">
            <p className="text-center">Setor não encontrado</p>
          </Card>
        </div>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/checagem')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {sector.status === 'checagemFinalPendente' ? 'Pendente de Checagem' : 'Concluído'}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Checagem Final: {sector.tagNumber}
          </h1>
          <p className="text-muted-foreground">
            NF Entrada: {sector.entryInvoice} • Data Entrada: {sector.entryDate ? new Date(sector.entryDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <CheckagemFormContent 
          sector={sector}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </PageLayoutWrapper>
  );
}
