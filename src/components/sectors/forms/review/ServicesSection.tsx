
import { useState, useMemo } from "react";
import { Service, Photo } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle, Check, CheckSquare, Square } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ServicesList from "../../ServicesList";

interface ServicesSectionProps {
  services: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture?: (e: React.MouseEvent, serviceId?: string) => void;
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

export function ServicesSection({
  services,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  onCameraCapture,
  formErrors,
  photoRequired,
  servicesWithoutPhotos,
}: ServicesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const selectedServices = services.filter((service) => service.selected);

  // Verificar se todos os serviços selecionados têm pelo menos uma foto
  const hasAllPhotosRequired = useMemo(() => {
    if (!photoRequired) return true;
    
    return selectedServices.every(
      (service) => service.photos && service.photos.length > 0
    );
  }, [selectedServices, photoRequired]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Serviços a serem executados
        </h3>
        <div className="text-sm text-muted-foreground">
          {selectedServices.length} selecionados
        </div>
      </div>

      {formErrors.services && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione pelo menos um serviço
          </AlertDescription>
        </Alert>
      )}

      {photoRequired && formErrors.photos && !hasAllPhotosRequired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Todos os serviços selecionados precisam ter pelo menos uma foto
            <ul className="list-disc list-inside mt-2">
              {servicesWithoutPhotos.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <ServicesList 
        services={services}
        error={formErrors.services || (photoRequired && formErrors.photos && !hasAllPhotosRequired)}
        photoRequired={photoRequired}
        onServiceChange={handleServiceChange}
        onQuantityChange={handleQuantityChange}
        onObservationChange={handleObservationChange}
        onServicePhotoUpload={handlePhotoUpload}
        onCameraCapture={onCameraCapture}
      />
    </div>
  );
}

export default ServicesSection;
