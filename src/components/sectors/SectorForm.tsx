
import React, { useState, useRef, useEffect } from "react";
import { Sector, Service, PhotoWithFile } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, CameraIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import ServiceForm from "./forms/ServiceForm";
import { useApi } from "@/contexts/ApiContextExtended";
import { useSectorFormSubmit } from "@/hooks/useSectorFormSubmit";
import ScrapForm from "./forms/ScrapForm";
import TagPhoto from "./TagPhoto";
import useCamera from "@/hooks/useCamera";
import { photoService } from "@/services/photoService";
import { toast } from "sonner";

interface SectorFormProps {
  initialSector?: Sector;
  isEditing?: boolean;
  isLoading?: boolean;
  onSubmit: (data: Partial<Sector>) => Promise<boolean>;
  disableEntryFields?: boolean;
  photoRequired?: boolean;
  mode?: "peritagem" | "checagem" | "scrap";
}

const SectorForm: React.FC<SectorFormProps> = ({
  initialSector,
  isEditing = false,
  isLoading = false,
  onSubmit,
  disableEntryFields = false,
  photoRequired = true,
  mode = "peritagem"
}) => {
  const { getServiceTypes, uploadPhoto } = useApi();
  const { validateForm, prepareFormData } = useSectorFormSubmit();
  const { captureImage, cameraVisible, showCamera, hideCamera } = useCamera();
  
  // Estados para o formulário
  const [tagNumber, setTagNumber] = useState(initialSector?.tagNumber || "");
  const [tagPhotoUrl, setTagPhotoUrl] = useState(initialSector?.tagPhotoUrl || "");
  const [entryInvoice, setEntryInvoice] = useState(initialSector?.entryInvoice || "");
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    initialSector?.entryDate ? new Date(initialSector.entryDate) : undefined
  );
  const [entryObservations, setEntryObservations] = useState(initialSector?.entryObservations || "");
  const [services, setServices] = useState<Service[]>([]);
  const [exitInvoice, setExitInvoice] = useState(initialSector?.exitInvoice || "");
  const [exitDate, setExitDate] = useState<Date | undefined>(
    initialSector?.exitDate ? new Date(initialSector.exitDate) : undefined
  );
  const [exitObservations, setExitObservations] = useState(initialSector?.exitObservations || "");
  
  // Estados para sucateamento
  const [isScrap, setIsScrap] = useState(
    initialSector?.status === "sucateadoPendente" || initialSector?.status === "sucateado" || mode === "scrap"
  );
  const [scrapObservations, setScrapObservations] = useState(initialSector?.scrapObservations || "");
  const [scrapDate, setScrapDate] = useState<Date | undefined>(
    initialSector?.scrapReturnDate ? new Date(initialSector.scrapReturnDate) : undefined
  );
  const [scrapInvoice, setScrapInvoice] = useState(initialSector?.scrapReturnInvoice || "");
  const [scrapPhotos, setScrapPhotos] = useState<PhotoWithFile[]>(initialSector?.scrapPhotos || []);
  
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados auxiliares
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
    services?: boolean;
    photos?: boolean;
    exitDate?: boolean;
    exitInvoice?: boolean;
    scrapObservations?: boolean;
    scrapDate?: boolean;
    scrapInvoice?: boolean;
    scrapPhotos?: boolean;
  }>({});
  const [currentPhotoService, setCurrentPhotoService] = useState<{id: string, type: "before" | "after"} | null>(null);

  // Carregar tipos de serviço ao montar o componente
  useEffect(() => {
    async function loadServiceTypes() {
      try {
        const serviceTypes = await getServiceTypes();
        
        if (initialSector?.services && initialSector.services.length > 0) {
          // Se temos serviços iniciais, mesclar com os tipos
          const mergedServices = serviceTypes.map(type => {
            const existingService = initialSector.services?.find(s => s.id === type.id);
            return existingService ? { ...type, ...existingService } : type;
          });
          setServices(mergedServices);
        } else {
          setServices(serviceTypes);
        }
      } catch (error) {
        console.error("Erro ao carregar tipos de serviço:", error);
      }
    }
    
    loadServiceTypes();
  }, [getServiceTypes, initialSector]);

  // Manipuladores para serviços
  const handleServiceSelect = (id: string, checked: boolean) => {
    setServices(prev =>
      prev.map(service =>
        service.id === id ? { ...service, selected: checked } : service
      )
    );
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setServices(prev =>
      prev.map(service =>
        service.id === id ? { ...service, quantity } : service
      )
    );
  };

  const handleObservationsChange = (id: string, observations: string) => {
    setServices(prev =>
      prev.map(service =>
        service.id === id ? { ...service, observations } : service
      )
    );
  };

  // Manipuladores para fotos
  const handleTagPhotoUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    try {
      const file = files[0];
      const uploadedUrl = await photoService.uploadPhoto(file, `${tagNumber}/tag`);
      setTagPhotoUrl(uploadedUrl);
    } catch (error) {
      console.error("Erro ao fazer upload da foto da TAG:", error);
      toast.error("Erro ao fazer upload da foto");
    }
  };

  const handleScrapPhotoUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    try {
      const newPhotos: PhotoWithFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Criar URL temporária para preview
        const tempUrl = URL.createObjectURL(file);
        
        newPhotos.push({
          id: `temp-${Date.now()}-${i}`,
          url: tempUrl,
          file,
          type: "scrap",
          serviceId: null
        });
      }
      
      setScrapPhotos(prev => [...prev, ...newPhotos]);
    } catch (error) {
      console.error("Erro ao processar fotos do sucateamento:", error);
      toast.error("Erro ao processar fotos");
    }
  };

  const handleServicePhotoUpload = async (serviceId: string, files: FileList, photoType: "before" | "after") => {
    if (files.length === 0) return;
    
    try {
      // Cria uma cópia do serviço atual
      const currentService = services.find(s => s.id === serviceId);
      if (!currentService) return;
      
      // Garantir que o serviço tem um array de fotos
      const currentPhotos = Array.isArray(currentService.photos) ? [...currentService.photos] : [];
      
      // Processa cada arquivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Caminho personalizado baseado na TAG e serviço
        const folder = `${tagNumber}/${serviceId}/${photoType}`;
        
        try {
          // Fazer upload real do arquivo
          const uploadedUrl = await photoService.uploadPhoto(file, folder);
          
          // Adicionar a foto ao array
          currentPhotos.push({
            id: `${Date.now()}-${i}`,
            url: uploadedUrl,
            type: photoType,
            serviceId
          });
        } catch (uploadError) {
          console.error(`Erro ao fazer upload da foto ${i}:`, uploadError);
          toast.error(`Erro ao fazer upload da foto ${i+1}`);
        }
      }
      
      // Atualizar o serviço com as novas fotos
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId 
            ? { ...service, photos: currentPhotos } 
            : service
        )
      );
    } catch (error) {
      console.error("Erro ao processar fotos:", error);
      toast.error("Erro ao processar fotos");
    }
  };

  // Manipuladores de câmera
  const handleCameraCapture = (serviceId: string, photoType: "before" | "after") => {
    setCurrentPhotoService({ id: serviceId, type: photoType });
    showCamera();
  };

  const handleScrapCameraCapture = () => {
    setCurrentPhotoService(null);
    showCamera();
  };

  const handleCameraComplete = async (imageBlob: Blob | null) => {
    hideCamera();
    
    if (!imageBlob) {
      toast.error("Nenhuma imagem capturada");
      return;
    }
    
    const file = new File([imageBlob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    try {
      if (currentPhotoService) {
        // Foto de serviço
        const files = new DataTransfer();
        files.items.add(file);
        await handleServicePhotoUpload(currentPhotoService.id, files.files, currentPhotoService.type);
      } else {
        // Foto de sucateamento ou TAG
        const files = new DataTransfer();
        files.items.add(file);
        
        // Determina o tipo com base no modo atual
        if (isScrap || mode === "scrap") {
          await handleScrapPhotoUpload(files.files);
        } else {
          await handleTagPhotoUpload(files.files);
        }
      }
    } catch (error) {
      console.error("Erro ao processar foto da câmera:", error);
      toast.error("Erro ao processar foto da câmera");
    }
  };

  // Manipuladores de eventos do formulário
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Preparar dados para validação
    const formState = {
      tagNumber,
      tagPhotoUrl,
      entryInvoice,
      entryDate,
      entryObservations,
      services,
      isScrap,
      scrapObservations,
      scrapDate,
      scrapInvoice,
      scrapPhotos
    };
    
    // Validar formulário
    const errors = validateForm(formState);
    setFormErrors(errors);
    
    // Verificar se há erros
    const hasErrors = Object.values(errors).some(error => error);
    if (hasErrors) {
      console.log("Erros de validação:", errors);
      toast.error("Corrija os erros no formulário");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar dados para envio
      const formData = prepareFormData(formState, isEditing, initialSector?.id);
      
      // Para checagem, atualizar com dados de saída
      if (mode === "checagem") {
        formData.exitInvoice = exitInvoice;
        formData.exitDate = exitDate ? format(exitDate, "yyyy-MM-dd") : undefined;
        formData.exitObservations = exitObservations;
        formData.status = "concluido";
      }
      
      // Enviar formulário
      const result = await onSubmit(formData);
      
      if (result) {
        const actionText = isEditing ? "atualizado" : "criado";
        const typeText = isScrap ? "para sucateamento" : "";
        toast.success(`Setor ${actionText} com sucesso ${typeText}!`);
      }
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao salvar o formulário: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar o formulário de acordo com o modo
  if (mode === "scrap" || isScrap) {
    return (
      <form onSubmit={handleSubmitForm} className="space-y-6">
        {cameraVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
            {captureImage({
              onComplete: handleCameraComplete,
              onCancel: hideCamera
            })}
          </div>
        )}
        
        <ScrapForm
          tagNumber={tagNumber}
          setTagNumber={setTagNumber}
          entryInvoice={entryInvoice}
          setEntryInvoice={setEntryInvoice}
          entryDate={entryDate}
          setEntryDate={setEntryDate}
          tagPhotoUrl={tagPhotoUrl}
          handleTagPhotoUpload={handleTagPhotoUpload}
          scrapObservations={scrapObservations}
          setScrapObservations={setScrapObservations}
          scrapDate={scrapDate}
          setScrapDate={setScrapDate}
          scrapInvoice={scrapInvoice}
          setScrapInvoice={setScrapInvoice}
          scrapPhotos={scrapPhotos}
          handleScrapPhotoUpload={handleScrapPhotoUpload}
          formErrors={formErrors}
          onCameraCapture={handleScrapCameraCapture}
          disabled={isLoading || disableEntryFields}
        />
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting}
            className="min-w-[120px]"
          >
            {isLoading || isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Confirmar Sucateamento"
            )}
          </Button>
        </div>
      </form>
    );
  }

  // Formulário padrão (peritagem ou checagem)
  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      {cameraVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          {captureImage({
            onComplete: handleCameraComplete,
            onCancel: hideCamera
          })}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tagNumber" className={formErrors.tagNumber ? "text-red-500" : ""}>
              Número da TAG*
            </Label>
            <Input
              id="tagNumber"
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              className={formErrors.tagNumber ? "border-red-500" : ""}
              disabled={isLoading || disableEntryFields}
            />
            {formErrors.tagNumber && (
              <p className="text-xs text-red-500">Número da TAG é obrigatório</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryInvoice" className={formErrors.entryInvoice ? "text-red-500" : ""}>
              Nota Fiscal de Entrada*
            </Label>
            <Input
              id="entryInvoice"
              value={entryInvoice}
              onChange={(e) => setEntryInvoice(e.target.value)}
              className={formErrors.entryInvoice ? "border-red-500" : ""}
              disabled={isLoading || disableEntryFields}
            />
            {formErrors.entryInvoice && (
              <p className="text-xs text-red-500">Nota fiscal é obrigatória</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="entryDate" className={formErrors.entryDate ? "text-red-500" : ""}>
              Data de Entrada*
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="entryDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !entryDate && "text-muted-foreground",
                    formErrors.entryDate && "border-red-500"
                  )}
                  disabled={isLoading || disableEntryFields}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {entryDate ? format(entryDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={entryDate}
                  onSelect={setEntryDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formErrors.entryDate && (
              <p className="text-xs text-red-500">Data é obrigatória</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryObservations">Observações</Label>
            <Textarea
              id="entryObservations"
              value={entryObservations}
              onChange={(e) => setEntryObservations(e.target.value)}
              disabled={isLoading || disableEntryFields}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={formErrors.tagPhoto ? "text-red-500" : ""}>
            Foto da TAG*
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    handleTagPhotoUpload(e.target.files);
                  }
                }}
                disabled={isLoading || disableEntryFields}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || disableEntryFields}
              >
                Selecionar arquivo
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setCurrentPhotoService(null);
                  showCamera();
                }}
                disabled={isLoading || disableEntryFields}
              >
                <CameraIcon className="mr-2 h-4 w-4" />
                Usar câmera
              </Button>
              
              {formErrors.tagPhoto && (
                <p className="text-xs text-red-500 mt-1">Foto da TAG é obrigatória</p>
              )}
            </div>
            
            <div>
              {tagPhotoUrl ? (
                <TagPhoto sector={{ ...initialSector, tagPhotoUrl, tagNumber } as Sector} />
              ) : (
                <div className="border rounded-md h-40 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-400">Nenhuma foto selecionada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mode === "peritagem" && (
        <div className="space-y-4">
          <div>
            <Label className={formErrors.services ? "text-red-500" : ""}>
              Serviços a serem executados*
            </Label>
            <ServiceForm
              services={services}
              setServices={setServices}
              onServiceSelect={handleServiceSelect}
              onQuantityChange={handleQuantityChange}
              onObservationsChange={handleObservationsChange}
              onPhotoUpload={handleServicePhotoUpload}
              disabled={isLoading}
              stage="peritagem"
              error={formErrors.services || formErrors.photos}
              onCameraCapture={handleCameraCapture}
            />
            {formErrors.services && (
              <p className="text-xs text-red-500 mt-1">Selecione pelo menos um serviço</p>
            )}
            {formErrors.photos && (
              <p className="text-xs text-red-500 mt-1">
                Todos os serviços selecionados precisam ter ao menos uma foto e quantidade
              </p>
            )}
          </div>
        </div>
      )}

      {mode === "checagem" && (
        <>
          <div className="space-y-4">
            <div>
              <Label>Serviços executados</Label>
              <ServiceForm
                services={services}
                setServices={setServices}
                onServiceSelect={handleServiceSelect}
                onQuantityChange={handleQuantityChange}
                onObservationsChange={handleObservationsChange}
                onPhotoUpload={handleServicePhotoUpload}
                disabled={true}
                disableSelection={true}
                stage="checagem"
                onCameraCapture={handleCameraCapture}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exitInvoice" className={formErrors.exitInvoice ? "text-red-500" : ""}>
                  Nota Fiscal de Saída*
                </Label>
                <Input
                  id="exitInvoice"
                  value={exitInvoice}
                  onChange={(e) => setExitInvoice(e.target.value)}
                  className={formErrors.exitInvoice ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {formErrors.exitInvoice && (
                  <p className="text-xs text-red-500">Nota fiscal de saída é obrigatória</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitDate" className={formErrors.exitDate ? "text-red-500" : ""}>
                  Data de Saída*
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="exitDate"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !exitDate && "text-muted-foreground",
                        formErrors.exitDate && "border-red-500"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exitDate ? format(exitDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exitDate}
                      onSelect={setExitDate}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.exitDate && (
                  <p className="text-xs text-red-500">Data de saída é obrigatória</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitObservations">Observações</Label>
              <Textarea
                id="exitObservations"
                value={exitObservations}
                onChange={(e) => setExitObservations(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button 
          type="submit" 
          disabled={isLoading || isSubmitting}
          className="min-w-[120px]"
        >
          {isLoading || isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            isEditing ? "Atualizar" : "Salvar"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SectorForm;
