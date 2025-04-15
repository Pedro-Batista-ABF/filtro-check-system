
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector, Photo } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import ReportHeader from '@/components/reports/ReportHeader';
import ServicePhotosList from '@/components/reports/ServicePhotosList';
import ServiceChecklist from '@/components/reports/ServiceChecklist';

export default function SectorReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSector = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          toast.error('Setor não encontrado');
          navigate('/');
          return;
        }
        
        setSector(sectorData);
      } catch (error) {
        console.error('Erro ao carregar setor:', error);
        toast.error('Erro ao carregar dados do setor');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSector();
  }, [id, getSectorById, navigate]);

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-3 text-gray-500">Carregando relatório...</span>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!sector) {
    return (
      <PageLayoutWrapper>
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-gray-700">Setor não encontrado</h2>
          <p className="text-gray-500 mt-2">O setor solicitado não foi encontrado ou não está disponível.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Voltar para o Início
          </Button>
        </div>
      </PageLayoutWrapper>
    );
  }

  // Get all completed services
  const completedServices = sector.services.filter(service => service.selected && service.completed);

  return (
    <PageLayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <ReportHeader sector={sector} showPrint={true} />
        
        <ServiceChecklist services={sector.services} />
        
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Fotos por Serviço</h2>
          
          {completedServices.length > 0 ? (
            completedServices.map(service => (
              <ServicePhotosList
                key={service.id}
                service={service}
                beforePhotos={sector.beforePhotos || []}
                afterPhotos={sector.afterPhotos || []}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum serviço com fotos disponível.
            </p>
          )}
        </div>
        
        <div className="print:hidden flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Button onClick={() => window.print()}>
            Imprimir Relatório
          </Button>
        </div>
      </div>
    </PageLayoutWrapper>
  );
}
