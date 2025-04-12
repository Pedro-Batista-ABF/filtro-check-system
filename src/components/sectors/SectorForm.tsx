import { ChangeEvent, useState, useEffect } from "react";
import { Photo, Service, Sector, ServiceType, Cycle } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EntryForm from "./EntryForm";
import ExitForm from "./ExitForm";
import { useApi } from "@/contexts/ApiContextExtended";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar, ImagePlus } from "lucide-react";

interface SectorFormProps {
  defaultValues?: Partial<Sector>;
  services: Service[];
  onSubmit: (data: Omit<Sector, 'id'>) => void;
  formType: 'entry' | 'exit' | 'scrap-validation';
}

export default function SectorForm({ defaultValues, services, onSubmit, formType }: SectorFormProps) {
  const { getSectorsByTag } = useApi();
  const [tagNumber, setTagNumber] = useState(defaultValues?.tagNumber || '');
  const [entryInvoice, setEntryInvoice] = useState(defaultValues?.entryInvoice || '');
  const [exitInvoice, setExitInvoice] = useState(defaultValues?.exitInvoice || '');
  const [scrapReturnInvoice, setScrapReturnInvoice] = useState(defaultValues?.scrapReturnInvoice || '');
  const [observations, setObservations] = useState(formType === 'entry'
    ? defaultValues?.entryObservations || ''
    : formType === 'exit' 
      ? defaultValues?.exitObservations || ''
      : defaultValues?.scrapObservations || '');
  
  // Scrap related states
  const [isScrap, setIsScrap] = useState(defaultValues?.status === 'sucateado' || defaultValues?.status === 'sucateadoPendente');
  const [scrapObservations, setScrapObservations] = useState(defaultValues?.scrapObservations || '');
  const [scrapPhotos, setScrapPhotos] = useState<string[]>(
    defaultValues?.scrapPhotos?.map(p => p.url) || []
  );
  const [scrapValidated, setScrapValidated] = useState(defaultValues?.scrapValidated || false);
  const [cycleHistory, setCycleHistory] = useState<Cycle[]>([]);
  
  // Date handling
  const today = format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
  const [entryDate, setEntryDate] = useState<Date>(
    defaultValues?.entryDate 
      ? new Date(defaultValues.entryDate) 
      : new Date()
  );
  
  const [exitDate, setExitDate] = useState<Date>(
    defaultValues?.exitDate 
      ? new Date(defaultValues.exitDate) 
      : new Date()
  );
  
  const [scrapReturnDate, setScrapReturnDate] = useState<Date>(
    defaultValues?.scrapReturnDate 
      ? new Date(defaultValues.scrapReturnDate) 
      : new Date()
  );
  
  // Initialize services with photos from defaultValues if available
  const initialServices = services.map(service => {
    const defaultService = defaultValues?.services?.find(s => s.id === service.id);
    return {
      ...service,
      selected: defaultService?.selected || false,
      quantity: defaultService?.quantity,
      observations: defaultService?.observations,
      photos: defaultService?.photos || [],
    };
  });
  
  const [selectedServices, setSelectedServices] = useState<Service[]>(initialServices);
  const [tagPhotoUrl, setTagPhotoUrl] = useState<string | undefined>(defaultValues?.tagPhotoUrl);
  const [entryPhotos, setEntryPhotos] = useState<string[]>(
    defaultValues?.beforePhotos?.map(p => p.url) || []
  );
  const [exitPhotos, setExitPhotos] = useState<string[]>(
    defaultValues?.afterPhotos?.map(p => p.url) || []
  );
  const [completedServices, setCompletedServices] = useState<Service[]>(
    defaultValues?.services?.filter(s => defaultValues.completedServices?.includes(s.id as any)) || []
  );

  // Check for existing TAG history
  useEffect(() => {
    if (formType === 'entry' && tagNumber && tagNumber.length > 3) {
      // Get previous cycles for this TAG
      const fetchHistory = async () => {
        try {
          const previousSectors = await getSectorsByTag(tagNumber);
          
          if (previousSectors && previousSectors.length > 0) {
            // Convert previous sectors into cycles
            const previousCycles: Cycle[] = [];
            
            for (const sector of previousSectors) {
              // Include the main sector itself as the most recent cycle
              const mainCycle: Cycle = {
                id: sector.id,
                tagNumber: sector.tagNumber,
                entryInvoice: sector.entryInvoice,
                entryDate: sector.entryDate,
                peritagemDate: sector.peritagemDate,
                services: sector.services,
                beforePhotos: sector.beforePhotos,
                productionCompleted: sector.productionCompleted,
                exitDate: sector.exitDate,
                exitInvoice: sector.exitInvoice,
                checagemDate: sector.checagemDate,
                afterPhotos: sector.afterPhotos || [],
                completedServices: sector.completedServices,
                scrapObservations: sector.scrapObservations,
                scrapPhotos: sector.scrapPhotos,
                scrapValidated: sector.scrapValidated,
                scrapReturnDate: sector.scrapReturnDate,
                scrapReturnInvoice: sector.scrapReturnInvoice,
                status: sector.status,
                outcome: sector.outcome || 'EmAndamento',
                entryObservations: sector.entryObservations,
                exitObservations: sector.exitObservations
              };
              
              previousCycles.push(mainCycle);
              
              // Add any previous cycles
              if (sector.previousCycles && sector.previousCycles.length > 0) {
                previousCycles.push(...sector.previousCycles);
              }
            }
            
            // Set the history
            setCycleHistory(previousCycles);
          }
        } catch (error) {
          console.error("Erro ao buscar histórico da TAG:", error);
        }
      };
      
      fetchHistory();
    }
  }, [tagNumber, getSectorsByTag, formType]);

  const handleServiceChange = (id: string, checked: boolean) => {
    setSelectedServices(
      selectedServices.map(service => 
        service.id === id 
          ? { ...service, selected: checked } 
          : service
      )
    );
  };

  const handleServiceQuantityChange = (id: ServiceType, quantity: number) => {
    setSelectedServices(
      selectedServices.map(service => 
        service.id === id 
          ? { ...service, quantity } 
          : service
      )
    );
  };

  const handleServiceObservationChange = (id: ServiceType, observation: string) => {
    setSelectedServices(
      selectedServices.map(service => 
        service.id === id 
          ? { ...service, observations: observation } 
          : service
      )
    );
  };

  const handleServicePhotoUpload = (id: ServiceType, files: FileList, type: 'before' | 'after') => {
    // Create new photo objects for the service
    const newPhotos: Photo[] = Array.from(files).map((_, index) => ({
      id: `photo-${type}-${id}-${Date.now()}-${index}`,
      url: `https://placehold.co/600x400?text=${type === 'before' ? 'Before' : 'After'}+Photo+${id}`,
      type,
      serviceId: id
    }));

    // Update the service with the new photos
    setSelectedServices(
      selectedServices.map(service => 
        service.id === id 
          ? { 
              ...service, 
              photos: [...(service.photos || []), ...newPhotos]
            } 
          : service
      )
    );
  };

  const handleCompletedServiceChange = (id: string, checked: boolean) => {
    if (checked) {
      const serviceToAdd = selectedServices.find(s => s.id === id);
      if (serviceToAdd) {
        setCompletedServices([...completedServices, { ...serviceToAdd, selected: true }]);
      }
    } else {
      setCompletedServices(completedServices.filter(s => s.id !== id));
    }
  };

  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement>, 
    type: 'tag' | 'entry' | 'exit' | 'scrap'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, you would upload the file to a server here
    // For the demo, we'll just use a placeholder
    if (type === 'tag') {
      setTagPhotoUrl('https://placehold.co/300x200?text=TAG+Photo');
      toast.success('Foto da tag adicionada');
    } else if (type === 'entry') {
      const newPhotos = Array.from(files).map((_, index) => 
        `https://placehold.co/600x400?text=Before+Photo+${entryPhotos.length + index + 1}`
      );
      setEntryPhotos([...entryPhotos, ...newPhotos]);
      toast.success(`${files.length} foto(s) adicionada(s)`);
    } else if (type === 'exit') {
      const newPhotos = Array.from(files).map((_, index) => 
        `https://placehold.co/600x400?text=After+Photo+${exitPhotos.length + index + 1}`
      );
      setExitPhotos([...exitPhotos, ...newPhotos]);
      toast.success(`${files.length} foto(s) adicionada(s)`);
    } else if (type === 'scrap') {
      const newPhotos = Array.from(files).map((_, index) => 
        `https://placehold.co/600x400?text=Scrap+Photo+${scrapPhotos.length + index + 1}`
      );
      setScrapPhotos([...scrapPhotos, ...newPhotos]);
      toast.success(`${files.length} foto(s) de sucateamento adicionada(s)`);
    }
    
    // Reset the input
    e.target.value = '';
  };

  const validateEntryForm = () => {
    // Check if all required fields are filled
    if (!tagNumber || !entryInvoice) {
      toast.error('Preencha todos os campos obrigatórios');
      return false;
    }
    
    // Check if tag photo is provided - new validation
    if (!tagPhotoUrl) {
      toast.error('Adicione uma foto da TAG');
      return false;
    }
    
    if (isScrap) {
      // For scrap, check if scrap observations and photos are provided
      if (!scrapObservations) {
        toast.error('Preencha o motivo do sucateamento');
        return false;
      }
      
      if (scrapPhotos.length === 0) {
        toast.error('Adicione pelo menos uma foto do defeito irreversível');
        return false;
      }
      
      return true;
    }
    
    // For normal peritagem, check services
    // Check if at least one service is selected
    const servicesWithAtLeastOneSelected = selectedServices.some(service => service.selected);
    
    if (!servicesWithAtLeastOneSelected) {
      toast.error('Selecione pelo menos um serviço');
      return false;
    }
    
    // Check if all selected services have at least one "before" photo
    const selectedServicesWithoutPhotos = selectedServices
      .filter(service => service.selected)
      .filter(service => !service.photos?.some(photo => photo.type === 'before'));
    
    if (selectedServicesWithoutPhotos.length > 0) {
      toast.error(`Adicione pelo menos uma foto para cada serviço selecionado (faltando: ${selectedServicesWithoutPhotos.map(s => s.name).join(', ')})`);
      return false;
    }
    
    return true;
  };

  const validateExitForm = () => {
    if (!exitInvoice) {
      toast.error('Preencha o número da nota fiscal de saída');
      return false;
    }

    // Check if all completed services have "after" photos
    const completedServicesWithoutPhotos = completedServices
      .filter(service => !service.photos?.some(photo => photo.type === 'after'));
    
    if (completedServicesWithoutPhotos.length > 0) {
      toast.error(`Adicione pelo menos uma foto "depois" para cada serviço concluído (faltando: ${completedServicesWithoutPhotos.map(s => s.name).join(', ')})`);
      return false;
    }
    
    return true;
  };

  const validateScrapForm = () => {
    if (!scrapReturnInvoice) {
      toast.error('Preencha o número da nota fiscal de devolução');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formType === 'entry') {
      if (!validateEntryForm()) return;
      
      // Get cycle count for this TAG
      const cycleCount = cycleHistory.length + 1;
      
      // Creating or updating entry data
      const newSector: Omit<Sector, 'id'> = {
        tagNumber,
        tagPhotoUrl: tagPhotoUrl || '', // This is now required in the form validation
        entryInvoice,
        entryDate: format(entryDate, 'yyyy-MM-dd'),
        peritagemDate: format(new Date(), 'yyyy-MM-dd'),
        services: isScrap ? [] : selectedServices,
        beforePhotos: isScrap ? [] : entryPhotos.map((url, index) => ({
          id: `photo-before-${index + 1}`,
          url,
          type: 'before' as const
        })),
        entryObservations: isScrap ? '' : observations,
        productionCompleted: false,
        status: isScrap ? 'sucateadoPendente' : 'emExecucao',
        cycleCount,
        outcome: isScrap ? 'Sucateado' : 'EmAndamento',
        
        // Scrap fields if applicable
        ...(isScrap ? {
          scrapObservations,
          scrapPhotos: scrapPhotos.map((url, index) => ({
            id: `photo-scrap-${index + 1}`,
            url,
            type: 'before' as const
          })),
          scrapValidated: false
        } : {}),
        
        // Previous cycles if there are any
        ...(cycleHistory.length > 0 ? {
          previousCycles: cycleHistory
        } : {}),
        
        ...defaultValues ? {
          id: defaultValues.id,
          afterPhotos: defaultValues.afterPhotos,
          exitDate: defaultValues.exitDate,
          exitInvoice: defaultValues.exitInvoice,
          completedServices: defaultValues.completedServices,
          exitObservations: defaultValues.exitObservations,
          checagemDate: defaultValues.checagemDate
        } : {}
      } as Sector;
      
      onSubmit(newSector);
    } else if (formType === 'exit') {
      if (!validateExitForm()) return;

      if (!defaultValues) {
        toast.error('Dados do setor não encontrados');
        return;
      }
      
      // Updating exit data
      const updatedSector: Sector = {
        ...defaultValues as Sector,
        exitDate: format(exitDate, 'yyyy-MM-dd'),
        checagemDate: format(new Date(), 'yyyy-MM-dd'),
        exitInvoice,
        exitObservations: observations,
        completedServices: completedServices.map(s => s.id),
        services: selectedServices,
        afterPhotos: exitPhotos.map((url, index) => ({
          id: `photo-after-${index + 1}`,
          url,
          type: 'after' as const
        })),
        status: 'concluido',
        outcome: 'Recuperado'
      };
      
      onSubmit(updatedSector);
    } else if (formType === 'scrap-validation') {
      if (!validateScrapForm()) return;

      if (!defaultValues) {
        toast.error('Dados do setor não encontrados');
        return;
      }
      
      // Updating scrap validation data
      const updatedSector: Sector = {
        ...defaultValues as Sector,
        scrapReturnDate: format(scrapReturnDate, 'yyyy-MM-dd'),
        scrapReturnInvoice,
        scrapObservations: observations || defaultValues.scrapObservations,
        scrapValidated: true,
        scrapPhotos: [
          ...(defaultValues.scrapPhotos || []),
          ...scrapPhotos.map((url, index) => ({
            id: `photo-scrap-validation-${index + 1}`,
            url,
            type: 'after' as const
          }))
        ],
        status: 'sucateado',
        outcome: 'Sucateado'
      };
      
      onSubmit(updatedSector);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formType === 'entry' ? (
        <EntryForm 
          tagNumber={tagNumber}
          setTagNumber={setTagNumber}
          entryInvoice={entryInvoice}
          setEntryInvoice={setEntryInvoice}
          observations={observations}
          setObservations={setObservations}
          selectedServices={selectedServices}
          handleServiceChange={handleServiceChange}
          handleServiceQuantityChange={handleServiceQuantityChange}
          handleServiceObservationChange={handleServiceObservationChange}
          handleServicePhotoUpload={handleServicePhotoUpload}
          tagPhotoUrl={tagPhotoUrl}
          handleImageUpload={handleImageUpload}
          entryPhotos={entryPhotos}
          defaultValues={defaultValues}
          today={today}
          entryDate={entryDate}
          setEntryDate={setEntryDate}
          isScrap={isScrap}
          setIsScrap={setIsScrap}
          scrapObservations={scrapObservations}
          setScrapObservations={setScrapObservations}
          scrapPhotos={scrapPhotos}
          cycleHistory={cycleHistory}
        />
      ) : formType === 'exit' ? (
        <ExitForm 
          exitInvoice={exitInvoice}
          setExitInvoice={setExitInvoice}
          observations={observations}
          setObservations={setObservations}
          completedServices={completedServices}
          handleCompletedServiceChange={handleCompletedServiceChange}
          handleCompletedServicePhotoUpload={handleServicePhotoUpload}
          exitPhotos={exitPhotos}
          handleImageUpload={handleImageUpload}
          defaultValues={defaultValues}
          today={today}
          selectedServices={selectedServices}
          exitDate={exitDate}
          setExitDate={setExitDate}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Validação de Sucateamento</h3>
              <p className="text-sm text-gray-600 mb-4">
                Verifique os dados do setor e confirme o sucateamento.
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label>TAG do Setor</Label>
                  <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md">
                    {defaultValues?.tagNumber}
                  </div>
                </div>
                
                <div>
                  <Label>Motivo do Sucateamento</Label>
                  <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md min-h-[60px]">
                    {defaultValues?.scrapObservations || "Sem observações"}
                  </div>
                </div>
                
                <div>
                  <Label>Fotos do Defeito</Label>
                  {defaultValues?.scrapPhotos && defaultValues.scrapPhotos.length > 0 ? (
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {defaultValues.scrapPhotos.map((photo, idx) => (
                        <div key={idx} className="h-32 bg-gray-200 rounded overflow-hidden">
                          <img 
                            src={photo.url} 
                            alt={`Foto de sucateamento ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 p-4 bg-gray-100 border border-gray-300 rounded-md text-center">
                      Nenhuma foto disponível
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="scrapReturnInvoice">Nota Fiscal de Devolução *</Label>
                <Input
                  id="scrapReturnInvoice"
                  value={scrapReturnInvoice}
                  onChange={(e) => setScrapReturnInvoice(e.target.value)}
                  placeholder="Ex: NF-DEV-1234"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="scrapReturnDate">Data de Devolução *</Label>
                <div className="mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scrapReturnDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {scrapReturnDate ? format(scrapReturnDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={scrapReturnDate}
                        onSelect={(date) => date && setScrapReturnDate(date)}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label>Data da Validação</Label>
                <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md">
                  {today}
                </div>
              </div>
              
              <div>
                <Label htmlFor="observations">
                  Observações Técnicas (opcional)
                </Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações adicionais sobre o sucateamento..."
                  className="min-h-[100px] mt-1"
                />
              </div>
              
              <div>
                <Label>
                  Fotos Adicionais (opcional)
                </Label>
                <div className="mt-1">
                  <Label 
                    htmlFor="scrapPhotos" 
                    className="cursor-pointer flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-md p-3 w-full hover:bg-gray-50 transition-colors"
                  >
                    <ImagePlus className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-500">Adicionar fotos adicionais (ex: embalagem)</span>
                  </Label>
                  <Input
                    id="scrapPhotos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'scrap')}
                  />
                </div>
                
                {scrapPhotos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {scrapPhotos.map((photo, index) => (
                      <div key={index} className="relative h-24 bg-gray-200 rounded overflow-hidden">
                        <img 
                          src={photo} 
                          alt={`Foto adicional ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 text-white px-6"
        >
          {formType === 'entry' 
            ? (defaultValues 
                ? 'Atualizar Peritagem' 
                : (isScrap ? 'Registrar Sucateamento' : 'Concluir Peritagem')) 
            : formType === 'exit'
              ? 'Finalizar Checagem'
              : 'Validar Sucateamento'}
        </Button>
      </div>
    </form>
  );
}
