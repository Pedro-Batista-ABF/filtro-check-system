
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, AlertCircle, Camera } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Service } from "@/types";
import ServiceCheckbox from "../ServiceCheckbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewFormProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  entryDate: Date | undefined;
  setEntryDate: (date: Date | undefined) => void;
  tagPhotoUrl: string | undefined;
  handleTagPhotoUpload: (files: FileList) => void;
  entryObservations: string;
  setEntryObservations: (value: string) => void;
  services: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  formErrors: {
    tagNumber: boolean;
    tagPhoto: boolean;
    entryInvoice: boolean;
    entryDate: boolean;
    services?: boolean;
    photos?: boolean;
  };
  photoRequired: boolean;
}

export default function ReviewForm({
  tagNumber,
  setTagNumber,
  entryInvoice,
  setEntryInvoice,
  entryDate,
  setEntryDate,
  tagPhotoUrl,
  handleTagPhotoUpload,
  entryObservations,
  setEntryObservations,
  services,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  formErrors,
  photoRequired
}: ReviewFormProps) {
  // Verifica se algum serviço está sem foto
  const getServicesWithoutPhotos = () => {
    return services
      .filter(service => service.selected && (!service.photos || service.photos.length === 0))
      .map(service => service.name);
  };

  const servicesWithoutPhotos = getServicesWithoutPhotos();
  const hasServicesWithoutPhotos = servicesWithoutPhotos.length > 0;
  
  // Função para facilitar o upload de fotos via câmera do dispositivo
  const handleCameraCapture = (event: React.MouseEvent, serviceId?: string) => {
    event.preventDefault();
    
    // Criar um input de arquivo invisível
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment'; // Use câmera traseira em dispositivos móveis
    
    // Adicionar event listener
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
    
    // Simular clique no input
    fileInput.click();
  };

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
            <div className="flex space-x-2">
              <Input
                id="tagPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleTagPhotoUpload(e.target.files)}
                className={cn("flex-1", formErrors.tagPhoto ? "border-red-500" : "")}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={(e) => handleCameraCapture(e)}
                title="Usar câmera"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
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
          {formErrors.services && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Selecione pelo menos um serviço</AlertDescription>
            </Alert>
          )}
          
          {formErrors.photos && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cada serviço selecionado deve ter pelo menos uma foto
                {hasServicesWithoutPhotos && (
                  <div className="mt-1">
                    <strong>Serviços sem fotos:</strong>
                    <ul className="list-disc pl-5 mt-1">
                      {servicesWithoutPhotos.map((serviceName, index) => (
                        <li key={index}>{serviceName}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
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
              required={photoRequired}
              onCameraCapture={(e) => handleCameraCapture(e, service.id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
