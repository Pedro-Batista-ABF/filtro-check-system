import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer, Edit } from 'lucide-react';
import { ServicesList } from '@/components/services/ServicesList';
import { Service } from '@/types';
import { toast } from 'sonner';
import { ensureUserProfile } from '@/utils/ensureUserProfile';

interface SectorDetailsProps {
  sectorType: 'mechanical' | 'electrical' | 'quality';
}

export default function SectorDetails({ sectorType }: SectorDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorData, setSectorData] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        setLoading(true);
        
        // Ensure user profile exists
        await ensureUserProfile();
        
        // Determine which table to query based on sectorType
        let tableName = '';
        switch (sectorType) {
          case 'mechanical':
            tableName = 'mechanical_evaluations';
            break;
          case 'electrical':
            tableName = 'electrical_evaluations';
            break;
          case 'quality':
            tableName = 'quality_evaluations';
            break;
          default:
            throw new Error('Tipo de setor inválido');
        }
        
        // Fetch the sector data
        const { data, error } = await supabase
          .from(tableName)
          .select('*, equipment:equipments(*)')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Avaliação não encontrada');
        
        setSectorData(data);
        
        // Fetch services for this evaluation
        const { data: servicesData, error: servicesError } = await supabase
          .from('evaluation_services')
          .select('*, service:service_types(*)')
          .eq('evaluation_id', id)
          .eq('sector', sectorType);
        
        if (servicesError) throw servicesError;
        
        // Transform services data to match Service type
        const transformedServices = servicesData.map((item: any) => ({
          id: item.service.id,
          name: item.service.name,
          selected: true,
          type: item.service.id,
          photos: item.photos || [],
          quantity: item.quantity || 1,
          observation: item.observation || ''
        }));
        
        setServices(transformedServices);
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        setError(error.message);
        toast.error('Erro ao carregar dados', {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectorData();
  }, [id, sectorType]);
  
  const handleEdit = () => {
    navigate(`/${sectorType}/edit/${id}`);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">Erro: {error}</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Detalhes da Avaliação - {sectorType === 'mechanical' ? 'Mecânica' : sectorType === 'electrical' ? 'Elétrica' : 'Qualidade'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Informações do Equipamento</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Modelo</p>
                  <p>{sectorData.equipment?.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Número de Série</p>
                  <p>{sectorData.equipment?.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fabricante</p>
                  <p>{sectorData.equipment?.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ano</p>
                  <p>{sectorData.equipment?.year || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Detalhes da Avaliação</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Data da Avaliação</p>
                  <p>{new Date(sectorData.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p>{sectorData.status || 'N/A'}</p>
                </div>
                {sectorData.cycle_outcome && (
                  <div>
                    <p className="text-sm text-gray-500">Resultado do Ciclo</p>
                    <p>{sectorData.cycle_outcome}</p>
                  </div>
                )}
                {sectorData.observation && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Observações</p>
                    <p>{sectorData.observation}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Serviços</h3>
              <Separator className="my-2" />
              {services && services.length > 0 ? (
                <ServicesList 
                  services={services}
                  error={null}
                  photoRequired={false}
                  onServiceChange={() => {/* Not needed in details view */}}
                  onQuantityChange={() => {/* Not needed in details view */}}
                  onObservationChange={() => {/* Not needed in details view */}}
                  onPhotoUpload={() => {/* Not needed in details view */}}
                  editMode={false}
                />
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum serviço selecionado</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
