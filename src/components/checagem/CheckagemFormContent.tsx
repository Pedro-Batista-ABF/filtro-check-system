
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sector, Service, Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PhotoUpload from '@/components/sectors/PhotoUpload';

interface CheckagemFormContentProps {
  sector: Sector;
  onSubmit: (data: Partial<Sector>) => void;
  isLoading?: boolean;
}

export default function CheckagemFormContent({ 
  sector, 
  onSubmit,
  isLoading = false 
}: CheckagemFormContentProps) {
  const [exitInvoice, setExitInvoice] = useState(sector.exitInvoice || '');
  const [exitDate, setExitDate] = useState(sector.exitDate || '');
  const [checagemDate, setChecagemDate] = useState(sector.checagemDate || new Date().toISOString().split('T')[0]);
  const [exitObservations, setExitObservations] = useState(sector.exitObservations || '');
  const [afterPhotos, setAfterPhotos] = useState<Photo[]>(sector.afterPhotos || []);
  const [formErrors, setFormErrors] = useState({
    exitInvoice: false,
    exitDate: false
  });

  const handlePhotoChange = (files: FileList) => {
    // Processar novas fotos
    const newPhotos = Array.from(files).map((file) => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      url: URL.createObjectURL(file),
      type: 'after' as const,
      file
    }));
    
    setAfterPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const errors = {
      exitInvoice: !exitInvoice.trim(),
      exitDate: !exitDate
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(Boolean)) {
      return;
    }
    
    // Preparar dados para submissão
    const data: Partial<Sector> = {
      exitInvoice,
      exitDate,
      checagemDate,
      exitObservations,
      afterPhotos,
      status: 'concluido'
    };
    
    onSubmit(data);
  };

  // Filtrar serviços selecionados
  const selectedServices = sector.services.filter(service => service.selected);

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
                placeholder="Número da Nota Fiscal"
                disabled={isLoading}
                className={formErrors.exitInvoice ? "border-red-500" : ""}
              />
              {formErrors.exitInvoice && (
                <p className="text-xs text-red-500">Nota Fiscal é obrigatória</p>
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
              <Label htmlFor="checagemDate">
                Data da Checagem Final
              </Label>
              <Input
                id="checagemDate"
                type="date"
                value={checagemDate}
                onChange={(e) => setChecagemDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações de Saída</CardTitle>
        </CardHeader>
        <CardContent>
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
          <CardTitle>Fotos da Checagem Final</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            photos={afterPhotos}
            onChange={handlePhotoChange}
            disabled={isLoading}
            title="Adicionar fotos de saída"
            required={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serviços Executados</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedServices.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum serviço selecionado para este setor.</p>
          ) : (
            <ul className="space-y-4">
              {selectedServices.map((service) => (
                <li key={service.id} className="border-b pb-4">
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-500">Quantidade: {service.quantity || 1}</p>
                  {service.observations && (
                    <p className="text-sm mt-1">{service.observations}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Concluir Checagem"}
      </Button>
    </form>
  );
}
