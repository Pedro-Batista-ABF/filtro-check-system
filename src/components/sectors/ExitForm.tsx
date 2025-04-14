
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Sector, PhotoWithFile } from '@/types';
import PhotoUpload from './PhotoUpload';

interface ExitFormProps {
  sector: Sector;
  onChange: (updates: Partial<Sector>) => void;
  onPhotoUpload: (files: FileList) => void;
  exitPhotos: PhotoWithFile[];
  errors: {
    exitDate?: boolean;
    exitInvoice?: boolean;
    exitPhotos?: boolean;
  };
}

export default function ExitForm({
  sector,
  onChange,
  onPhotoUpload,
  exitPhotos,
  errors
}: ExitFormProps) {
  const [exitDate, setExitDate] = useState<Date | undefined>(
    sector.exitDate ? new Date(sector.exitDate) : new Date()
  );
  const [exitInvoice, setExitInvoice] = useState<string>(sector.exitInvoice || '');
  const [exitObservations, setExitObservations] = useState<string>(sector.exitObservations || '');

  // Handlers para atualizar o setor
  const handleExitDateChange = (date: Date | undefined) => {
    setExitDate(date);
    if (date) {
      onChange({ exitDate: format(date, 'yyyy-MM-dd') });
    }
  };

  const handleExitInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExitInvoice(value);
    onChange({ exitInvoice: value });
  };

  const handleExitObservationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setExitObservations(value);
    onChange({ exitObservations: value });
  };

  const handlePhotosUpload = (files: FileList) => {
    onPhotoUpload(files);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exitDate" className={errors.exitDate ? "text-red-500" : ""}>
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
                  errors.exitDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {exitDate ? format(exitDate, "dd/MM/yyyy") : <span>Selecione a data de saída</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={exitDate}
                onSelect={handleExitDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.exitDate && <p className="text-xs text-red-500">Data de saída é obrigatória</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exitInvoice" className={errors.exitInvoice ? "text-red-500" : ""}>
            Nota Fiscal de Saída*
          </Label>
          <Input
            id="exitInvoice"
            value={exitInvoice}
            onChange={handleExitInvoiceChange}
            placeholder="Ex: NF-12345"
            className={errors.exitInvoice ? "border-red-500" : ""}
          />
          {errors.exitInvoice && <p className="text-xs text-red-500">Nota fiscal de saída é obrigatória</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exitPhotos" className={errors.exitPhotos ? "text-red-500" : ""}>
          Fotos de Saída*
        </Label>
        <PhotoUpload
          photos={exitPhotos || []}
          onChange={handlePhotosUpload}
          title="Adicionar fotos de saída"
          required={true}
        />
        {errors.exitPhotos && <p className="text-xs text-red-500">Pelo menos uma foto de saída é obrigatória</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="exitObservations">
          Observações de Saída
        </Label>
        <Textarea
          id="exitObservations"
          value={exitObservations}
          onChange={handleExitObservationsChange}
          placeholder="Observações sobre o estado do setor na saída..."
        />
      </div>
    </div>
  );
}
