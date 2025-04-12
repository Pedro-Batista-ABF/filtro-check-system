
import { ChangeEvent, useState } from "react";
import { Photo, Service, Sector, ServiceType } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EntryForm from "./EntryForm";
import ExitForm from "./ExitForm";

interface SectorFormProps {
  defaultValues?: Partial<Sector>;
  services: Service[];
  onSubmit: (data: Omit<Sector, 'id'>) => void;
  formType: 'entry' | 'exit';
}

export default function SectorForm({ defaultValues, services, onSubmit, formType }: SectorFormProps) {
  const [tagNumber, setTagNumber] = useState(defaultValues?.tagNumber || '');
  const [entryInvoice, setEntryInvoice] = useState(defaultValues?.entryInvoice || '');
  const [exitInvoice, setExitInvoice] = useState(defaultValues?.exitInvoice || '');
  const [observations, setObservations] = useState(formType === 'entry'
    ? defaultValues?.entryObservations || ''
    : defaultValues?.exitObservations || '');
  
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
    defaultValues?.services?.filter(s => defaultValues.completedServices?.includes(s.id)) || []
  );

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
    type: 'tag' | 'entry' | 'exit'
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
    } else {
      const newPhotos = Array.from(files).map((_, index) => 
        `https://placehold.co/600x400?text=After+Photo+${exitPhotos.length + index + 1}`
      );
      setExitPhotos([...exitPhotos, ...newPhotos]);
      toast.success(`${files.length} foto(s) adicionada(s)`);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formType === 'entry') {
      if (!validateEntryForm()) return;
      
      // Creating or updating entry data
      const newSector: Omit<Sector, 'id'> = {
        tagNumber,
        tagPhotoUrl: tagPhotoUrl || 'https://placehold.co/300x200?text=TAG+Photo',
        entryInvoice,
        entryDate: format(entryDate, 'yyyy-MM-dd'),
        peritagemDate: format(new Date(), 'yyyy-MM-dd'), // New field: Peritagem date
        services: selectedServices,
        beforePhotos: entryPhotos.map((url, index) => ({
          id: `photo-before-${index + 1}`,
          url,
          type: 'before'
        })),
        entryObservations: observations,
        status: 'emExecucao',
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
    } else {
      if (!validateExitForm()) return;

      if (!defaultValues) {
        toast.error('Dados do setor não encontrados');
        return;
      }
      
      // Updating exit data
      const updatedSector: Sector = {
        ...defaultValues as Sector,
        exitDate: format(exitDate, 'yyyy-MM-dd'),
        checagemDate: format(new Date(), 'yyyy-MM-dd'), // New field: Checagem date
        exitInvoice,
        exitObservations: observations,
        completedServices: completedServices.map(s => s.id),
        services: selectedServices, // Update the services with the photos added during exit
        afterPhotos: exitPhotos.map((url, index) => ({
          id: `photo-after-${index + 1}`,
          url,
          type: 'after'
        })),
        status: 'concluido'
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
        />
      ) : (
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
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 text-white px-6"
        >
          {formType === 'entry' 
            ? (defaultValues ? 'Atualizar Peritagem' : 'Concluir Peritagem') 
            : 'Finalizar Checagem'}
        </Button>
      </div>
    </form>
  );
}
