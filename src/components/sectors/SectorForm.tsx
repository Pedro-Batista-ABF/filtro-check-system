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

interface SectorFormProps {
  sector: Sector;
  onSubmit?: (data: Partial<Sector>) => void;
  mode?: 'create' | 'edit' | 'view' | 'checagem' | 'scrap';
  isLoading?: boolean;
}

export default function SectorForm({ 
  sector,
  onSubmit,
  mode = 'create',
  isLoading = false
}: SectorFormProps) {
  const [tagNumber, setTagNumber] = useState(sector.tagNumber || '');
  const [entryInvoice, setEntryInvoice] = useState(sector.entryInvoice || '');
  const [entryDate, setEntryDate] = useState(sector.entryDate || '');
  const [peritagemDate, setPeritagemDate] = useState(sector.peritagemDate || '');
  const [entryObservations, setEntryObservations] = useState(sector.entryObservations || '');
  const [selectedServices, setSelectedServices] = useState<Service[]>(sector.services || []);
  const [beforePhotos, setBeforePhotos] = useState<PhotoWithFile[]>(sector.beforePhotos || []);
  const [afterPhotos, setAfterPhotos] = useState<PhotoWithFile[]>(sector.afterPhotos || []);
  const [formErrors, setFormErrors] = useState<{
    tagNumber?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
    peritagemDate?: boolean;
    scrapObservations?: boolean;
    scrapDate?: boolean;
    scrapInvoice?: boolean;
  }>({});
  const [isScrap, setIsScrap] = useState(false);
  const [scrapObservations, setScrapObservations] = useState('');
  const [scrapDate, setScrapDate] = useState<Date>();
  const [scrapInvoice, setScrapInvoice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect para inicializar o formulário com os dados do setor
  useEffect(() => {
    setTagNumber(sector.tagNumber || '');
    setEntryInvoice(sector.entryInvoice || '');
    setEntryDate(sector.entryDate || '');
    setPeritagemDate(sector.peritagemDate || '');
    setEntryObservations(sector.entryObservations || '');
    setSelectedServices(sector.services || []);
    setBeforePhotos(sector.beforePhotos ? sector.beforePhotos.map(photo => ({ ...photo, file: null })) : []);
    setAfterPhotos(sector.afterPhotos ? sector.afterPhotos.map(photo => ({ ...photo, file: null })) : []);

    // Quando estamos em modo de sucateamento, inicializar scrapValidated
    if (mode === 'scrap') {
      setIsScrap(sector.scrapValidated || false);
    }
  }, [sector, mode]);

  useEffect(() => {
    if (sector.services) {
      setSelectedServices(sector.services);
    }
  }, [sector.services]);

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
        scrapObservations?: false,
        scrapDate?: false,
        scrapInvoice?: false
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
      
      setFormErrors(newErrors);

      if (isValid) {
        // Montar o objeto de dados baseado no modo
        const formData: Partial<Sector> = {
          tagNumber,
          entryInvoice,
          entryDate,
          entryObservations,
          peritagemDate,
          services: selectedServices,
          beforePhotos,
          afterPhotos
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
        }
        
        // Enviar dados para o componente pai
        onSubmit(formData);
      } else {
        setFormErrors(newErrors);
      }
    }
  };

  // Atualizar informações do ciclo atual
  const currentCycle = sector.cycles && sector.cycles.length > 0 
    ? sector.cycles[0] 
    : {
        tag_number: sector.tagNumber,
        entry_invoice: sector.entryInvoice,
        entry_date: sector.entryDate,
        peritagem_date: sector.peritagemDate,
        production_completed: sector.productionCompleted,
        status: sector.status,
        outcome: sector.outcome
      };

  // Renderizar formulário baseado no modo
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
          <CardTitle>Fotos da Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            photos={beforePhotos}
            onChange={handleBeforePhotoChange}
            disabled={isLoading || mode === 'view'}
            title="Adicionar fotos da entrada"
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
