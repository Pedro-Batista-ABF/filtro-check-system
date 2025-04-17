
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
import { TagPhotoField } from "../../form-fields/TagPhotoField";

interface SectorInfoSectionProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  entryDate: Date | undefined;
  setEntryDate: (date: Date | undefined) => void;
  tagPhotoUrl: string | undefined;
  handleTagPhotoUpload: (files: FileList) => Promise<string | undefined>;
  entryObservations: string;
  setEntryObservations: (value: string) => void;
  onCameraCapture: (e: React.MouseEvent) => void;
  formErrors: {
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
  };
}

export default function SectorInfoSection({
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
  onCameraCapture,
  formErrors
}: SectorInfoSectionProps) {
  return (
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
        
        <TagPhotoField
          tagPhotoUrl={tagPhotoUrl}
          onPhotoUpload={handleTagPhotoUpload}
          onCameraCapture={onCameraCapture}
          error={formErrors.tagPhoto}
          required={true}
        />

        <div className="space-y-2">
          <Label htmlFor="entryObservations">
            Observações de Entrada
          </Label>
          <textarea
            id="entryObservations"
            value={entryObservations}
            onChange={(e) => setEntryObservations(e.target.value)}
            placeholder="Observações sobre o estado do setor na entrada..."
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>
      </CardContent>
    </Card>
  );
}
