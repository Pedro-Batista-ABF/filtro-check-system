
import React, { memo } from 'react';
import { Service } from '@/types';
import ServiceCheckbox from './ServiceCheckbox';
import ServiceQuantity from './service-parts/ServiceQuantity';
import ServicePhotos from './service-parts/ServicePhotos';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ServicesListProps {
  services: Service[];
  error: boolean;
  photoRequired: boolean;
  onServiceChange: (id: string, checked: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onObservationChange: (id: string, observations: string) => void;
  onServicePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  disabled?: boolean;
  readOnly?: boolean;
  onCameraCapture?: (e: React.MouseEvent, serviceId?: string) => void;
}

const ServicesList: React.FC<ServicesListProps> = memo(({
  services,
  error,
  photoRequired,
  onServiceChange,
  onQuantityChange,
  onObservationChange,
  onServicePhotoUpload,
  disabled = false,
  readOnly = false,
  onCameraCapture
}) => {
  // Garantir que services é um array
  const safeServices = Array.isArray(services) ? services : [];

  // Handler para upload de fotos com tratamento de erros
  const handleFileInputChange = (serviceId: string, files: FileList, type: "before" | "after") => {
    try {
      if (!files || files.length === 0) {
        console.log("Nenhum arquivo selecionado");
        return;
      }
      
      console.log(`Upload de foto ${type} para serviço ${serviceId}, ${files.length} arquivos`);
      
      // Verificar tamanho dos arquivos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (file.size > maxSize) {
          toast.error(`Arquivo ${file.name} muito grande (${(file.size/1024/1024).toFixed(1)}MB). Máximo 10MB.`);
          return;
        }
        
        // Verificar tipo do arquivo
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          toast.error(`Tipo de arquivo inválido: ${file.type}. Use JPG ou PNG.`);
          return;
        }
      }
      
      // Chamar o handler de upload
      onServicePhotoUpload(serviceId, files, type);
    } catch (error) {
      console.error("Erro ao processar arquivos:", error);
      toast.error("Erro ao processar arquivos para upload");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">
          Por favor, selecione pelo menos um serviço e adicione uma foto para cada serviço selecionado.
        </div>
      )}

      {safeServices.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
          Nenhum serviço disponível.
        </div>
      ) : (
        <ul className="space-y-4">
          {safeServices.map((service) => (
            <li key={service.id} className="border rounded-md p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <ServiceCheckbox
                    service={service}
                    onServiceChange={onServiceChange}
                    disabled={disabled || readOnly}
                  />
                  
                  <ServiceQuantity
                    service={service}
                    onQuantityChange={onQuantityChange}
                    disabled={disabled || !service.selected}
                  />
                </div>
                
                {service.selected && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`observation-${service.id}`} className="text-sm">
                        Observações
                      </Label>
                      <Textarea
                        id={`observation-${service.id}`}
                        value={service.observations || ""}
                        onChange={(e) => onObservationChange(service.id, e.target.value)}
                        placeholder="Observações sobre este serviço..."
                        className="resize-none"
                        disabled={disabled}
                      />
                    </div>
                    
                    <ServicePhotos
                      service={service}
                      photoType={readOnly ? "after" : "before"}
                      required={photoRequired}
                      onFileInputChange={(files) => handleFileInputChange(service.id, files, readOnly ? "after" : "before")}
                      disabled={!service.selected || disabled}
                      onCameraCapture={onCameraCapture ? (e) => onCameraCapture(e, service.id) : undefined}
                    />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

ServicesList.displayName = 'ServicesList';

export default ServicesList;
