
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PhotoUpload from "./PhotoUpload";
import { Service, Photo, ServiceType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface ServiceCheckboxProps {
  service: Service;
  checked?: boolean;
  onChecked?: (id: string, checked: boolean) => void;
  onServiceChange?: (id: string, checked: boolean) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observations: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => void;
  disabled?: boolean;
  photoType?: "before" | "after";
  existingPhotos?: Photo[];
  onChange?: (files: FileList) => void;
  completedCheckboxId?: string;
  isCompleted?: boolean;
  key?: string;
  photoRequired?: boolean;
  required?: boolean;
}

export default function ServiceCheckbox({
  service,
  checked = false,
  onChecked,
  onServiceChange,
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  disabled = false,
  photoType = "before",
  existingPhotos = [],
  completedCheckboxId,
  isCompleted,
  onChange,
  photoRequired = false,
  required = false
}: ServiceCheckboxProps) {
  const [isSelected, setIsSelected] = useState(checked || service.selected || false);
  const [quantity, setQuantity] = useState(service.quantity || 1);
  const [observations, setObservations] = useState(service.observations || "");
  const [photoError, setPhotoError] = useState(false);
  const { toast } = useToast();

  // Verificar se existem fotos
  const hasPhotos = () => {
    const photos = service.photos || [];
    return photos.some(photo => typeof photo === 'object' && photo.type === photoType);
  };

  // Efeito para atualizar estado local quando as props mudam
  useEffect(() => {
    setIsSelected(checked || service.selected || false);
    setQuantity(service.quantity || 1);
    setObservations(service.observations || "");
  }, [checked, service]);

  const handleChange = (checked: boolean) => {
    setIsSelected(checked);
    setPhotoError(false); // Reseta erro quando altera seleção
    
    if (onChecked) {
      onChecked(service.id, checked);
    }
    if (onServiceChange) {
      onServiceChange(service.id, checked);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(service.id, newQuantity);
    }
  };

  const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newObservation = e.target.value;
    setObservations(newObservation);
    if (onObservationChange) {
      onObservationChange(service.id, newObservation);
    }
  };

  const handlePhotoUpload = (files: FileList) => {
    if (files.length > 0) {
      setPhotoError(false);
      
      if (onPhotoUpload) {
        onPhotoUpload(service.id, files, photoType);
      }
      if (onChange) {
        onChange(files);
      }
      
      toast({
        title: "Foto adicionada",
        description: `${files.length} foto(s) adicionada(s) ao serviço ${service.name}`,
      });
    }
  };

  // Verificar se o serviço já tem fotos
  const servicePhotos = service.photos?.filter(photo => 
    typeof photo === 'object' && photo.type === photoType
  ) || [];

  const needsPhoto = isSelected && photoRequired && !hasPhotos();

  return (
    <div className={`p-4 rounded-lg border ${isSelected ? 'bg-gray-50 border-primary/50' : 'bg-white'}`}>
      <div className="flex items-start space-x-3">
        <Checkbox 
          id={`service-${service.id}`} 
          checked={isSelected}
          onCheckedChange={handleChange}
          disabled={disabled}
          required={required}
        />
        <div className="space-y-1.5 flex-1">
          <Label 
            htmlFor={`service-${service.id}`}
            className="text-base font-medium cursor-pointer"
          >
            {service.name}
          </Label>
          
          {isSelected && (
            <div className="space-y-4 mt-3">
              <div>
                <Label 
                  htmlFor={`quantity-${service.id}`}
                  className="text-sm font-medium mb-1 block"
                >
                  Quantidade
                </Label>
                <Input 
                  id={`quantity-${service.id}`}
                  type="number" 
                  value={quantity}
                  min={1} 
                  onChange={handleQuantityChange}
                  className="w-full max-w-[120px]"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <Label 
                  htmlFor={`observations-${service.id}`}
                  className="text-sm font-medium mb-1 block"
                >
                  Observações
                </Label>
                <Textarea 
                  id={`observations-${service.id}`}
                  value={observations}
                  onChange={handleObservationChange}
                  placeholder="Adicione observações sobre este serviço"
                  className="w-full h-20"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <Label 
                  htmlFor={`photo-${service.id}`}
                  className={`text-sm font-medium mb-1 block ${needsPhoto ? 'text-red-500' : ''}`}
                >
                  {`Fotos do ${photoType === "before" ? "Defeito" : "Serviço Concluído"}`}
                  {photoRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {needsPhoto && (
                  <div className="flex items-center text-red-500 text-xs mb-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>É necessário adicionar pelo menos uma foto do defeito</span>
                  </div>
                )}
                <Input
                  id={`photo-${service.id}`}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                  className={`w-full ${needsPhoto ? 'border-red-500' : ''}`}
                  disabled={disabled}
                />
                
                {/* Exibir fotos existentes */}
                {servicePhotos.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">{servicePhotos.length} foto(s) adicionada(s):</p>
                    <div className="grid grid-cols-3 gap-2">
                      {servicePhotos.map((photo, idx) => (
                        typeof photo === 'object' && photo.url && (
                          <div key={photo.id || idx} className="relative">
                            <img
                              src={photo.url}
                              alt={`Foto ${idx + 1}`}
                              className="h-20 w-20 object-cover rounded border"
                            />
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
