
import React from 'react';
import { Service } from "@/types";
import { Check, X, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ServicesListProps {
  services: Service[];
  error?: boolean;
  photoRequired?: boolean;
  onServiceChange?: (id: string, checked: boolean) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observations: string) => void;
  onServicePhotoUpload?: (serviceId: string, files: FileList) => void;
}

export default function ServicesList({ 
  services, 
  error = false,
  photoRequired = true,
  onServiceChange,
  onQuantityChange,
  onObservationChange,
  onServicePhotoUpload
}: ServicesListProps) {
  console.log("🔄 ServicesList render", Date.now());
  console.log("🔄 services:", services?.length || 0);
  console.log("🔄 error:", error);
  
  // Mostrar todos os serviços disponíveis
  if (!services || services.length === 0) {
    return <p className="text-gray-500">Nenhum serviço disponível</p>;
  }

  const handleServiceChange = (id: string, checked: boolean) => {
    if (onServiceChange) {
      onServiceChange(id, checked);
    }
  };

  const handleQuantityChange = (id: string, value: string) => {
    if (onQuantityChange) {
      onQuantityChange(id, parseInt(value) || 1);
    }
  };

  const handleObservationChange = (id: string, value: string) => {
    if (onObservationChange) {
      onObservationChange(id, value);
    }
  };

  const handlePhotoUpload = (id: string, files: FileList) => {
    if (onServicePhotoUpload) {
      onServicePhotoUpload(id, files);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            Cada serviço selecionado deve ter quantidade definida e pelo menos uma foto
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        {services.map(service => (
          <div key={service.id} className="border rounded-md p-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                id={`service-${service.id}`}
                checked={service.selected || false}
                className="mt-1"
                disabled={false}
                onCheckedChange={(checked) => handleServiceChange(service.id, !!checked)}
              />
              <div className="flex-1 space-y-2">
                <Label 
                  htmlFor={`service-${service.id}`}
                  className="font-medium cursor-pointer"
                >
                  {service.name}
                </Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${service.id}`}>
                      Quantidade
                    </Label>
                    <Input
                      id={`quantity-${service.id}`}
                      type="number"
                      min="1"
                      value={service.quantity || 1}
                      className="w-full"
                      disabled={!service.selected}
                      onChange={(e) => handleQuantityChange(service.id, e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`photo-${service.id}`}>
                      Foto do defeito
                      {photoRequired && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`photo-${service.id}`}
                        type="file"
                        accept="image/*"
                        className="flex-1"
                        disabled={!service.selected}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handlePhotoUpload(service.id, e.target.files);
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        disabled={!service.selected}
                        type="button"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`observations-${service.id}`}>
                    Observações
                  </Label>
                  <Textarea
                    id={`observations-${service.id}`}
                    placeholder="Observações sobre o serviço..."
                    value={service.observations || ''}
                    disabled={!service.selected}
                    onChange={(e) => handleObservationChange(service.id, e.target.value)}
                  />
                </div>
                
                {service.photos && service.photos.length > 0 && (
                  <div>
                    <Label>Fotos adicionadas:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {service.photos.map((photo, index) => (
                        <div 
                          key={index} 
                          className="relative w-20 h-20 border rounded overflow-hidden group"
                        >
                          <img 
                            src={photo.url} 
                            alt={`Foto ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
