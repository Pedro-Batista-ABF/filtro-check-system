
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import QuantityInput from "./QuantityInput";
import ServicesList from "./ServicesList";

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
  const [entryDate, setEntryDate] = useState(sector.entryDate || '');
  const [peritagemDate, setPeritagemDate] = useState(sector.peritagemDate || '');
  const [entryObservations, setEntryObservations] = useState(sector.entryObservations || '');
  const [tagPhoto, setTagPhoto] = useState<PhotoWithFile[]>(
    sector.tagPhotoUrl ? [{ id: 'tag-photo', url: sector.tagPhotoUrl, type: 'tag', file: null }] : []
  );
  const [services, setServices] = useState<Service[]>(sector.services || []);
  
  // Convert Photo[] to PhotoWithFile[] by adding file: null to each photo
  const [beforePhotos, setBeforePhotos] = useState<PhotoWithFile[]>(
    (sector.beforePhotos || []).map(photo => ({ ...photo, file: null }))
  );
  const [afterPhotos, setAfterPhotos] = useState<PhotoWithFile[]>(
    (sector.afterPhotos || []).map(photo => ({ ...photo, file: null }))
  );
  
  const [formErrors, setFormErrors] = useState<{
    tagNumber?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
    peritagemDate?: boolean;
    tagPhoto?: boolean;
    scrapObservations?: boolean;
    scrapDate?: boolean;
    scrapInvoice?: boolean;
  }>({});
  
  const [isScrap, setIsScrap] = useState(false);
  const [scrapObservations, setScrapObservations] = useState('');
  const [scrapDate, setScrapDate] = useState<Date | undefined>();
  const [scrapInvoice, setScrapInvoice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect para inicializar o formulário com os dados do setor
  useEffect(() => {
    setTagNumber(sector.tagNumber || '');
    setEntryInvoice(sector.entryInvoice || '');
    setEntryDate(sector.entryDate || '');
    setPeritagemDate(sector.peritagemDate || '');
    setEntryObservations(sector.entryObservations || '');
    setServices(sector.services || []);
    setBeforePhotos((sector.beforePhotos || []).map(photo => ({ ...photo, file: null })));
    setAfterPhotos((sector.afterPhotos || []).map(photo => ({ ...photo, file: null })));
    setTagPhoto(sector.tagPhotoUrl ? [{ id: 'tag-photo', url: sector.tagPhotoUrl, type: 'tag', file: null }] : []);

    // Quando estamos em modo de sucateamento, inicializar scrapValidated
    if (mode === 'scrap') {
      setIsScrap(sector.scrapValidated || false);
    }
  }, [sector, mode]);

  useEffect(() => {
    if (sector.services) {
      setServices(sector.services);
    }
  }, [sector.services]);

  const handleTagPhotoChange = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0]; // Take only the first file
      setTagPhoto([{
        id: `tag-photo-${Date.now()}`,
        url: '',
        type: 'tag',
        file: file
      }]);
    }
  };

  const handleBeforePhotoChange = (files: FileList) => {
    const newPhotos: PhotoWithFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`; // ID temporário
      newPhotos.push({
        id: tempId,
        url: '',
        type: 'before',
        file: file
      });
    }
    setBeforePhotos([...beforePhotos, ...newPhotos]);
  };

  const handleAfterPhotoChange = (files: FileList) => {
    const newPhotos: PhotoWithFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`; // ID temporário
      newPhotos.push({
        id: tempId,
        url: '',
        type: 'after',
        file: file
      });
    }
    setAfterPhotos([...afterPhotos, ...newPhotos]);
  };

  const handleServiceChange = (serviceId: string, isSelected: boolean) => {
    setServices(
      services.map(service => 
        service.id === serviceId 
          ? { ...service, selected: isSelected } 
          : service
      )
    );
  };

  const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
    setServices(
      services.map(service => 
        service.id === serviceId 
          ? { ...service, quantity } 
          : service
      )
    );
  };

  const handleServicePhotoChange = (serviceId: string, files: FileList) => {
    const newPhotos: PhotoWithFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `${serviceId}-${Date.now()}-${i}`;
      newPhotos.push({
        id: tempId,
        url: '',
        type: 'before',
        serviceId: serviceId,
        file: file
      });
    }
    
    // Add the new photos to beforePhotos with serviceId
    setBeforePhotos([...beforePhotos, ...newPhotos]);
    
    // Update the service's photos array
    setServices(
      services.map(service => 
        service.id === serviceId 
          ? { 
              ...service, 
              photos: [...(service.photos || []), ...newPhotos.map(p => ({
                id: p.id,
                url: '',
                type: 'before' as const,
                serviceId: serviceId
              }))]
            } 
          : service
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      // Validar os campos do formulário
      let isValid = true;
      const newErrors = {
        tagNumber: false,
        entryInvoice: false,
        entryDate: false,
        peritagemDate: false,
        tagPhoto: false,
        scrapObservations: false,
        scrapDate: false,
        scrapInvoice: false
      };
      
      if (!tagNumber.trim()) {
        newErrors.tagNumber = true;
        isValid = false;
      }
      if (!entryInvoice.trim()) {
        newErrors.entryInvoice = true;
        isValid = false;
      }
      if (!entryDate) {
        newErrors.entryDate = true;
        isValid = false;
      }
      if (!peritagemDate) {
        newErrors.peritagemDate = true;
        isValid = false;
      }
      if (tagPhoto.length === 0) {
        newErrors.tagPhoto = true;
        isValid = false;
      }
      
      // Em modo de sucateamento, validar campos específicos
      if (mode === 'scrap' && isScrap) {
        if (!scrapObservations.trim()) {
          newErrors.scrapObservations = true;
          isValid = false;
        }
        if (!scrapInvoice.trim()) {
          newErrors.scrapInvoice = true;
          isValid = false;
        }
        if (!scrapDate) {
          newErrors.scrapDate = true;
          isValid = false;
        }
      }
      
      // Validate that each selected service has at least one photo if required
      const selectedServices = services.filter(service => service.selected);
      const servicesWithoutPhotos = selectedServices.filter(service => {
        const servicePhotos = beforePhotos.filter(photo => photo.serviceId === service.id);
        return servicePhotos.length === 0;
      });
      
      if (photoRequired && servicesWithoutPhotos.length > 0) {
        toast.error("Serviços sem fotos", {
          description: `Os serviços ${servicesWithoutPhotos.map(s => s.name).join(", ")} precisam ter pelo menos uma foto.`
        });
        isValid = false;
      }
      
      setFormErrors(newErrors);

      if (isValid) {
        // Montar o objeto de dados baseado no modo
        const formData: Partial<Sector> = {
          tagNumber,
          entryInvoice,
          entryDate,
          entryObservations,
          peritagemDate,
          services: services,
          beforePhotos,
          afterPhotos,
          tagPhotoUrl: tagPhoto.length > 0 ? tagPhoto[0].url : undefined,
          scrapPhotos: sector.scrapPhotos || [] // Garantir que scrapPhotos seja incluído
        };
        
        // Adicionar informações específicas para cada modo
        if (mode === 'checagem') {
          formData.afterPhotos = afterPhotos;
        }
        
        // Informações específicas de sucateamento
        if (mode === 'scrap' && isScrap) {
          formData.scrapObservations = scrapObservations;
          formData.scrapReturnInvoice = scrapInvoice;
          formData.scrapReturnDate = scrapDate ? format(scrapDate, "yyyy-MM-dd") : undefined;
          formData.scrapValidated = true;
          formData.outcome = 'scrapped'; // Garantir que o outcome seja atualizado corretamente
        }
        
        // Enviar dados para o componente pai
        onSubmit(formData);
      } else {
        setFormErrors(newErrors);
      }
    }
  };

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
            <div>
              <Label htmlFor="entryDate" className={formErrors.entryDate ? "text-red-500" : ""}>
                Data de Entrada*
              </Label>
              <Input
                id="entryDate"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                disabled={isLoading || mode === 'view'}
                className={formErrors.entryDate ? "border-red-500" : ""}
              />
              {formErrors.entryDate && (
                <p className="text-xs text-red-500">Data de Entrada é obrigatória</p>
              )}
            </div>
            <div>
              <Label htmlFor="peritagemDate" className={formErrors.peritagemDate ? "text-red-500" : ""}>
                Data da Peritagem*
              </Label>
              <Input
                id="peritagemDate"
                type="date"
                value={peritagemDate}
                onChange={(e) => setPeritagemDate(e.target.value)}
                disabled={isLoading || mode === 'view'}
                className={formErrors.peritagemDate ? "border-red-500" : ""}
              />
              {formErrors.peritagemDate && (
                <p className="text-xs text-red-500">Data da Peritagem é obrigatória</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Foto da TAG*</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            photos={tagPhoto}
            onChange={handleTagPhotoChange}
            disabled={isLoading || mode === 'view'}
            title="Adicionar foto da TAG"
            required={true}
          />
          {formErrors.tagPhoto && (
            <p className="text-xs text-red-500 mt-2">Foto da TAG é obrigatória</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="entryObservations">Observações da Entrada</Label>
          <Textarea
            id="entryObservations"
            placeholder="Observações sobre a entrada do setor..."
            value={entryObservations}
            onChange={(e) => setEntryObservations(e.target.value)}
            disabled={isLoading || mode === 'view'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border p-4 rounded-md">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id={`service-${service.id}`}
                    checked={service.selected}
                    onCheckedChange={(checked) => handleServiceChange(service.id, !!checked)}
                    disabled={isLoading || mode === 'view'}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`service-${service.id}`} className="font-medium">
                      {service.name}
                    </Label>
                    
                    {service.selected && (
                      <div className="ml-6 space-y-4 mt-2">
                        <div>
                          <Label htmlFor={`quantity-${service.id}`}>Quantidade*</Label>
                          <div className="mt-1">
                            <QuantityInput
                              id={`quantity-${service.id}`}
                              value={service.quantity || 1}
                              onChange={(value) => handleServiceQuantityChange(service.id, value)}
                              min={1}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Fotos do Serviço (ANTES)*</Label>
                          <div className="mt-1">
                            <PhotoUpload
                              photos={beforePhotos.filter(photo => photo.serviceId === service.id)}
                              onChange={(files) => handleServicePhotoChange(service.id, files)}
                              disabled={isLoading || mode === 'view'}
                              title="Adicionar fotos do serviço"
                              required={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fotos da Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            photos={beforePhotos.filter(photo => !photo.serviceId)}
            onChange={handleBeforePhotoChange}
            disabled={isLoading || mode === 'view'}
            title="Adicionar fotos gerais da entrada"
            required={false}
          />
        </CardContent>
      </Card>
      
      {/* Informações de sucateamento */}
      {mode === 'scrap' && (
        <div>
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
            formErrors={formErrors}
          />
        </div>
      )}
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
