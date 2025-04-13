
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Sector, 
  Service, 
  Cycle, 
  Photo, 
  CycleOutcome 
} from "@/types";
import ServiceCheckbox from "./ServiceCheckbox";
import PhotoUpload from "./PhotoUpload";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SectorFormProps {
  sector: Sector;
  onSubmit: (sector: Sector) => void;
  loading?: boolean;
  mode: 'review' | 'production' | 'quality' | 'scrap';
  services?: Service[]; // Adicionando propriedade services
  formType?: string;    // Adicionando propriedade formType
  photoRequired?: boolean; // Nova propriedade para foto obrigatória
}

export default function SectorForm({
  sector: initialSector,
  onSubmit,
  loading = false,
  mode,
  services: initialServices,
  photoRequired = false
}: SectorFormProps) {
  const [sector, setSector] = useState<Sector>(initialSector);
  const [services, setServices] = useState<Service[]>(initialServices || initialSector.services || []);
  const [exitDate, setExitDate] = useState<Date | undefined>(
    sector.exitDate ? new Date(sector.exitDate) : undefined
  );
  const [exitInvoice, setExitInvoice] = useState(sector.exitInvoice || "");
  const [exitObservations, setExitObservations] = useState(sector.exitObservations || "");
  const [selectedTab, setSelectedTab] = useState("services");
  const [tagNumber, setTagNumber] = useState(sector.tagNumber || "");
  const [entryInvoice, setEntryInvoice] = useState(sector.entryInvoice || "");
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    sector.entryDate ? new Date(sector.entryDate) : new Date()
  );
  const [tagPhotoUrl, setTagPhotoUrl] = useState<string | undefined>(sector.tagPhotoUrl);
  const [entryObservations, setEntryObservations] = useState(sector.entryObservations || "");
  const [productionCompleted, setProductionCompleted] = useState(
    initialSector.status === "checagemFinalPendente" || 
    initialSector.status === "concluido" ||
    initialSector.status === "sucateado"
  );
  const [qualityCompleted, setQualityCompleted] = useState(
    initialSector.status === "concluido" ||
    initialSector.status === "sucateado"
  );

  // Para sucateamento
  const [isScrap, setIsScrap] = useState(false);
  const [scrapObservations, setScrapObservations] = useState(sector.scrapObservations || "");
  const [scrapDate, setScrapDate] = useState<Date | undefined>(
    sector.scrapReturnDate ? new Date(sector.scrapReturnDate) : new Date()
  );
  const [scrapInvoice, setScrapInvoice] = useState(sector.scrapReturnInvoice || "");

  const { toast } = useToast();

  // Form validation
  const [formErrors, setFormErrors] = useState({
    services: false,
    photos: false,
    exitDate: false,
    exitInvoice: false,
    exitObservations: false,
    scrapObservations: false,
    scrapDate: false,
    scrapInvoice: false,
    tagNumber: false,
    tagPhoto: false,
    entryInvoice: false,
    entryDate: false
  });

  // Manipulador para upload de foto do TAG
  const handleTagPhotoUpload = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setTagPhotoUrl(url);
    }
  };

  // Check if all selected services have photos
  const checkServicePhotos = () => {
    if (mode !== 'quality') return true;
    
    let allPhotosValid = true;
    const selectedServiceIds = services.filter(s => s.selected).map(s => s.id);
    
    selectedServiceIds.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      const hasAfterPhoto = service?.photos?.some(p => typeof p === 'object' && p.type === 'after');
      if (!hasAfterPhoto) {
        allPhotosValid = false;
      }
    });
    
    return allPhotosValid;
  };

  const validateForm = () => {
    if (mode === 'production') {
      // Para produção, verificamos se pelo menos um serviço foi marcado como concluído
      return true;
    } 
    else if (mode === 'quality') {
      // Para qualidade, verificamos se data de saída, NF e fotos "depois" foram incluídas
      const errors = {
        services: false,
        photos: !checkServicePhotos(),
        exitDate: !exitDate,
        exitInvoice: !exitInvoice,
        exitObservations: false,
        scrapObservations: false,
        scrapDate: false,
        scrapInvoice: false,
        tagNumber: false,
        tagPhoto: false,
        entryInvoice: false,
        entryDate: false
      };
      
      setFormErrors(errors);
      return !Object.values(errors).some(Boolean);
    }
    else if (mode === 'scrap') {
      // Para sucateamento, verificamos se informações de sucateamento foram preenchidas
      const errors = {
        services: false,
        photos: false,
        exitDate: false,
        exitInvoice: false,
        exitObservations: false,
        scrapObservations: isScrap && !scrapObservations,
        scrapDate: isScrap && !scrapDate,
        scrapInvoice: isScrap && !scrapInvoice,
        tagNumber: false,
        tagPhoto: false,
        entryInvoice: false,
        entryDate: false
      };
      
      setFormErrors(errors);
      return !Object.values(errors).some(Boolean);
    }
    
    return true;
  };

  const handleServiceChange = (id: string, checked: boolean) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, selected: checked } 
          : service
      )
    );
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, quantity } 
          : service
      )
    );
  };

  const handleObservationChange = (id: string, observations: string) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, observations } 
          : service
      )
    );
  };

  const handlePhotoUpload = (id: string, files: FileList, type: "before" | "after") => {
    setServices(prev => 
      prev.map(service => {
        if (service.id === id) {
          // Keep existing photos of other types, add new ones
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

  const handleProductionToggle = (checked: boolean) => {
    setProductionCompleted(checked);
    
    // Se produção foi marcada como concluída, atualize o status
    if (checked && sector.status === "emExecucao") {
      setSector(prev => ({
        ...prev,
        status: "checagemFinalPendente"
      }));
    }
    // Se produção foi desmarcada, volte ao status anterior
    else if (!checked && sector.status === "checagemFinalPendente") {
      setSector(prev => ({
        ...prev,
        status: "emExecucao"
      }));
    }
  };

  const createCycle = (type: "recovered" | "scrapped", comments: string): Cycle => {
    return {
      id: Date.now().toString(),
      tagNumber: sector.tagNumber,
      entryInvoice: sector.entryInvoice,
      entryDate: sector.entryDate,
      peritagemDate: sector.peritagemDate,
      services: sector.services,
      beforePhotos: sector.beforePhotos || [],
      status: type === "recovered" ? "concluido" : "sucateado",
      outcome: type as CycleOutcome,
      createdAt: new Date().toISOString(),
      comments,
      technicianId: "sistema", // Considere pegar do usuário atual em um sistema real
      productionCompleted: true
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const errors = {
      ...formErrors,
      tagNumber: !tagNumber,
      tagPhoto: photoRequired && !tagPhotoUrl,
      entryInvoice: !entryInvoice,
      entryDate: !entryDate,
      services: mode === 'review' && !services.some(s => s.selected)
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(Boolean)) {
      toast({
        title: "Formulário Incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Construir objeto do setor atualizado
    const updatedSector = {
      ...sector,
      tagNumber,
      tagPhotoUrl,
      entryInvoice,
      entryDate: entryDate ? format(entryDate, 'yyyy-MM-dd') : '',
      entryObservations,
      services,
    };
    
    // Lógica específica para cada modo
    if (mode === 'production') {
      // Se a produção está concluída, atualize o status
      if (productionCompleted && sector.status === "emExecucao") {
        updatedSector.status = "checagemFinalPendente";
      }
    } 
    else if (mode === 'quality') {
      // Se qualidade está concluída, marque como concluído e adicione dados da saída
      if (qualityCompleted) {
        updatedSector.status = "concluido";
        updatedSector.exitDate = exitDate ? format(exitDate, 'yyyy-MM-dd') : undefined;
        updatedSector.exitInvoice = exitInvoice;
        updatedSector.exitObservations = exitObservations;
        
        // Criar um ciclo para o setor recuperado
        const newCycle: Cycle = {
          id: Date.now().toString(),
          tagNumber: updatedSector.tagNumber,
          entryInvoice: updatedSector.entryInvoice,
          entryDate: updatedSector.entryDate,
          peritagemDate: updatedSector.peritagemDate,
          services: updatedSector.services,
          beforePhotos: updatedSector.beforePhotos || [],
          status: "concluido",
          outcome: "recovered" as CycleOutcome,
          createdAt: new Date().toISOString(),
          comments: exitObservations || "",
          technicianId: "sistema", // Considere pegar do usuário atual em um sistema real
          productionCompleted: true
        };
        
        updatedSector.cycles = [...(sector.cycles || []), newCycle];
      }
    }
    else if (mode === 'scrap') {
      // Marcar como sucateado se necessário
      if (isScrap) {
        updatedSector.status = "sucateado";
        updatedSector.scrapObservations = scrapObservations;
        updatedSector.scrapReturnDate = scrapDate ? format(scrapDate, 'yyyy-MM-dd') : undefined;
        updatedSector.scrapReturnInvoice = scrapInvoice;
        
        // Criar um ciclo para o setor sucateado
        const newCycle: Cycle = {
          id: Date.now().toString(),
          tagNumber: updatedSector.tagNumber,
          entryInvoice: updatedSector.entryInvoice,
          entryDate: updatedSector.entryDate,
          peritagemDate: updatedSector.peritagemDate,
          services: updatedSector.services,
          beforePhotos: updatedSector.beforePhotos || [],
          status: "sucateado",
          outcome: "scrapped" as CycleOutcome,
          createdAt: new Date().toISOString(),
          comments: scrapObservations || "",
          technicianId: "sistema",
          productionCompleted: true
        };
        
        updatedSector.cycles = [...(sector.cycles || []), newCycle];
      }
    }
    
    onSubmit(updatedSector);
  };

  // Renderização condicional para o modo 'review' (peritagem)
  const renderReviewMode = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Setor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      id="entryDate"
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
                <Label htmlFor="peritagemDate">
                  Data da Peritagem (auto-preenchida)
                </Label>
                <Input
                  id="peritagemDate"
                  value={format(new Date(), "dd/MM/yyyy")}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Data preenchida automaticamente</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tagPhoto" className={formErrors.tagPhoto ? "text-red-500" : ""}>
                Foto do TAG* {photoRequired && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="tagPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleTagPhotoUpload(e.target.files)}
                className={formErrors.tagPhoto ? "border-red-500" : ""}
              />
              {tagPhotoUrl && (
                <div className="mt-2">
                  <img 
                    src={tagPhotoUrl} 
                    alt="TAG do Setor" 
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
              {formErrors.tagPhoto && (
                <p className="text-xs text-red-500">Foto do TAG é obrigatória</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryObservations">
                Observações de Entrada
              </Label>
              <Textarea
                id="entryObservations"
                value={entryObservations}
                onChange={(e) => setEntryObservations(e.target.value)}
                placeholder="Observações sobre o estado do setor na entrada..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Necessários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <ServiceCheckbox
                key={service.id}
                service={service}
                checked={service.selected}
                onChecked={handleServiceChange}
                onQuantityChange={handleQuantityChange}
                onObservationChange={handleObservationChange}
                onPhotoUpload={handlePhotoUpload}
                photoType="before"
                required={true}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderização condicional com base no modo
  const renderModeContent = () => {
    switch (mode) {
      case 'review':
        return renderReviewMode();
        
      case 'production':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="text-lg font-medium">Progresso da Execução</h3>
                <p className="text-sm text-gray-500">Marque como concluído após finalizar os serviços</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="productionCompleted" 
                  checked={productionCompleted} 
                  onCheckedChange={handleProductionToggle} 
                  disabled={sector.status === "concluido" || sector.status === "sucateado"} 
                />
                <Label htmlFor="productionCompleted">Setor concluído pela produção?</Label>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Serviços Necessários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.filter(service => service.selected).map((service) => (
                  <div key={service.id} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-500 my-1">
                      Quantidade: {service.quantity}
                    </p>
                    {service.observations && (
                      <p className="text-sm mt-2 bg-gray-50 p-2 rounded">
                        <strong>Observações:</strong> {service.observations}
                      </p>
                    )}
                    
                    {service.photos && service.photos.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">Fotos do defeito:</p>
                        <div className="flex flex-wrap gap-2">
                          {service.photos
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
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
        
      case 'quality':
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
        
      case 'scrap':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Validação para Sucateamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h3 className="font-medium mb-2">Informações do Setor</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>TAG:</strong> {sector.tagNumber}</div>
                      <div><strong>NF Entrada:</strong> {sector.entryInvoice}</div>
                      <div><strong>Data Entrada:</strong> {sector.entryDate}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Motivo do Sucateamento</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {sector.cycles && sector.cycles.length > 0 && sector.cycles[0].comments}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch 
                      id="isScrap" 
                      checked={isScrap} 
                      onCheckedChange={setIsScrap} 
                    />
                    <Label htmlFor="isScrap">Confirmar Sucateamento</Label>
                  </div>
                  
                  {isScrap && (
                    <div className="pl-6 space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="scrapObservations" className={formErrors.scrapObservations ? "text-red-500" : ""}>
                          Comentários Adicionais*
                        </Label>
                        <Textarea
                          id="scrapObservations"
                          value={scrapObservations}
                          onChange={(e) => setScrapObservations(e.target.value)}
                          placeholder="Adicione comentários sobre o sucateamento..."
                          className={formErrors.scrapObservations ? "border-red-500" : ""}
                        />
                        {formErrors.scrapObservations && (
                          <p className="text-xs text-red-500">Comentários são obrigatórios</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scrapInvoice" className={formErrors.scrapInvoice ? "text-red-500" : ""}>
                          Nota Fiscal de Devolução*
                        </Label>
                        <Input
                          id="scrapInvoice"
                          value={scrapInvoice}
                          onChange={(e) => setScrapInvoice(e.target.value)}
                          placeholder="Ex: NF-54321"
                          className={formErrors.scrapInvoice ? "border-red-500" : ""}
                        />
                        {formErrors.scrapInvoice && (
                          <p className="text-xs text-red-500">Nota fiscal é obrigatória</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scrapDate" className={formErrors.scrapDate ? "text-red-500" : ""}>
                          Data de Devolução*
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="scrapDate"
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !scrapDate && "text-muted-foreground",
                                formErrors.scrapDate && "border-red-500"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {scrapDate ? format(scrapDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={scrapDate}
                              onSelect={setScrapDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {formErrors.scrapDate && (
                          <p className="text-xs text-red-500">Data é obrigatória</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'review' ? renderReviewMode() : renderModeContent()}
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            mode === 'scrap' 
              ? (isScrap ? 'Confirmar Sucateamento' : 'Salvar') 
              : (mode === 'quality' && qualityCompleted ? 'Finalizar Setor' : 'Salvar Alterações')
          )}
        </Button>
      </div>
    </form>
  );
}
