
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sector, PhotoWithFile } from "@/types";
import PhotoUpload from "../sectors/PhotoUpload";
import SectorServices from "../sectors/SectorServices";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface CheckagemFormContentProps {
  sector: Sector;
  onSubmit: (data: Partial<Sector>) => void;
  isLoading: boolean;
}

export default function CheckagemFormContent({ sector, onSubmit, isLoading }: CheckagemFormContentProps) {
  const [exitInvoice, setExitInvoice] = useState(sector.exitInvoice || '');
  const [exitDate, setExitDate] = useState(sector.exitDate || format(new Date(), 'yyyy-MM-dd'));
  const [checagemDate, setChecagemDate] = useState(sector.checagemDate || format(new Date(), 'yyyy-MM-dd'));
  const [exitObservations, setExitObservations] = useState(sector.exitObservations || '');
  const [afterPhotos, setAfterPhotos] = useState<PhotoWithFile[]>(
    (sector.afterPhotos || []).map(photo => ({ ...photo, file: null }))
  );
  const [formErrors, setFormErrors] = useState({
    exitInvoice: false,
    exitDate: false,
    checagemDate: false
  });
  const { toast } = useToast();

  // Update form data when sector changes
  useEffect(() => {
    setExitInvoice(sector.exitInvoice || '');
    setExitDate(sector.exitDate || format(new Date(), 'yyyy-MM-dd'));
    setChecagemDate(sector.checagemDate || format(new Date(), 'yyyy-MM-dd'));
    setExitObservations(sector.exitObservations || '');
    setAfterPhotos((sector.afterPhotos || []).map(photo => ({ ...photo, file: null })));
  }, [sector]);

  const handleAfterPhotoChange = (files: FileList) => {
    const newPhotos: PhotoWithFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`;
      newPhotos.push({
        id: tempId,
        url: '',
        type: 'after',
        file: file
      });
    }
    setAfterPhotos([...afterPhotos, ...newPhotos]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    let isValid = true;
    const newErrors = {
      exitInvoice: false,
      exitDate: false,
      checagemDate: false
    };
    
    if (!exitInvoice.trim()) {
      newErrors.exitInvoice = true;
      isValid = false;
    }
    
    if (!exitDate) {
      newErrors.exitDate = true;
      isValid = false;
    }
    
    if (!checagemDate) {
      newErrors.checagemDate = true;
      isValid = false;
    }
    
    setFormErrors(newErrors);
    
    if (!isValid) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare data for submission
    const formData: Partial<Sector> = {
      exitInvoice,
      exitDate,
      checagemDate,
      exitObservations,
      afterPhotos,
      status: 'concluido',
      outcome: 'Recuperado'
    };
    
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações de Saída</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exitInvoice" className={formErrors.exitInvoice ? "text-red-500" : ""}>
                Nota Fiscal de Saída*
              </Label>
              <Input
                id="exitInvoice"
                type="text"
                value={exitInvoice}
                onChange={(e) => setExitInvoice(e.target.value)}
                placeholder="Número da Nota Fiscal de Saída"
                disabled={isLoading}
                className={formErrors.exitInvoice ? "border-red-500" : ""}
              />
              {formErrors.exitInvoice && (
                <p className="text-xs text-red-500">Nota Fiscal de Saída é obrigatória</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="exitDate" className={formErrors.exitDate ? "text-red-500" : ""}>
                Data de Saída*
              </Label>
              <Input
                id="exitDate"
                type="date"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                disabled={isLoading}
                className={formErrors.exitDate ? "border-red-500" : ""}
              />
              {formErrors.exitDate && (
                <p className="text-xs text-red-500">Data de Saída é obrigatória</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="checagemDate" className={formErrors.checagemDate ? "text-red-500" : ""}>
                Data da Checagem*
              </Label>
              <Input
                id="checagemDate"
                type="date"
                value={checagemDate}
                onChange={(e) => setChecagemDate(e.target.value)}
                disabled={isLoading}
                className={formErrors.checagemDate ? "border-red-500" : ""}
              />
              {formErrors.checagemDate && (
                <p className="text-xs text-red-500">Data da Checagem é obrigatória</p>
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
          <Label htmlFor="exitObservations">Observações da Saída</Label>
          <Textarea
            id="exitObservations"
            placeholder="Observações sobre a saída do setor..."
            value={exitObservations}
            onChange={(e) => setExitObservations(e.target.value)}
            disabled={isLoading}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Serviços Executados</CardTitle>
        </CardHeader>
        <CardContent>
          <SectorServices sector={sector} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fotos de Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Adicione fotos que comprovem a execução dos serviços.
          </p>
          <PhotoUpload
            photos={afterPhotos}
            onChange={handleAfterPhotoChange}
            disabled={isLoading}
            title="Adicionar fotos da conclusão"
            required={true}
          />
        </CardContent>
      </Card>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Finalizar Checagem"}
      </Button>
    </form>
  );
}
