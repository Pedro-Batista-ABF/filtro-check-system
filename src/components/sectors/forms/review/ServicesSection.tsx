
import { useState, useMemo } from "react";
import { Service, Photo } from "@/types";
import ServiceCheck from "./ServiceCheck";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle, Check, CheckSquare, X, Square } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ServicesCheckProps {
  service: Service;
  onClose: () => void;
  onSave: (updatedService: Service) => void;
  beforePhotos: Photo[];
  readOnly: boolean;
}

function ServiceModal({ service, onClose, onSave, beforePhotos = [], readOnly = false }: ServicesCheckProps) {
  const [updatedService, setUpdatedService] = useState<Service>(service);

  const handleSave = () => {
    onSave(updatedService);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Detalhe do Serviço: {service.name}</DialogTitle>
          <DialogDescription>
            Visualize e edite as informações deste serviço.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ServiceCheck
            service={service}
            onChange={(updatedValue) => setUpdatedService(updatedValue)}
            beforePhotos={beforePhotos}
            readOnly={readOnly}
          />
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            onClick={onClose}
          >
            Cancelar
          </button>
          {!readOnly && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleSave}
            >
              Salvar
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  const selectedServices = services.filter((service) => service.selected);

  // Modal para detalhes de serviço
  const [modalService, setModalService] = useState<Service | null>(null);

  const handleOpenModal = (service: Service) => {
    setModalService(service);
  };

  const handleCloseModal = () => {
    setModalService(null);
  };

  const handleSaveModal = (updatedService: Service) => {
    handleServiceChange(updatedService.id, updatedService.selected);
    if (updatedService.quantity) {
      handleQuantityChange(updatedService.id, updatedService.quantity);
    }
    if (updatedService.observations) {
      handleObservationChange(updatedService.id, updatedService.observations);
    }
    // Note: photo handling would typically happen separately
  };

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

      <Accordion type="single" collapsible className="w-full">
        {services.map((service) => (
          <AccordionItem key={service.id} value={service.id}>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleServiceChange(service.id, !service.selected)}
                className="mr-2 focus:outline-none"
              >
                {service.selected ? (
                  <CheckSquare className="h-5 w-5 text-primary" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <AccordionTrigger className={`${service.selected ? "font-medium" : "text-muted-foreground"}`}>
                {service.name}
                {service.selected && service.photos && service.photos.length > 0 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    {service.photos.length} foto{service.photos.length !== 1 ? "s" : ""}
                  </span>
                )}
                {service.selected && photoRequired && (!service.photos || service.photos.length === 0) && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    Sem fotos
                  </span>
                )}
              </AccordionTrigger>
            </div>
            
            <AccordionContent>
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal(service)}
                  className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md flex justify-between items-center"
                >
                  <span>Editar detalhes</span>
                  <span className="text-blue-600 text-sm">Abrir</span>
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {modalService && (
        <ServiceModal
          service={modalService}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
          beforePhotos={modalService.photos || []}
          readOnly={false}
        />
      )}
    </div>
  );
}

export default ServicesSection;
