
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sector, Service, Photo, PhotoWithFile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SectorSummary from '@/components/sectors/SectorSummary';
import ExitForm from '@/components/sectors/ExitForm';
import ServicesList from '@/components/sectors/ServicesList';
import { useApi } from '@/contexts/ApiContextExtended';
import { usePhotoService } from '@/services/photoService';
import ServiceChecklist from '@/components/reports/ServiceChecklist';
import { supabase } from '@/integrations/supabase/client';

interface CheckagemFormContentProps {
  sector: Sector;
}

export default function CheckagemFormContent({ sector }: CheckagemFormContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [exitPhotos, setExitPhotos] = useState<PhotoWithFile[]>([]);
  const [updatedSector, setUpdatedSector] = useState<Sector>(sector);
  const [errors, setErrors] = useState({
    exitDate: false,
    exitInvoice: false,
    exitPhotos: false
  });
  const navigate = useNavigate();
  const { updateSector, uploadPhoto } = useApi();
  const photoService = usePhotoService();

  // Initialize photos from sector
  useEffect(() => {
    // Convert afterPhotos from Photo to PhotoWithFile
    const convertedPhotos: PhotoWithFile[] = (sector.afterPhotos || []).map(photo => ({
      ...photo,
      file: undefined
    }));
    setExitPhotos(convertedPhotos);
    setUpdatedSector(sector);
  }, [sector]);

  const handleSectorChange = (updates: Partial<Sector>) => {
    setUpdatedSector(prev => ({ ...prev, ...updates }));
  };

  const handleServiceChange = (serviceId: string, isSelected: boolean) => {
    const updatedServices = updatedSector.services.map(service => 
      service.id === serviceId
        ? { ...service, selected: isSelected, completed: isSelected }
        : service
    );
    setUpdatedSector(prev => ({ ...prev, services: updatedServices }));
  };

  const handlePhotoUpload = async (files: FileList) => {
    try {
      const newPhotos: PhotoWithFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newPhotos.push({
          id: `temp-${Date.now()}-${i}`,
          url: '',
          type: 'after',
          file
        });
      }
      
      setExitPhotos(prev => [...prev, ...newPhotos]);
    } catch (error) {
      console.error('Erro ao processar fotos:', error);
      toast.error('Erro ao processar fotos');
    }
  };

  const handleServicePhotoChange = async (serviceId: string, files: FileList) => {
    try {
      const serviceName = updatedSector.services.find(s => s.id === serviceId)?.name || serviceId;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Upload the file
        const photoUrl = await uploadPhoto(file, `services/${serviceId}`);
        
        // Add to the service photos
        await photoService.updateServicePhotos(
          updatedSector.id,
          serviceId,
          photoUrl,
          'after'
        );
        
        toast.success(`Foto adicionada ao serviço ${serviceName}`);
      }
    } catch (error) {
      console.error('Erro ao fazer upload de foto do serviço:', error);
      toast.error('Erro ao fazer upload da foto');
    }
  };

  const handleSubmit = async () => {
    try {
      // Validar campos obrigatórios
      const newErrors = {
        exitDate: !updatedSector.exitDate,
        exitInvoice: !updatedSector.exitInvoice,
        exitPhotos: exitPhotos.length === 0
      };
      
      if (Object.values(newErrors).some(Boolean)) {
        setErrors(newErrors);
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      
      setIsLoading(true);
      
      // Processar fotos de saída
      const photosToUpload = exitPhotos.filter(photo => photo.file);
      const uploadedPhotos: Photo[] = [];
      
      for (const photo of photosToUpload) {
        if (photo.file) {
          const photoUrl = await uploadPhoto(photo.file, 'exit');
          uploadedPhotos.push({
            id: photo.id,
            url: photoUrl,
            type: 'after'
          });
          
          // Also save to the photos table with metadata
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // Get the latest cycle ID
              const { data: cycleData } = await supabase
                .from('cycles')
                .select('id')
                .eq('sector_id', updatedSector.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
                
              if (cycleData) {
                // Add the photo to the photos table
                await supabase
                  .from('photos')
                  .insert({
                    cycle_id: cycleData.id,
                    service_id: null,
                    url: photoUrl,
                    type: 'after',
                    created_by: user.id,
                    metadata: {
                      sector_id: updatedSector.id,
                      stage: 'checagem',
                      type: 'geral'
                    }
                  });
              }
            }
          } catch (directError) {
            console.error('Erro ao salvar foto na tabela:', directError);
          }
        }
      }
      
      // Combine existing photos (without files) with new uploaded ones
      const allExitPhotos = [
        ...exitPhotos.filter(p => !p.file).map(p => ({
          id: p.id,
          url: p.url,
          type: p.type
        })),
        ...uploadedPhotos
      ];
      
      // Atualizar o setor com os dados da checagem
      const sectorToUpdate = {
        ...updatedSector,
        afterPhotos: allExitPhotos,
        status: 'checagemCompleta',
        checagemDate: new Date().toISOString().split('T')[0]
      };
      
      // Update sector in database
      await updateSector(updatedSector.id, sectorToUpdate);
      
      toast.success('Checagem concluída com sucesso');
      navigate('/checagem');
    } catch (error) {
      console.error('Erro ao salvar checagem:', error);
      toast.error('Erro ao salvar checagem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectorSummary sector={updatedSector} />
      
      <Card>
        <CardHeader>
          <CardTitle>Serviços Executados</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceChecklist services={updatedSector.services} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fotos de Serviços - Depois da Execução</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Adicione fotos para cada serviço executado. Essas fotos serão comparadas com as fotos 
            da peritagem para documentar a recuperação.
          </p>
          
          <div className="space-y-4">
            {updatedSector.services
              .filter(service => service.selected)
              .map(service => (
                <div key={service.id} className="border p-4 rounded-md">
                  <h3 className="font-medium">{service.name}</h3>
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">
                      Fotos do Serviço (DEPOIS)*
                    </label>
                    <div className="mt-1">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleServicePhotoChange(service.id, e.target.files);
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-gray-100 file:text-gray-700
                          hover:file:bg-gray-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados de Saída</CardTitle>
        </CardHeader>
        <CardContent>
          <ExitForm
            sector={updatedSector}
            onChange={handleSectorChange}
            onPhotoUpload={handlePhotoUpload}
            exitPhotos={exitPhotos}
            errors={errors}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/checagem')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : "Concluir Checagem"}
        </Button>
      </div>
    </div>
  );
}
