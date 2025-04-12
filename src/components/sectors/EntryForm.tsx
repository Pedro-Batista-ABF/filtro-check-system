
import { useState, ChangeEvent } from "react";
import { Sector, Service, ServiceType, Cycle, Photo } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ServiceCheckbox from "./ServiceCheckbox";
import QuantityInput from "./QuantityInput";
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
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, type: 'tag' | 'entry' | 'exit' | 'scrap') => void;
  entryPhotos: Photo[];
  defaultValues?: Partial<Sector>;
  today: string;
  entryDate: Date;
  setEntryDate: (date: Date) => void;
  isScrap: boolean;
  setIsScrap: (value: boolean) => void;
  scrapObservations: string;
  setScrapObservations: (value: string) => void;
  scrapPhotos: Photo[];
  cycleHistory: Cycle[];
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
  const [activeTab, setActiveTab] = useState<'services' | 'scrap'>(isScrap ? 'scrap' : 'services');

  // Set the active tab when isScrap changes
  const handleScrapChange = (value: boolean) => {
    setIsScrap(value);
    setActiveTab(value ? 'scrap' : 'services');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Dados do Setor</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tagNumber">TAG do Setor *</Label>
              <Input
                id="tagNumber"
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            
            <PhotoUpload
              id="tagPhoto"
              title="Foto da TAG do Setor *"
              onPhotoUpload={(e) => handleImageUpload(e, 'tag')}
              type="tag"
              photos={tagPhotoUrl ? [tagPhotoUrl] : []}
            />

            {cycleHistory.length > 0 && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium">
                      Este setor já foi recuperado anteriormente {cycleHistory.length} vez(es)
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {cycleHistory.map((cycle, index) => (
                      <div key={index} className={`p-2 rounded ${cycle.outcome === 'recovered' ? 'bg-green-50' : cycle.outcome === 'scrapped' ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div>
                          <span className="font-medium">Data: </span>
                          {cycle.entryDate}
                        </div>
                        <div>
                          <span className="font-medium">Resultado: </span>
                          <span className={cycle.outcome === 'recovered' ? 'text-green-600' : cycle.outcome === 'scrapped' ? 'text-red-600' : 'text-gray-600'}>
                            {cycle.outcome === 'recovered' ? 'Recuperado' : cycle.outcome === 'scrapped' ? 'Sucateado' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4">Dados da Peritagem</h3>
          
          <div>
            <Label htmlFor="entryInvoice">Número da Nota Fiscal *</Label>
            <Input
              id="entryInvoice"
              value={entryInvoice}
              onChange={(e) => setEntryInvoice(e.target.value)}
              className="mt-1"
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
                    className="p-3"
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
          
          <div className="border rounded-md p-4 mt-6">
            <Label className="flex items-center space-x-2 font-medium mb-4">
              <Checkbox id="isScrap" checked={isScrap} onCheckedChange={(checked) => handleScrapChange(checked as boolean)} />
              <span>Setor deve ser sucateado (não há possibilidade de recuperação)</span>
            </Label>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        {activeTab === 'services' ? (
          <>
            <h3 className="text-lg font-medium mb-4">Serviços a Executar</h3>
            
            <div className="space-y-6">
              {selectedServices.map((service) => (
                <ServiceCheckbox
                  key={service.id}
                  service={service}
                  onServiceChange={handleServiceChange}
                  onQuantityChange={service.id === 'substituicao_parafusos' ? handleServiceQuantityChange : undefined}
                  onObservationChange={handleServiceObservationChange}
                  onPhotoUpload={handleServicePhotoUpload}
                />
              ))}
              
              <div>
                <Label htmlFor="observations">
                  Observações Gerais (opcional)
                </Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações adicionais sobre o setor..."
                  className="min-h-[100px] mt-1"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-4">Dados do Sucateamento</h3>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="scrapObservations" className="text-red-600">
                  Motivo do Sucateamento *
                </Label>
                <Textarea
                  id="scrapObservations"
                  value={scrapObservations}
                  onChange={(e) => setScrapObservations(e.target.value)}
                  placeholder="Descreva detalhadamente o motivo pelo qual o setor deve ser sucateado..."
                  className="min-h-[100px] mt-1"
                  required
                />
              </div>
              
              <div>
                <Label className="text-red-600">
                  Fotos do Defeito Irreversível *
                </Label>
                <p className="text-sm text-gray-500 mb-4">
                  Tire fotos que evidenciem claramente o dano irreversível do setor
                </p>
                <div className="mt-1">
                  <Label 
                    htmlFor="scrapPhotos" 
                    className="cursor-pointer flex flex-col items-center justify-center bg-gray-50 border border-dashed border-red-300 rounded-lg p-8 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Clique para adicionar fotos do defeito
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Você pode selecionar múltiplas fotos
                    </span>
                  </Label>
                  <Input
                    id="scrapPhotos"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'scrap')}
                  />
                </div>
                
                {scrapPhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-3 text-gray-700">
                      {scrapPhotos.length} foto(s) adicionada(s):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {scrapPhotos.map((photo, index) => (
                        <div key={index} className="relative h-28 bg-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <img 
                            src={photo.url} 
                            alt={`Foto ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
