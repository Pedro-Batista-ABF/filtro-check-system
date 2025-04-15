
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PhotoUpload from "@/components/sectors/PhotoUpload";
import { Sector, Photo, PhotoWithFile, CycleOutcome } from "@/types";
import SectorServices from "@/components/sectors/SectorServices";
import { format } from 'date-fns';
import { useApi } from '@/contexts/ApiContextExtended';
import { toast } from 'sonner';
import { usePhotoService } from '@/services/photoService';
import { supabase } from '@/integrations/supabase/client';

interface CheckagemFormContentProps {
  sector: Sector;
}

export default function CheckagemFormContent({ sector }: CheckagemFormContentProps) {
  const [exitInvoice, setExitInvoice] = useState(sector.exitInvoice || '');
  const [exitDate, setExitDate] = useState(sector.exitDate || format(new Date(), 'yyyy-MM-dd'));
  const [exitObservations, setExitObservations] = useState(sector.exitObservations || '');
  const [photos, setPhotos] = useState<PhotoWithFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    exitInvoice: false,
    exitDate: false,
    photos: false
  });
  
  const navigate = useNavigate();
  const { updateSector, uploadPhoto } = useApi();
  const photoService = usePhotoService();

  // Verifica se todos os serviços selecionados têm fotos "depois"
  const validateServicePhotos = () => {
    if (!sector.services) return true;
    
    // Pegar serviços selecionados
    const selectedServices = sector.services.filter(service => service.selected);
    
    // Verificar se cada serviço tem pelo menos uma foto "depois"
    const servicesWithoutPhotos = selectedServices.filter(service => {
      // Verificar fotos existentes
      const existingAfterPhotos = sector.afterPhotos?.filter(
        photo => photo.serviceId === service.id
      ) || [];
      
      // Verificar novas fotos sendo enviadas
      const newAfterPhotos = photos.filter(
        photo => photo.serviceId === service.id
      );
      
      return existingAfterPhotos.length === 0 && newAfterPhotos.length === 0;
    });
    
    return servicesWithoutPhotos.length === 0;
  };

  const handlePhotoChange = (files: FileList) => {
    const newPhotos: PhotoWithFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`;
      newPhotos.push({
        id: tempId,
        url: '',
        type: 'after',
        file: file
      });
    }
    setPhotos([...photos, ...newPhotos]);
  };

  const handleServicePhotoChange = (serviceId: string, files: FileList) => {
    const newPhotos: PhotoWithFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${serviceId}-${Date.now()}-${i}`;
      newPhotos.push({
        id: tempId,
        url: '',
        type: 'after',
        serviceId: serviceId,
        file: file
      });
    }
    setPhotos([...photos, ...newPhotos]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos do formulário
    const newErrors = {
      exitInvoice: !exitInvoice.trim(),
      exitDate: !exitDate,
      photos: !validateServicePhotos()
    };
    
    setFormErrors(newErrors);
    
    if (newErrors.exitInvoice || newErrors.exitDate || newErrors.photos) {
      toast.error("Formulário incompleto", {
        description: "Preencha todos os campos obrigatórios e adicione fotos para cada serviço."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload de novas fotos
      const uploadedPhotos: Photo[] = [];
      
      for (const photo of photos) {
        if (photo.file) {
          try {
            // Upload da foto
            const url = await uploadPhoto(photo.file, `setores/${sector.id}/after`);
            
            // Criar objeto de foto
            const newPhoto: Photo = {
              id: photo.id,
              url,
              type: 'after',
              serviceId: photo.serviceId
            };
            
            uploadedPhotos.push(newPhoto);
            
            // Salvar foto com metadata no banco
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                // Buscar o ciclo atual
                const { data: cycleData } = await supabase
                  .from('cycles')
                  .select('id')
                  .eq('sector_id', sector.id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();
                  
                if (cycleData) {
                  // Adicionar a foto na tabela photos
                  await supabase
                    .from('photos')
                    .insert({
                      cycle_id: cycleData.id,
                      service_id: photo.serviceId || null,
                      url,
                      type: 'after',
                      created_by: user.id,
                      metadata: {
                        sector_id: sector.id,
                        service_id: photo.serviceId,
                        stage: 'checagem',
                        type: photo.serviceId ? 'servico' : 'geral'
                      }
                    });
                }
              }
            } catch (metadataError) {
              console.error("Erro ao salvar foto com metadata:", metadataError);
            }
            
            // Se a foto está associada a um serviço, salvar no serviço também
            if (photo.serviceId) {
              await photoService.updateServicePhotos(
                sector.id,
                photo.serviceId,
                url,
                'after'
              );
            }
          } catch (uploadError) {
            console.error("Erro ao fazer upload de foto:", uploadError);
          }
        }
      }
      
      // Preparar dados para atualização do setor
      const currentDate = new Date().toISOString();
      const updatedSector = {
        ...sector,
        exitInvoice,
        exitDate,
        exitObservations,
        checagemDate: format(new Date(), 'yyyy-MM-dd'),
        afterPhotos: [...(sector.afterPhotos || []), ...uploadedPhotos],
        status: 'concluido',
        outcome: 'Recuperado' as CycleOutcome,
        updated_at: currentDate
      };
      
      // Atualizar setor
      await updateSector(updatedSector);
      
      // Atualizar diretamente no banco também
      try {
        await supabase
          .from('sectors')
          .update({
            current_status: 'concluido',
            current_outcome: 'Recuperado',
            nf_saida: exitInvoice,
            data_saida: new Date(exitDate).toISOString(),
            updated_at: currentDate
          })
          .eq('id', sector.id);
          
        // Atualizar o ciclo
        const { data: cycleData } = await supabase
          .from('cycles')
          .select('id')
          .eq('sector_id', sector.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (cycleData) {
          await supabase
            .from('cycles')
            .update({
              status: 'concluido',
              outcome: 'Recuperado',
              exit_invoice: exitInvoice,
              exit_date: new Date(exitDate).toISOString(),
              exit_observations: exitObservations,
              checagem_date: new Date().toISOString(),
              updated_at: currentDate
            })
            .eq('id', cycleData.id);
        }
      } catch (dbError) {
        console.error("Erro ao atualizar banco diretamente:", dbError);
      }
      
      toast.success("Checagem concluída com sucesso", {
        description: "O setor foi marcado como concluído."
      });
      
      navigate('/checagem');
    } catch (error) {
      console.error("Erro ao salvar checagem:", error);
      toast.error("Erro ao salvar checagem", {
        description: "Não foi possível concluir a checagem. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Serviços Executados</CardTitle>
        </CardHeader>
        <CardContent>
          <SectorServices services={sector.services || []} readonly={true} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fotos de Execução (Depois)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sector.services && sector.services
            .filter(service => service.selected)
            .map(service => (
              <div key={service.id} className="border p-4 rounded-md">
                <h3 className="font-medium mb-2">{service.name}</h3>
                
                <div className="space-y-2">
                  <Label>Fotos Antes</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {sector.beforePhotos
                      ?.filter(photo => photo.serviceId === service.id)
                      .map(photo => (
                        <div key={photo.id} className="border rounded overflow-hidden h-24">
                          <img 
                            src={photo.url} 
                            alt="Foto antes" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                              target.className = "w-full h-full object-contain bg-gray-100";
                            }}
                          />
                        </div>
                      ))}
                      
                    {sector.beforePhotos?.filter(photo => photo.serviceId === service.id).length === 0 && (
                      <p className="text-sm text-gray-500 col-span-full">Nenhuma foto de antes disponível</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label>Fotos Depois (obrigatório)*</Label>
                  <PhotoUpload
                    photos={[
                      ...photos.filter(p => p.serviceId === service.id),
                      ...(sector.afterPhotos?.filter(p => p.serviceId === service.id) || [])
                    ]}
                    onChange={(files) => handleServicePhotoChange(service.id, files)}
                    disabled={isLoading}
                    title="Adicionar fotos do depois"
                    required={true}
                  />
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fotos Gerais (Depois)</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            photos={[
              ...photos.filter(p => !p.serviceId),
              ...(sector.afterPhotos?.filter(p => !p.serviceId) || [])
            ]}
            onChange={handlePhotoChange}
            disabled={isLoading}
            title="Adicionar fotos gerais do depois"
            required={false}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados de Saída</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exitInvoice" className={formErrors.exitInvoice ? "text-red-500" : ""}>
                Nota Fiscal de Saída*
              </Label>
              <Input
                id="exitInvoice"
                type="text"
                value={exitInvoice}
                onChange={(e) => setExitInvoice(e.target.value)}
                placeholder="Número da Nota Fiscal de Saída"
                disabled={isLoading}
                className={formErrors.exitInvoice ? "border-red-500" : ""}
              />
              {formErrors.exitInvoice && (
                <p className="text-xs text-red-500">Nota Fiscal de Saída é obrigatória</p>
              )}
            </div>
            <div>
              <Label htmlFor="exitDate" className={formErrors.exitDate ? "text-red-500" : ""}>
                Data de Saída*
              </Label>
              <Input
                id="exitDate"
                type="date"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                disabled={isLoading}
                className={formErrors.exitDate ? "border-red-500" : ""}
              />
              {formErrors.exitDate && (
                <p className="text-xs text-red-500">Data de Saída é obrigatória</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="exitObservations">Observações de Saída</Label>
            <Textarea
              id="exitObservations"
              value={exitObservations}
              onChange={(e) => setExitObservations(e.target.value)}
              placeholder="Observações sobre a saída"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>
      
      {formErrors.photos && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md">
          <p className="font-medium">Fotos obrigatórias</p>
          <p className="text-sm">Cada serviço executado precisa ter pelo menos uma foto "depois".</p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/checagem')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Concluir Checagem"}
        </Button>
      </div>
    </form>
  );
}
