
import { ChangeEvent, useState } from "react";
import { Service, ServiceType, Sector, Photo, Cycle } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Calendar, AlertTriangle } from "lucide-react";
import ServiceCheckbox from "./ServiceCheckbox";
import PhotoUpload from "./PhotoUpload";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, type: 'tag' | 'entry' | 'exit' | 'scrap') => void;
  entryPhotos: string[];
  defaultValues?: Partial<Sector>;
  today: string;
  entryDate: Date;
  setEntryDate: (date: Date) => void;
  isScrap: boolean;
  setIsScrap: (value: boolean) => void;
  scrapObservations: string;
  setScrapObservations: (value: string) => void;
  scrapPhotos: string[];
  cycleHistory?: Cycle[];
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
  today,
  entryDate,
  setEntryDate,
  isScrap,
  setIsScrap,
  scrapObservations,
  setScrapObservations,
  scrapPhotos,
  cycleHistory
}: EntryFormProps) {
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <>
      {/* Tag and Invoice Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tagNumber">Número da TAG *</Label>
            <Input
              id="tagNumber"
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              placeholder="Ex: TAG-1234"
              className="mt-1"
              disabled={defaultValues?.tagNumber !== undefined}
              required
            />
            {cycleHistory && cycleHistory.length > 0 && (
              <div className="mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs"
                >
                  {showHistory ? "Ocultar histórico" : `Visualizar histórico (${cycleHistory.length} ciclos anteriores)`}
                </Button>
              </div>
            )}
          </div>

          {/* Display history if available and requested */}
          {cycleHistory && cycleHistory.length > 0 && showHistory && (
            <Card className="bg-slate-50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Histórico da TAG</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cycleHistory.map((cycle, index) => (
                    <div key={cycle.id} className="pb-2">
                      <p className="font-semibold">
                        Ciclo {index + 1} - {cycle.outcome}
                      </p>
                      <p>Entrada: {format(new Date(cycle.entryDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                      {cycle.outcome === 'Recuperado' && cycle.exitDate && (
                        <p>Saída: {format(new Date(cycle.exitDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                      )}
                      {cycle.outcome === 'Sucateado' && cycle.scrapReturnDate && (
                        <p>Devolução: {format(new Date(cycle.scrapReturnDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                      )}
                      {cycle.services.filter(s => s.selected).length > 0 && (
                        <p>Serviços: {cycle.services.filter(s => s.selected).map(s => s.name).join(', ')}</p>
                      )}
                      {index < cycleHistory.length - 1 && <Separator className="mt-2" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="tagPhoto">Foto da TAG</Label>
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
            <Label htmlFor="entryDate">Data de Entrada *</Label>
            <div className="mt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !entryDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={entryDate}
                    onSelect={(date) => date && setEntryDate(date)}
                    initialFocus
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Data da Peritagem</Label>
            <div className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md">
              {today}
            </div>
          </div>
        </div>
      </div>

      {/* Scrap Toggle */}
      <div className="border border-amber-200 bg-amber-50 rounded-md p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div className="flex items-center justify-between flex-1">
            <Label htmlFor="scrap-toggle" className="font-medium">
              Marcar setor como Sucateado
            </Label>
            <Switch
              id="scrap-toggle"
              checked={isScrap}
              onCheckedChange={setIsScrap}
            />
          </div>
        </div>
        
        {isScrap && (
          <div className="mt-4 space-y-4">
            <div className="text-sm text-amber-800">
              <p>Ao marcar o setor como sucateado, ele será encaminhado diretamente para a verificação de qualidade, sem passar pela etapa de execução.</p>
            </div>
            
            <div>
              <Label htmlFor="scrapObservations" className="text-amber-800">
                Motivo do Sucateamento (obrigatório) *
              </Label>
              <Textarea
                id="scrapObservations"
                value={scrapObservations}
                onChange={(e) => setScrapObservations(e.target.value)}
                placeholder="Descreva o motivo pelo qual o setor não é recuperável..."
                className="min-h-[100px] mt-1"
                required={isScrap}
              />
            </div>
            
            <div>
              <Label className="text-amber-800 mb-2 block">
                Fotos do Defeito Irreversível (obrigatório) *
              </Label>
              <div className="mt-1">
                <Label 
                  htmlFor="scrapPhotos" 
                  className="cursor-pointer flex items-center justify-center bg-white border border-dashed border-amber-300 rounded-md p-3 w-full hover:bg-amber-50 transition-colors"
                >
                  <ImagePlus className="h-5 w-5 mr-2 text-amber-500" />
                  <span className="text-sm">Adicionar fotos do defeito irreversível</span>
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
                        alt={`Foto de sucateamento ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Services - Only show if not scrap */}
      {!isScrap && (
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
      )}

      {/* General Photos - Only if not scrap */}
      {!isScrap && (
        <PhotoUpload
          id="entryPhotos"
          title="Fotos Gerais (Opcionais)"
          onPhotoUpload={handleImageUpload}
          type="entry"
          photos={entryPhotos}
        />
      )}

      {/* Observations - Only if not scrap */}
      {!isScrap && (
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
      )}
    </>
  );
}
