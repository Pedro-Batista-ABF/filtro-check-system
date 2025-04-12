
import { ChangeEvent, useState } from "react";
import { Service, Sector } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImagePlus, Upload } from "lucide-react";
import { toast } from "sonner";

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
      {/* Tag and Invoice Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tagNumber">Número da Tag *</Label>
            <Input
              id="tagNumber"
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              placeholder="Ex: TAG-1234"
              className="mt-1"
              disabled={formType === 'exit' || defaultValues?.tagNumber !== undefined}
              required={formType === 'entry'}
            />
          </div>

          <div>
            <Label htmlFor="tagPhoto">Foto da Tag</Label>
            <div className="mt-1 flex items-center">
              <Label 
                htmlFor="tagPhoto" 
                className="cursor-pointer flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-md p-2 w-full hover:bg-gray-50 transition-colors"
              >
                <ImagePlus className="h-5 w-5 mr-2 text-gray-500" />
                <span className="text-sm text-gray-500">Adicionar foto da tag</span>
              </Label>
              <Input
                id="tagPhoto"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'tag')}
                disabled={formType === 'exit' || tagPhotoUrl !== undefined}
              />
            </div>
            {tagPhotoUrl && (
              <div className="mt-2">
                <p className="text-sm text-green-600">
                  Foto da tag adicionada
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {formType === 'entry' ? (
            <div>
              <Label htmlFor="entryInvoice">Nota Fiscal de Entrada *</Label>
              <Input
                id="entryInvoice"
                value={entryInvoice}
                onChange={(e) => setEntryInvoice(e.target.value)}
                placeholder="Ex: NF-5678"
                className="mt-1"
                disabled={defaultValues?.entryInvoice !== undefined}
                required
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="exitInvoice">Nota Fiscal de Saída *</Label>
              <Input
                id="exitInvoice"
                value={exitInvoice}
                onChange={(e) => setExitInvoice(e.target.value)}
                placeholder="Ex: NF-9876"
                className="mt-1"
                required
              />
            </div>
          )}

          <div>
            <Label>Data de {formType === 'entry' ? 'Entrada' : 'Saída'}</Label>
            <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md">
              {today}
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {formType === 'entry' ? 'Serviços Necessários *' : 'Serviços Realizados *'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formType === 'entry' ? (
            // Entry form showing services to select
            selectedServices.map((service) => (
              <div key={service.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={service.id}
                  checked={service.selected}
                  onCheckedChange={(checked) => handleServiceChange(service.id, checked === true)}
                />
                <div className="space-y-1 flex-1">
                  <Label 
                    htmlFor={service.id} 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {service.name}
                  </Label>
                  
                  {service.id === 'substituicao_parafusos' && service.selected && (
                    <div className="mt-2">
                      <Label htmlFor="parafusosQuantity" className="text-xs">
                        Quantidade:
                      </Label>
                      <Input
                        id="parafusosQuantity"
                        type="number"
                        min="1"
                        value={service.quantity || ''}
                        onChange={handleParafusosQuantityChange}
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Exit form showing completed services
            defaultValues?.services?.filter(s => s.selected).map((service) => (
              <div key={service.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={`completed-${service.id}`}
                  checked={completedServices.some(s => s.id === service.id)}
                  onCheckedChange={(checked) => handleCompletedServiceChange(service.id, checked === true)}
                />
                <div className="space-y-1 flex-1">
                  <Label 
                    htmlFor={`completed-${service.id}`} 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {service.name}
                    {service.quantity ? ` (${service.quantity})` : ''}
                  </Label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          Fotos {formType === 'entry' ? 'dos Defeitos' : 'Após Serviço'}
        </h3>
        
        <div className="mt-1">
          <Label 
            htmlFor={formType === 'entry' ? 'entryPhotos' : 'exitPhotos'} 
            className="cursor-pointer flex flex-col items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-md p-6 hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-8 w-8 mb-2 text-gray-500" />
            <span className="text-sm text-gray-500">
              Clique para adicionar fotos
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Você pode selecionar múltiplas fotos
            </span>
          </Label>
          <Input
            id={formType === 'entry' ? 'entryPhotos' : 'exitPhotos'}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, formType === 'entry' ? 'entry' : 'exit')}
          />
        </div>

        {formType === 'entry' && entryPhotos.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-2">
              {entryPhotos.length} foto(s) adicionada(s):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {entryPhotos.map((photo, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {formType === 'exit' && exitPhotos.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-2">
              {exitPhotos.length} foto(s) adicionada(s):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {exitPhotos.map((photo, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Observations */}
      <div className="space-y-2">
        <Label htmlFor="observations">
          Observações {formType === 'entry' ? 'Gerais' : 'Adicionais'}
        </Label>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder={formType === 'entry' 
            ? "Observações sobre o estado do setor..."
            : "Observações sobre os serviços realizados..."}
          className="min-h-[100px]"
        />
      </div>

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
