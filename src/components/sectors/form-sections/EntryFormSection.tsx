
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface EntryFormSectionProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  entryDate: Date | undefined;
  setEntryDate: (date: Date | undefined) => void;
  tagPhotoUrl?: string;
  onPhotoUpload: (files: FileList) => void;
  entryObservations: string;
  setEntryObservations: (value: string) => void;
  errors: {
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
  };
  photoRequired?: boolean;
  disabled?: boolean;
}

export function EntryFormSection({
  tagNumber,
  setTagNumber,
  entryInvoice,
  setEntryInvoice,
  entryDate,
  setEntryDate,
  tagPhotoUrl,
  onPhotoUpload,
  entryObservations,
  setEntryObservations,
  errors,
  photoRequired = true,
  disabled = false
}: EntryFormSectionProps) {
  const handlePhotoUpload = async (files: FileList) => {
    onPhotoUpload(files);
    return files.length > 0 ? URL.createObjectURL(files[0]) : undefined;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Setor</CardTitle>
        {disabled && <p className="text-sm text-gray-500">* Campos somente leitura na checagem final</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tagNumber" className={errors.tagNumber ? "text-red-500" : ""}>
              Número da TAG*
            </Label>
            <Input
              id="tagNumber"
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              placeholder="Ex: ABC-123"
              className={errors.tagNumber ? "border-red-500" : ""}
              disabled={disabled}
            />
            {errors.tagNumber && (
              <p className="text-xs text-red-500">TAG é obrigatória</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entryInvoice" className={errors.entryInvoice ? "text-red-500" : ""}>
              Nota Fiscal de Entrada*
            </Label>
            <Input
              id="entryInvoice"
              value={entryInvoice}
              onChange={(e) => setEntryInvoice(e.target.value)}
              placeholder="Ex: NF-12345"
              className={errors.entryInvoice ? "border-red-500" : ""}
              disabled={disabled}
            />
            {errors.entryInvoice && (
              <p className="text-xs text-red-500">Nota fiscal é obrigatória</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entryDate" className={errors.entryDate ? "text-red-500" : ""}>
              Data de Entrada*
            </Label>
            {disabled ? (
              <Input
                id="entryDate"
                value={entryDate ? format(entryDate, "dd/MM/yyyy") : ""}
                disabled
                className="bg-gray-50"
              />
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="entryDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !entryDate && "text-muted-foreground",
                      errors.entryDate && "border-red-500"
                    )}
                    disabled={disabled}
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
            )}
            {errors.entryDate && (
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
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Data preenchida automaticamente</p>
          </div>
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
            disabled={disabled}
            className={disabled ? "bg-gray-50" : ""}
          />
        </div>
        
        <div className="space-y-2">
          <Label className={errors.tagPhoto ? "text-red-500" : ""}>
            Foto da TAG
            {photoRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          {disabled ? (
            <div className="mt-2">
              {tagPhotoUrl ? (
                <img 
                  src={tagPhotoUrl} 
                  alt="TAG do Setor" 
                  className="w-32 h-32 object-cover rounded-md border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-md border">
                  <p className="text-sm text-gray-500">Sem foto</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && onPhotoUpload(e.target.files)}
                className={errors.tagPhoto ? "border-red-500" : ""}
              />
              
              {tagPhotoUrl && (
                <div className="mt-2">
                  <img 
                    src={tagPhotoUrl} 
                    alt="TAG do Setor" 
                    className="w-32 h-32 object-cover rounded-md border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
            </div>
          )}
          
          {errors.tagPhoto && photoRequired && (
            <p className="text-xs text-red-500">Foto da TAG é obrigatória</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
