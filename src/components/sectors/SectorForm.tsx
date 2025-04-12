
import { ChangeEvent, useState } from "react";
import { Service, Sector } from "@/types";
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
  const [selectedServices, setSelectedServices] = useState<Service[]>(services);
  const [tagPhotoUrl, setTagPhotoUrl] = useState<string | undefined>(defaultValues?.tagPhotoUrl);
  const [entryPhotos, setEntryPhotos] = useState<string[]>([]);
  const [exitPhotos, setExitPhotos] = useState<string[]>([]);
  const [completedServices, setCompletedServices] = useState<Service[]>(
    defaultValues?.services?.filter(s => defaultValues.completedServices?.includes(s.id)) || []
  );

  const today = format(new Date(), 'dd/MM/yyyy', { locale: ptBR });

  const handleServiceChange = (id: string, checked: boolean) => {
    setSelectedServices(
      selectedServices.map(service => 
        service.id === id 
          ? { ...service, selected: checked } 
          : service
      )
    );
  };

  const handleCompletedServiceChange = (id: string, checked: boolean) => {
    if (checked) {
      const serviceToAdd = services.find(s => s.id === id);
      if (serviceToAdd) {
        setCompletedServices([...completedServices, { ...serviceToAdd, selected: true }]);
      }
    } else {
      setCompletedServices(completedServices.filter(s => s.id !== id));
    }
  };

  const handleParafusosQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value);
    setSelectedServices(
      selectedServices.map(service => 
        service.id === 'substituicao_parafusos' 
          ? { ...service, quantity } 
          : service
      )
    );
  };

  const handleTrocaTrechoQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value);
    setSelectedServices(
      selectedServices.map(service => 
        service.id === 'troca_trecho' 
          ? { ...service, quantity } 
          : service
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formType === 'entry' && (!tagNumber || !entryInvoice)) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (formType === 'exit' && (!exitInvoice)) {
      toast.error('Preencha o número da nota fiscal de saída');
      return;
    }

    const servicesWithAtLeastOneSelected = selectedServices.some(service => service.selected);
    
    if (formType === 'entry' && !servicesWithAtLeastOneSelected) {
      toast.error('Selecione pelo menos um serviço');
      return;
    }

    if (formType === 'entry') {
      // Creating or updating entry data
      const newSector: Omit<Sector, 'id'> = {
        tagNumber,
        tagPhotoUrl: tagPhotoUrl || 'https://placehold.co/300x200?text=TAG+Photo',
        entryInvoice,
        entryDate: new Date().toISOString().split('T')[0],
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
          exitObservations: defaultValues.exitObservations
        } : {}
      } as Sector;
      
      onSubmit(newSector);
    } else {
      // Updating exit data
      if (!defaultValues) {
        toast.error('Dados do setor não encontrados');
        return;
      }
      
      const updatedSector: Sector = {
        ...defaultValues as Sector,
        exitDate: new Date().toISOString().split('T')[0],
        exitInvoice,
        exitObservations: observations,
        completedServices: completedServices.map(s => s.id),
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
          handleParafusosQuantityChange={handleParafusosQuantityChange}
          handleTrocaTrechoQuantityChange={handleTrocaTrechoQuantityChange}
          tagPhotoUrl={tagPhotoUrl}
          setTagPhotoUrl={setTagPhotoUrl}
          entryPhotos={entryPhotos}
          handleImageUpload={handleImageUpload}
          defaultValues={defaultValues}
          today={today}
        />
      ) : (
        <ExitForm 
          exitInvoice={exitInvoice}
          setExitInvoice={setExitInvoice}
          observations={observations}
          setObservations={setObservations}
          completedServices={completedServices}
          handleCompletedServiceChange={handleCompletedServiceChange}
          exitPhotos={exitPhotos}
          handleImageUpload={handleImageUpload}
          defaultValues={defaultValues}
          today={today}
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
