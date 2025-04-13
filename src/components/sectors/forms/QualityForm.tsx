
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Service } from "@/types";

interface QualityFormProps {
  services: Service[];
  selectedTab: string;
  setSelectedTab: (value: string) => void;
  exitDate: Date | undefined;
  setExitDate: (date: Date | undefined) => void;
  exitInvoice: string;
  setExitInvoice: (value: string) => void;
  exitObservations: string;
  setExitObservations: (value: string) => void;
  qualityCompleted: boolean;
  setQualityCompleted: (value: boolean) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  formErrors: {
    photos?: boolean;
    exitDate?: boolean;
    exitInvoice?: boolean;
    exitObservations?: boolean;
  };
}

export default function QualityForm({
  services,
  selectedTab,
  setSelectedTab,
  exitDate,
  setExitDate,
  exitInvoice,
  setExitInvoice,
  exitObservations,
  setExitObservations,
  qualityCompleted,
  setQualityCompleted,
  handlePhotoUpload,
  formErrors
}: QualityFormProps) {
  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="exit">Saída do Setor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="space-y-4">
          <div className="py-2 space-y-1">
            <h3 className="font-medium">Checagem de Qualidade</h3>
            <p className="text-sm text-gray-500">
              Verifique os serviços realizados e faça o upload das fotos do serviço concluído.
            </p>
          </div>
          
          {formErrors.photos && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              Cada serviço deve ter pelo menos uma foto após a execução.
            </div>
          )}
          
          {services.filter(service => service.selected).map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-2">
                <CardTitle className="text-base">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Fotos Antes</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.photos?.filter(photo => typeof photo === 'object' && photo.type === 'before').length > 0 ? (
                        service.photos
                          .filter(photo => typeof photo === 'object' && photo.type === 'before')
                          .map((photo) => (
                            typeof photo === 'object' && photo.url && (
                              <img 
                                key={photo.id} 
                                src={photo.url} 
                                alt={service.name} 
                                className="w-20 h-20 object-cover rounded border"
                              />
                            )
                          ))
                      ) : (
                        <p className="text-sm text-gray-500">Nenhuma foto disponível</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Fotos Depois</h4>
                    <Input
                      id={`photo-after-${service.id}`}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handlePhotoUpload(service.id, e.target.files, "after")}
                      className="w-full"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {service.photos?.filter(photo => typeof photo === 'object' && photo.type === 'after').map(photo => (
                        typeof photo === 'object' && photo.url && (
                          <img 
                            key={photo.id} 
                            src={photo.url} 
                            alt={service.name} 
                            className="w-20 h-20 object-cover rounded border"
                          />
                        )
                      ))}
                    </div>
                  </div>
                </div>
                
                {service.observations && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Observações da Peritagem:</h4>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                      {service.observations}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="exit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Saída</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exitInvoice" className={formErrors.exitInvoice ? "text-red-500" : ""}>
                  Nota Fiscal de Saída*
                </Label>
                <Input
                  id="exitInvoice"
                  value={exitInvoice}
                  onChange={(e) => setExitInvoice(e.target.value)}
                  placeholder="Ex: NF-54321"
                  className={formErrors.exitInvoice ? "border-red-500" : ""}
                />
                {formErrors.exitInvoice && (
                  <p className="text-xs text-red-500">Nota fiscal de saída é obrigatória</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exitDate" className={formErrors.exitDate ? "text-red-500" : ""}>
                  Data de Saída*
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="exitDate"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !exitDate && "text-muted-foreground",
                        formErrors.exitDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exitDate ? format(exitDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exitDate}
                      onSelect={setExitDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.exitDate && (
                  <p className="text-xs text-red-500">Data de saída é obrigatória</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exitObservations">
                  Observações Adicionais
                </Label>
                <Textarea
                  id="exitObservations"
                  value={exitObservations}
                  onChange={(e) => setExitObservations(e.target.value)}
                  placeholder="Registre observações sobre a qualidade do setor..."
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch 
                  id="qualityCompleted" 
                  checked={qualityCompleted} 
                  onCheckedChange={setQualityCompleted} 
                />
                <Label htmlFor="qualityCompleted">Marcar checagem como concluída</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
