
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PhotoUpload from "@/components/sectors/PhotoUpload";
import { Service, Sector, Photo, PhotoWithFile } from "@/types";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import ScrapForm from "./forms/ScrapForm";
import ReviewForm from "./forms/ReviewForm";
import { Camera } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface SectorFormProps {
  sector: Sector;
  onSubmit?: (data: Partial<Sector>) => void;
  mode?: 'create' | 'edit' | 'view' | 'checagem' | 'scrap';
  isLoading?: boolean;
  photoRequired?: boolean;
}

export default function SectorForm({ 
  sector,
  onSubmit,
  mode = 'create',
  isLoading = false,
  photoRequired = false
}: SectorFormProps) {
  const [tagNumber, setTagNumber] = useState(sector.tagNumber || '');
  const [entryInvoice, setEntryInvoice] = useState(sector.entryInvoice || '');
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    sector.entryDate ? new Date(sector.entryDate) : new Date()
  );
  const [tagPhotoUrl, setTagPhotoUrl] = useState<string | undefined>(sector.tagPhotoUrl);
  const [entryObservations, setEntryObservations] = useState(sector.entryObservations || '');
  
  const [services, setServices] = useState<Service[]>(
    Array.isArray(sector.services) ? sector.services : []
  );
  
  const [formErrors, setFormErrors] = useState({
    tagNumber: false,
    tagPhoto: false,
    entryInvoice: false,
    entryDate: false,
    services: false,
    photos: false
  });
  
  const [isScrap, setIsScrap] = useState(false);
  const [scrapObservations, setScrapObservations] = useState('');
  const [scrapDate, setScrapDate] = useState<Date | undefined>();
  const [scrapInvoice, setScrapInvoice] = useState('');

  // Effect para inicializar o formulário com os dados do setor
  useEffect(() => {
    setTagNumber(sector.tagNumber || '');
    setEntryInvoice(sector.entryInvoice || '');
    setEntryDate(sector.entryDate ? new Date(sector.entryDate) : new Date());
    setTagPhotoUrl(sector.tagPhotoUrl);
    setEntryObservations(sector.entryObservations || '');
    
    // Garantir que services seja sempre um array
    if (Array.isArray(sector.services)) {
      setServices(sector.services);
    } else {
      console.warn("Services não é um array válido:", sector.services);
      setServices([]);
    }

    // Quando estamos em modo de sucateamento
    if (mode === 'scrap') {
      setIsScrap(sector.scrapValidated || false);
    }
  }, [sector, mode]);

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

  const handleTagPhotoUpload = async (files: FileList) => {
    if (files.length > 0) {
      // Simular URL temporária para visualização
      const tempUrl = URL.createObjectURL(files[0]);
      setTagPhotoUrl(tempUrl);
      
      // Aqui você adicionaria a lógica para upload real
      // E então atualizaria a URL após o upload completar
      toast.success("Foto da TAG capturada");
    }
  };

  const handlePhotoUpload = (id: string, files: FileList, type: "before" | "after") => {
    if (files.length > 0) {
      setServices(prev => 
        prev.map(service => {
          if (service.id === id) {
            // Criar foto com URL temporária
            const newPhotos = [...(service.photos || [])];
            
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const tempId = `temp-${Date.now()}-${i}`;
              const tempUrl = URL.createObjectURL(file);
              
              newPhotos.push({
                id: tempId,
                url: tempUrl,
                type,
                serviceId: id,
                file // Armazenar o arquivo para upload posterior
              });
            }
            
            return { ...service, photos: newPhotos };
          }
          return service;
        })
      );
      
      toast.success("Foto adicionada ao serviço");
    }
  };

  // Função para captura de foto via câmera
  const handleCameraCapture = (e: React.MouseEvent, serviceId?: string) => {
    e.preventDefault();
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment';
    
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        if (serviceId) {
          handlePhotoUpload(serviceId, target.files, 'before');
        } else {
          handleTagPhotoUpload(target.files);
        }
      }
    });
    
    fileInput.click();
  };

  const validateForm = (): boolean => {
    const errors = {
      tagNumber: !tagNumber.trim(),
      tagPhoto: !tagPhotoUrl,
      entryInvoice: !entryInvoice.trim(),
      entryDate: !entryDate,
      services: false,
      photos: false
    };

    const selectedServices = services.filter(s => s.selected);
    errors.services = selectedServices.length === 0;

    // Verificar se todos os serviços selecionados têm fotos
    const servicesWithoutPhotos = selectedServices.filter(
      service => !service.photos || service.photos.length === 0
    );
    errors.photos = servicesWithoutPhotos.length > 0;

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Formulário com erros", {
        description: "Verifique os campos destacados e tente novamente."
      });
      return;
    }
    
    if (onSubmit) {
      // Formatar a data para string no formato ISO
      const entryDateStr = entryDate ? format(entryDate, 'yyyy-MM-dd') : '';
      
      const formData: Partial<Sector> = {
        tagNumber,
        tagPhotoUrl,
        entryInvoice,
        entryDate: entryDateStr,
        peritagemDate: format(new Date(), 'yyyy-MM-dd'),
        entryObservations,
        services,
        beforePhotos: services.flatMap(s => s.photos || []),
        afterPhotos: []
      };
      
      // Informações específicas de sucateamento
      if (mode === 'scrap' && isScrap) {
        formData.scrapObservations = scrapObservations;
        formData.scrapReturnInvoice = scrapInvoice;
        formData.scrapReturnDate = scrapDate ? format(scrapDate, "yyyy-MM-dd") : undefined;
        formData.scrapValidated = true;
        formData.outcome = 'scrapped';
      }
      
      onSubmit(formData);
    }
  };

  // Se estamos em modo de criação, usar o ReviewForm que tem todos os elementos necessários
  if (mode === 'create') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.values(formErrors).some(error => error) && (
          <Alert variant="destructive">
            <AlertTitle>Formulário com erros</AlertTitle>
            <AlertDescription>
              Verifique os campos destacados em vermelho e tente novamente.
            </AlertDescription>
          </Alert>
        )}
        
        <ReviewForm
          tagNumber={tagNumber}
          setTagNumber={setTagNumber}
          entryInvoice={entryInvoice}
          setEntryInvoice={setEntryInvoice}
          entryDate={entryDate}
          setEntryDate={setEntryDate}
          tagPhotoUrl={tagPhotoUrl}
          handleTagPhotoUpload={handleTagPhotoUpload}
          entryObservations={entryObservations}
          setEntryObservations={setEntryObservations}
          services={services}
          handleServiceChange={handleServiceChange}
          handleQuantityChange={handleQuantityChange}
          handleObservationChange={handleObservationChange}
          handlePhotoUpload={handlePhotoUpload}
          formErrors={formErrors}
          photoRequired={photoRequired}
        />
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Salvando..." : "Registrar Peritagem"}
        </Button>
      </form>
    );
  }

  // Renderizar versão simplificada para outros modos
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Setor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tagNumber" className={formErrors.tagNumber ? "text-red-500" : ""}>
                Número da TAG*
              </Label>
              <Input
                id="tagNumber"
                type="text"
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                placeholder="Número da TAG"
                disabled={isLoading || mode === 'view'}
                className={formErrors.tagNumber ? "border-red-500" : ""}
              />
              {formErrors.tagNumber && (
                <p className="text-xs text-red-500">Número da TAG é obrigatório</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="entryInvoice" className={formErrors.entryInvoice ? "text-red-500" : ""}>
                Nota Fiscal de Entrada*
              </Label>
              <Input
                id="entryInvoice"
                type="text"
                value={entryInvoice}
                onChange={(e) => setEntryInvoice(e.target.value)}
                placeholder="Número da Nota Fiscal"
                disabled={isLoading || mode === 'view'}
                className={formErrors.entryInvoice ? "border-red-500" : ""}
              />
              {formErrors.entryInvoice && (
                <p className="text-xs text-red-500">Nota Fiscal é obrigatória</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações específicas para outros modos */}
      {mode === 'scrap' && (
        <ScrapForm 
          sector={sector}
          isScrap={isScrap}
          setIsScrap={setIsScrap}
          scrapObservations={scrapObservations}
          setScrapObservations={setScrapObservations}
          scrapDate={scrapDate}
          setScrapDate={setScrapDate}
          scrapInvoice={scrapInvoice}
          setScrapInvoice={setScrapInvoice}
          formErrors={{}}
        />
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : (mode === 'checagem' ? "Concluir Checagem" : "Salvar")}
      </Button>
    </form>
  );
}
