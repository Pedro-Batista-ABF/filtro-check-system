
import React, { useState } from 'react';
import { Service, Photo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ServicePhotos } from '../../service-parts/ServicePhotos';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ServiceCheckProps {
  service: Service;
  onServiceChange: (service: Service) => void;
  onPhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture: (e: React.MouseEvent, serviceId: string, type: "before" | "after") => void;
  disabled?: boolean;
}

export default function ServiceCheck({
  service,
  onServiceChange,
  onPhotoUpload,
  onCameraCapture,
  disabled = false
}: ServiceCheckProps) {
  const [showBeforePhotos, setShowBeforePhotos] = useState(true);
  
  // Inicializar arrays vazios para evitar erros
  const beforePhotos = service.photos?.filter(p => p.type === 'before') || [];
  const afterPhotos = service.photos?.filter(p => p.type === 'after') || [];
  
  const handleCompletedChange = (checked: boolean) => {
    const updatedService = {
      ...service,
      completed: checked
    };
    onServiceChange(updatedService);
  };
  
  const handleAddAfterPhoto = (serviceId: string, files: FileList) => {
    if (files.length === 0) return;
    
    if (!service.completed) {
      toast.warning("Marque o serviço como concluído antes de adicionar fotos do depois");
      return;
    }
    
    onPhotoUpload(serviceId, files, "after");
  };
  
  const handleCameraCapture = (e: React.MouseEvent, type: "before" | "after") => {
    if (type === "after" && !service.completed) {
      toast.warning("Marque o serviço como concluído antes de adicionar fotos do depois");
      return;
    }
    
    onCameraCapture(e, service.id, type);
  };
  
  const togglePhotosView = () => {
    setShowBeforePhotos(!showBeforePhotos);
  };
  
  const hasBeforePhotos = beforePhotos.length > 0;
  const hasAfterPhotos = afterPhotos.length > 0;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex justify-between">
          <div className="flex items-center">
            <Checkbox
              id={`service-${service.id}`}
              checked={service.completed}
              onCheckedChange={handleCompletedChange}
              disabled={disabled}
              className="mr-2"
            />
            <Label 
              htmlFor={`service-${service.id}`}
              className="cursor-pointer"
            >
              {service.name} ({service.quantity || 1})
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePhotosView}
            disabled={!hasBeforePhotos && !hasAfterPhotos}
          >
            {showBeforePhotos ? "Ver Depois" : "Ver Antes"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showBeforePhotos ? (
            <ServicePhotos
              service={service}
              photoType="before"
              required={false}
              onFileInputChange={() => {}}
              disabled={true}
              onPhotoUpload={onPhotoUpload}
            />
          ) : (
            <ServicePhotos
              service={service}
              photoType="after"
              required={service.completed}
              onFileInputChange={(files) => handleAddAfterPhoto(service.id, files)}
              disabled={disabled || !service.completed}
              onCameraCapture={(e) => handleCameraCapture(e, "after")}
              onPhotoUpload={onPhotoUpload}
            />
          )}
          
          {!showBeforePhotos && !hasAfterPhotos && service.completed && (
            <div className="mt-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleCameraCapture(e, "after")}
                disabled={disabled || !service.completed}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capturar Foto do Depois
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
