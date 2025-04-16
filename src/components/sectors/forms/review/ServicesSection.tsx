
import React from 'react';
import { Service } from '@/types';
import { ServiceCheck } from '../../ServiceCheck';
import QuantityInput from '../../QuantityInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ServicesSectionProps {
  services: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture: (e: React.MouseEvent, serviceId?: string) => void;
  formErrors: {
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
    services?: boolean;
    photos?: boolean;
  };
  photoRequired: boolean;
  servicesWithoutPhotos: string[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  onCameraCapture,
  formErrors,
  photoRequired,
  servicesWithoutPhotos
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Serviços a executar</CardTitle>
        <CardDescription>
          Selecione os serviços necessários e adicione detalhes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formErrors.services && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Selecione pelo menos um serviço
            </AlertDescription>
          </Alert>
        )}
        
        {formErrors.photos && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fotos obrigatórias</AlertTitle>
            <AlertDescription>
              Adicione pelo menos uma foto para cada serviço selecionado: 
              {servicesWithoutPhotos.map(name => <div key={name} className="font-semibold">{name}</div>)}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className={`p-4 border rounded-md ${service.selected ? 'border-primary' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <ServiceCheck
                  service={service}
                  onChange={(checked) => handleServiceChange(service.id, checked)}
                  checked={service.selected || false}
                />
                
                {service.selected && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`quantity-${service.id}`} className="text-sm">
                      Quantidade:
                    </Label>
                    <QuantityInput
                      id={`quantity-${service.id}`}
                      value={service.quantity || 1}
                      onChange={(value) => handleQuantityChange(service.id, value)}
                      min={1}
                      max={100}
                    />
                  </div>
                )}
              </div>
              
              {service.selected && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor={`observations-${service.id}`}>
                      Observações
                    </Label>
                    <Textarea
                      id={`observations-${service.id}`}
                      placeholder="Detalhes sobre este serviço..."
                      value={service.observations || ''}
                      onChange={(e) => handleObservationChange(service.id, e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label className="block mb-2">
                      Fotos do defeito {photoRequired && <span className="text-red-500">*</span>}
                    </Label>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={(e) => e.target.files && handlePhotoUpload(service.id, e.target.files, "before")}
                          multiple
                        />
                        <Button variant="outline" type="button" className="relative">
                          Adicionar Foto
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={(e) => onCameraCapture(e, service.id)}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Usar Câmera
                      </Button>
                      
                      {service.photos && service.photos.length > 0 ? (
                        <span className="text-sm text-green-600">
                          {service.photos.length} foto(s) adicionada(s)
                        </span>
                      ) : (
                        <span className={`text-sm ${photoRequired ? 'text-red-500' : 'text-gray-500'}`}>
                          Nenhuma foto adicionada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
