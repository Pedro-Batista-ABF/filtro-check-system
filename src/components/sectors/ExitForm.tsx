
import { ChangeEvent } from "react";
import { Service, ServiceType, Sector } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ServiceCheckbox from "./ServiceCheckbox";
import PhotoUpload from "./PhotoUpload";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExitFormProps {
  exitInvoice: string;
  setExitInvoice: (value: string) => void;
  observations: string;
  setObservations: (value: string) => void;
  completedServices: Service[];
  selectedServices: Service[];
  handleCompletedServiceChange: (id: string, checked: boolean) => void;
  handleCompletedServicePhotoUpload: (id: ServiceType, files: FileList, type: 'before' | 'after') => void;
  exitPhotos: string[];
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, type: 'tag' | 'entry' | 'exit') => void;
  defaultValues?: Partial<Sector>;
  today: string;
  exitDate: Date;
  setExitDate: (date: Date) => void;
}

export default function ExitForm({
  exitInvoice,
  setExitInvoice,
  observations,
  setObservations,
  completedServices,
  selectedServices,
  handleCompletedServiceChange,
  handleCompletedServicePhotoUpload,
  exitPhotos,
  handleImageUpload,
  defaultValues,
  today,
  exitDate,
  setExitDate
}: ExitFormProps) {
  return (
    <>
      {/* Invoice Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tagNumber">Número da Tag</Label>
            <Input
              id="tagNumber"
              value={defaultValues?.tagNumber || ''}
              className="mt-1 bg-gray-100"
              disabled
            />
          </div>
        </div>

        <div className="space-y-4">
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

          <div>
            <Label htmlFor="exitDate">Data de Saída *</Label>
            <div className="mt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exitDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {exitDate ? format(exitDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={exitDate}
                    onSelect={(date) => date && setExitDate(date)}
                    initialFocus
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Data da Checagem</Label>
            <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md">
              {today}
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Serviços Realizados *</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Marque os serviços que foram realizados. Para cada serviço realizado, é <strong>obrigatório</strong> adicionar pelo menos uma foto do resultado.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultValues?.services?.filter(s => s.selected).map((service) => {
            // Find the service in the selectedServices array to access photos
            const updatedService = selectedServices.find(s => s.id === service.id) || service;
            
            return (
              <ServiceCheckbox 
                key={service.id}
                service={updatedService}
                onChange={handleCompletedServiceChange}
                onPhotoUpload={handleCompletedServicePhotoUpload}
                isCompleted={completedServices.some(s => s.id === service.id)}
                completedCheckboxId={`completed-${service.id}`}
                photoType="after"
                required={true}
              />
            );
          })}
        </div>
      </div>

      {/* Photos */}
      <PhotoUpload
        id="exitPhotos"
        title="Fotos Gerais Após Serviço (Opcionais)"
        onPhotoUpload={handleImageUpload}
        type="exit"
        photos={exitPhotos}
      />

      {/* Observations */}
      <div className="space-y-2">
        <Label htmlFor="observations">
          Observações Adicionais
        </Label>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Observações sobre os serviços realizados..."
          className="min-h-[100px]"
        />
      </div>
    </>
  );
}
