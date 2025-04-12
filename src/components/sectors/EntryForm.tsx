
import { ChangeEvent } from "react";
import { Service, ServiceType, Sector } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus } from "lucide-react";
import ServiceCheckbox from "./ServiceCheckbox";
import PhotoUpload from "./PhotoUpload";

interface EntryFormProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  observations: string;
  setObservations: (value: string) => void;
  selectedServices: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleServiceQuantityChange: (id: ServiceType, quantity: number) => void;
  handleServiceObservationChange: (id: ServiceType, observation: string) => void;
  handleServicePhotoUpload: (id: ServiceType, files: FileList, type: 'before' | 'after') => void;
  tagPhotoUrl?: string;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, type: 'tag' | 'entry' | 'exit') => void;
  entryPhotos: string[];
  defaultValues?: Partial<Sector>;
  today: string;
}

export default function EntryForm({
  tagNumber,
  setTagNumber,
  entryInvoice,
  setEntryInvoice,
  observations,
  setObservations,
  selectedServices,
  handleServiceChange,
  handleServiceQuantityChange,
  handleServiceObservationChange,
  handleServicePhotoUpload,
  tagPhotoUrl,
  handleImageUpload,
  entryPhotos,
  defaultValues,
  today
}: EntryFormProps) {
  return (
    <>
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
              disabled={defaultValues?.tagNumber !== undefined}
              required
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
                disabled={tagPhotoUrl !== undefined}
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

          <div>
            <Label>Data de Entrada</Label>
            <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md">
              {today}
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Serviços Necessários *</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione os serviços necessários. Para cada serviço, é <strong>obrigatório</strong> adicionar pelo menos uma foto do defeito.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedServices.map((service) => (
            <div key={service.id} className="space-y-2">
              <ServiceCheckbox 
                service={service} 
                onChange={handleServiceChange}
                onQuantityChange={handleServiceQuantityChange}
                onObservationChange={handleServiceObservationChange}
                onPhotoUpload={handleServicePhotoUpload}
                photoType="before"
                required={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* General Photos */}
      <PhotoUpload
        id="entryPhotos"
        title="Fotos Gerais (Opcionais)"
        onPhotoUpload={handleImageUpload}
        type="entry"
        photos={entryPhotos}
      />

      {/* Observations */}
      <div className="space-y-2">
        <Label htmlFor="observations">
          Observações Gerais
        </Label>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Observações sobre o estado do setor..."
          className="min-h-[100px]"
        />
      </div>
    </>
  );
}
