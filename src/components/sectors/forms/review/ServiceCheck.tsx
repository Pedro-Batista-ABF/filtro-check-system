
import React, { useState } from "react";
import { Service, PhotoWithFile } from "@/types";
import { CheckCircle, AlertTriangle, XCircle, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

interface ServiceCheckProps {
  service: Service;
  quality?: boolean;
  readOnly?: boolean;
  onPhotoChange?: (serviceId: string, photos: File[]) => void;
  onCompletedChange?: (id: string, completed: boolean) => void;
  onObservationChange?: (id: string, observations: string) => void;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

const ServiceCheck: React.FC<ServiceCheckProps> = ({
  service,
  quality = false,
  readOnly = false,
  onPhotoChange,
  onCompletedChange,
  onObservationChange,
  onCameraCapture
}) => {
  const [selectedBefore, setSelectedBefore] = useState<string[]>([]);
  const [observationText, setObservationText] = useState(service.observations || "");

  const beforePhotos = service.photos?.filter(p => p.type === 'before') || [];
  const afterPhotos = service.photos?.filter(p => p.type === 'after') || [];

  const handleAfterPhotosChange = (files: FileList) => {
    if (onPhotoChange && files.length > 0) {
      onPhotoChange(service.id, Array.from(files));
    }
  };

  const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setObservationText(text);
    onObservationChange?.(service.id, text);
  };

  const handleCompletedChange = (checked: boolean) => {
    onCompletedChange?.(service.id, checked);
  };

  // Renderizar fotos
  const renderPhotos = (photos: any[], emptyText: string, className: string = "h-40") => {
    if (!photos || photos.length === 0) {
      return (
        <div className={`flex items-center justify-center bg-gray-100 rounded-md ${className} text-gray-400`}>
          {emptyText}
        </div>
      );
    }

    return (
      <div className={`grid grid-cols-2 gap-2 ${className} overflow-auto p-1`}>
        {photos.map((photo, index) => (
          <div key={photo.id || index} className="relative aspect-square">
            <img 
              src={photo.url} 
              alt={`Foto ${index + 1}`} 
              className="w-full h-full object-cover rounded-md border border-gray-200"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              {quality ? (
                <Checkbox
                  id={`service-${service.id}-completed`}
                  checked={service.completed}
                  onCheckedChange={handleCompletedChange}
                  disabled={readOnly}
                  className="mt-1"
                />
              ) : (
                <CheckCircle className="text-green-500 h-5 w-5 mt-1" />
              )}
              <div>
                <Label
                  htmlFor={`service-${service.id}-completed`}
                  className="font-medium text-base"
                >
                  {service.name}
                </Label>
                {service.quantity && service.quantity > 1 && (
                  <p className="text-sm text-gray-500">
                    Quantidade: {service.quantity}
                  </p>
                )}
                {service.observations && (
                  <p className="text-sm text-gray-600 mt-1">{service.observations}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1 block">Fotos do Defeito</Label>
                {renderPhotos(beforePhotos, "Sem fotos de defeito", "h-40")}
              </div>

              {quality && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-sm">Fotos da Execução</Label>
                    {!readOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7"
                          >
                            <Camera className="h-3.5 w-3.5 mr-1" />
                            Adicionar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              document.getElementById(`after-photos-${service.id}`)?.click();
                            }}
                          >
                            Escolher Arquivo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={onCameraCapture}>
                            Tirar Foto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  <input
                    id={`after-photos-${service.id}`}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleAfterPhotosChange(e.target.files)}
                    disabled={readOnly}
                  />
                  
                  {renderPhotos(afterPhotos, "Sem fotos de execução", "h-40")}
                </div>
              )}
            </div>

            {quality && !readOnly && (
              <div>
                <Label className="text-sm mb-1 block">Observações da Checagem</Label>
                <Textarea
                  placeholder="Adicione observações sobre a verificação deste serviço..."
                  value={observationText}
                  onChange={handleObservationChange}
                  className="resize-none"
                  rows={2}
                />
              </div>
            )}
          </div>

          {quality && afterPhotos.length === 0 && !readOnly && (
            <div className="text-yellow-600 flex items-center text-sm mt-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              É necessário adicionar ao menos uma foto da execução deste serviço
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCheck;
