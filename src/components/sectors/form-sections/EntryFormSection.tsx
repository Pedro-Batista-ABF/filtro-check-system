
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { BasicFormField } from "../form-fields/BasicFormField";
import { TagPhotoField } from "../form-fields/TagPhotoField";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent } from "@/components/ui/popover";

interface EntryFormSectionProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  entryDate: Date | undefined;
  setEntryDate: (date: Date | undefined) => void;
  tagPhotoUrl: string | undefined;
  handleTagPhotoUpload: (files: FileList) => void;
  handleCameraCapture: (e: React.MouseEvent) => void;
  entryObservations: string;
  setEntryObservations: (value: string) => void;
  formErrors: {
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
  };
}

export function EntryFormSection({
  tagNumber,
  setTagNumber,
  entryInvoice,
  setEntryInvoice,
  entryDate,
  setEntryDate,
  tagPhotoUrl,
  handleTagPhotoUpload,
  handleCameraCapture,
  entryObservations,
  setEntryObservations,
  formErrors
}: EntryFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Setor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BasicFormField
            id="tagNumber"
            label="Número da TAG"
            value={tagNumber}
            onChange={setTagNumber}
            placeholder="Ex: ABC-123"
            required
            error={formErrors.tagNumber}
            errorMessage="TAG é obrigatória"
          />
          
          <BasicFormField
            id="entryInvoice"
            label="Nota Fiscal de Entrada"
            value={entryInvoice}
            onChange={setEntryInvoice}
            placeholder="Ex: NF-12345"
            required
            error={formErrors.entryInvoice}
            errorMessage="Nota fiscal é obrigatória"
          />
          
          <div className="space-y-2">
            <Label className={formErrors.entryDate ? "text-red-500" : ""}>
              Data de Entrada*
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
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
          
          <BasicFormField
            id="peritagemDate"
            label="Data da Peritagem (auto-preenchida)"
            value={format(new Date(), "dd/MM/yyyy")}
            onChange={() => {}}
            disabled
            className="bg-gray-100"
          />
        </div>
        
        <TagPhotoField
          tagPhotoUrl={tagPhotoUrl}
          onPhotoUpload={handleTagPhotoUpload}
          onCameraCapture={handleCameraCapture}
          error={formErrors.tagPhoto}
          required
        />

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
  );
}
