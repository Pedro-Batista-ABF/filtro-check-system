
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Sector } from '@/types';
import { Card } from '@/components/ui/card';
import SectorSummary from '@/components/sectors/SectorSummary';
import CheckagemFormContent from '@/components/checagem/CheckagemFormContent';

export default function ChecagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Checagem Final - Gestão de Recuperação';
    
    const loadSector = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const sectorData = await getSectorById(id);
        
        if (sectorData) {
          // Garantir que o setor está com status de produção concluída
          if (sectorData.productionCompleted) {
            setSector(sectorData);
          } else {
            toast.error("Setor não está pronto para checagem", {
              description: "Este setor ainda não foi marcado como concluído pela produção"
            });
            navigate('/checagem');
          }
        } else {
          toast.error("Setor não encontrado");
          navigate('/checagem');
        }
      } catch (error) {
        console.error("Erro ao carregar setor:", error);
        toast.error("Erro ao carregar setor");
      } finally {
        setLoading(false);
      }
    };
    
    loadSector();
  }, [id, getSectorById, navigate]);

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600">Setor não encontrado</h2>
          <p className="text-gray-500 mt-2">O setor solicitado não existe ou não está disponível para checagem.</p>
          <Button variant="outline" onClick={() => navigate('/checagem')} className="mt-4">
            Voltar para Checagem
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/checagem')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Checagem Final</h1>
        </div>
        
        <Card className="p-6">
          <SectorSummary sector={sector} />
        </Card>
        
        <CheckagemFormContent sector={sector} />
      </div>
    </PageLayout>
  );
}
