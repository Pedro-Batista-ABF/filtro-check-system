
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service, Cycle, Photo, CycleOutcome } from "@/types";
import ServiceCheckbox from "./ServiceCheckbox";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface EntryFormProps {
  onSubmit: (formData: {
    tagNumber: string;
    entryInvoice: string;
    entryDate: string;
    services: Service[];
    status: string;
    cycles: Cycle[];
  }) => void;
  initialData?: {
    tagNumber: string;
    entryInvoice: string;
    entryDate: string;
    services: Service[];
    status: string;
    cycles: Cycle[];
  };
  services: Service[];
  loading?: boolean;
  mode?: "create" | "edit";
}

export default function EntryForm({ onSubmit, initialData, services, loading, mode = "create" }: EntryFormProps) {
  const [tagNumber, setTagNumber] = useState(initialData?.tagNumber || "");
  const [entryInvoice, setEntryInvoice] = useState(initialData?.entryInvoice || "");
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    initialData?.entryDate ? new Date(initialData.entryDate) : new Date()
  );
  const [isScrap, setIsScrap] = useState(false);
  const [scrapReason, setScrapReason] = useState("");
  const [selectedServices, setSelectedServices] = useState<Service[]>(
    initialData?.services || services.map(service => ({ ...service, selected: false, quantity: 1 }))
  );

  // Form validation
  const [formErrors, setFormErrors] = useState({
    tagNumber: false,
    entryInvoice: false,
    entryDate: false,
    services: false,
    scrapReason: false
  });

  useEffect(() => {
    if (initialData?.services) {
      setSelectedServices(initialData.services);
    } else if (services) {
      setSelectedServices(services.map(service => ({ ...service, selected: false, quantity: 1 })));
    }
  }, [initialData?.services, services]);

  const handleServiceChange = (id: string, checked: boolean) => {
    setSelectedServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, selected: checked } 
          : service
      )
    );
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setSelectedServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, quantity } 
          : service
      )
    );
  };

  const handleObservationChange = (id: string, observations: string) => {
    setSelectedServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, observations } 
          : service
      )
    );
  };

  const handlePhotoUpload = (id: string, files: FileList, type: "before" | "after") => {
    setSelectedServices(prev => 
      prev.map(service => {
        if (service.id === id) {
          const existingPhotos = service.photos || [];
          const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
            id: `${id}-${Date.now()}-${index}`,
            url: URL.createObjectURL(file),
            file,
            type
          }));
          
          return { 
            ...service, 
            photos: [...existingPhotos, ...newPhotos] 
          };
        }
        return service;
      })
    );
  };

  const validateForm = () => {
    const errors = {
      tagNumber: !tagNumber,
      entryInvoice: !entryInvoice,
      entryDate: !entryDate,
      services: !isScrap && !selectedServices.some(s => s.selected),
      scrapReason: isScrap && !scrapReason
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    let status = "peritagemPendente";
    let cycles: Cycle[] = [];
    
    if (isScrap) {
      status = "sucateadoPendente";
      cycles = [{
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        outcome: "scrapped" as CycleOutcome,
        comments: scrapReason,
        technicianId: "sistema"
      }];
    }
    
    onSubmit({
      tagNumber,
      entryInvoice,
      entryDate: entryDate ? format(entryDate, 'yyyy-MM-dd') : '',
      services: selectedServices,
      status,
      cycles: initialData?.cycles || cycles
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Setor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tagNumber" className={formErrors.tagNumber ? "text-red-500" : ""}>
                Número da TAG*
              </Label>
              <Input
                id="tagNumber"
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                placeholder="Ex: ABC-123"
                className={formErrors.tagNumber ? "border-red-500" : ""}
              />
              {formErrors.tagNumber && (
                <p className="text-xs text-red-500">TAG é obrigatória</p>
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
                placeholder="Ex: NF-12345"
                className={formErrors.entryInvoice ? "border-red-500" : ""}
              />
              {formErrors.entryInvoice && (
                <p className="text-xs text-red-500">Nota fiscal é obrigatória</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entryDate" className={formErrors.entryDate ? "text-red-500" : ""}>
                Data de Entrada*
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !entryDate && "text-muted-foreground",
                      formErrors.entryDate && "border-red-500"
                    )}
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formErrors.entryDate && (
                <p className="text-xs text-red-500">Data é obrigatória</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isScrap" 
                  checked={isScrap} 
                  onCheckedChange={setIsScrap} 
                />
                <Label htmlFor="isScrap">Marcar como Sucateado</Label>
              </div>
              <p className="text-xs text-gray-500">
                Marque esta opção se o setor já chegou sucateado ou não pode ser recuperado
              </p>
            </div>
          </div>
          
          {isScrap && (
            <div className="space-y-2">
              <Label htmlFor="scrapReason" className={formErrors.scrapReason ? "text-red-500" : ""}>
                Motivo do Sucateamento*
              </Label>
              <Textarea
                id="scrapReason"
                value={scrapReason}
                onChange={(e) => setScrapReason(e.target.value)}
                placeholder="Descreva o motivo pelo qual o setor deve ser sucateado"
                className={formErrors.scrapReason ? "border-red-500" : ""}
              />
              {formErrors.scrapReason && (
                <p className="text-xs text-red-500">O motivo do sucateamento é obrigatório</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {!isScrap && (
        <Card>
          <CardHeader>
            <CardTitle>Serviços Necessários</CardTitle>
          </CardHeader>
          <CardContent>
            {formErrors.services && (
              <p className="text-xs text-red-500 mb-4">Selecione pelo menos um serviço</p>
            )}
            
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <ServiceCheckbox
                  key={service.id}
                  service={service}
                  onServiceChange={handleServiceChange}
                  onQuantityChange={handleQuantityChange}
                  onObservationChange={handleObservationChange}
                  onPhotoUpload={handlePhotoUpload}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : mode === "create" ? "Registrar Setor" : "Atualizar Setor"}
        </Button>
      </div>
    </form>
  );
}
