
import { ChangeEvent } from "react";
import { Service, Sector } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ServiceCheckbox from "./ServiceCheckbox";
import PhotoUpload from "./PhotoUpload";

interface ExitFormProps {
  exitInvoice: string;
  setExitInvoice: (value: string) => void;
  observations: string;
  setObservations: (value: string) => void;
  completedServices: Service[];
  handleCompletedServiceChange: (id: string, checked: boolean) => void;
  exitPhotos: string[];
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, type: 'tag' | 'entry' | 'exit') => void;
  defaultValues?: Partial<Sector>;
  today: string;
}

export default function ExitForm({
  exitInvoice,
  setExitInvoice,
  observations,
  setObservations,
  completedServices,
  handleCompletedServiceChange,
  exitPhotos,
  handleImageUpload,
  defaultValues,
  today
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
            <Label>Data de Saída</Label>
            <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md">
              {today}
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Serviços Realizados *</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultValues?.services?.filter(s => s.selected).map((service) => (
            <ServiceCheckbox 
              key={service.id}
              service={service}
              onChange={handleCompletedServiceChange}
              isCompleted={completedServices.some(s => s.id === service.id)}
              completedCheckboxId={`completed-${service.id}`}
            />
          ))}
        </div>
      </div>

      {/* Photos */}
      <PhotoUpload
        id="exitPhotos"
        title="Fotos Após Serviço"
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
