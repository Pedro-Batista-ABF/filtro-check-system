
import { Service, Photo } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Camera, ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import QuantityInput from "./QuantityInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ServiceCheckboxProps {
  service: Service;
  onChange: (id: string, checked: boolean) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observation: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: 'before' | 'after') => void;
  isCompleted?: boolean;
  completedCheckboxId?: string;
  viewMode?: boolean;
  photoType?: 'before' | 'after';
  required?: boolean;
}

export default function ServiceCheckbox({ 
  service, 
  onChange, 
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  isCompleted,
  completedCheckboxId,
  viewMode = false,
  photoType = 'before',
  required = false
}: ServiceCheckboxProps) {
  const [expanded, setExpanded] = useState(false);
  
  const needsQuantity = ['substituicao_parafusos', 'troca_trecho'].includes(service.id);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onPhotoUpload) return;
    
    onPhotoUpload(service.id, files, photoType);
    e.target.value = '';
    toast.success(`${files.length} foto(s) adicionada(s) para ${service.name}`);
  };

  // Calculate how many photos of the requested type this service has
  const photoCount = service.photos?.filter(p => p.type === photoType).length || 0;

  return (
    <div className="space-y-2 border rounded-md p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id={completedCheckboxId || service.id}
            checked={isCompleted !== undefined ? isCompleted : service.selected}
            onCheckedChange={(checked) => onChange(service.id, checked === true)}
            disabled={viewMode}
          />
          <div className="space-y-1 flex-1">
            <Label 
              htmlFor={completedCheckboxId || service.id} 
              className="text-sm font-medium leading-none cursor-pointer"
            >
              {service.name}
              {service.quantity ? ` (${service.quantity})` : ''}
            </Label>
          </div>
        </div>
        
        {!viewMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="p-1 h-6 w-6"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        )}
      </div>
      
      {expanded && !viewMode && (
        <div className="pl-6 space-y-3 mt-2">
          {needsQuantity && onQuantityChange && (
            <QuantityInput
              id={`quantity-${service.id}`}
              label="Quantidade"
              value={service.quantity}
              onChange={(e) => onQuantityChange(service.id, parseInt(e.target.value) || 0)}
            />
          )}
          
          {onObservationChange && (
            <div className="space-y-1">
              <Label htmlFor={`obs-${service.id}`} className="text-xs">
                Observações:
              </Label>
              <Textarea
                id={`obs-${service.id}`}
                value={service.observations || ''}
                onChange={(e) => onObservationChange(service.id, e.target.value)}
                placeholder="Observações específicas para este serviço..."
                className="min-h-[60px] text-sm"
              />
            </div>
          )}
          
          {onPhotoUpload && (
            <div className="space-y-1">
              <Label htmlFor={`photos-${service.id}`} className="text-xs flex items-center">
                Fotos {photoType === 'before' ? 'Antes' : 'Depois'}:
                {required && photoType === 'before' && photoCount === 0 && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </Label>
              <div className="flex items-center space-x-2">
                <Label 
                  htmlFor={`photos-${service.id}`} 
                  className="cursor-pointer flex items-center space-x-1 bg-gray-100 border border-dashed border-gray-300 rounded-md p-2 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Adicionar fotos</span>
                </Label>
                <Input
                  id={`photos-${service.id}`}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {photoCount > 0 && (
                  <span className="text-xs text-green-600">
                    {photoCount} foto(s) adicionada(s)
                  </span>
                )}
              </div>
              
              {service.photos && service.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {service.photos
                    .filter(photo => photo.type === photoType)
                    .map((photo, index) => (
                      <div key={index} className="h-16 bg-gray-200 rounded overflow-hidden">
                        <img 
                          src={photo.url} 
                          alt={`Foto ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
