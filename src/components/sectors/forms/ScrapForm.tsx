
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScrapFormProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  entryDate?: Date;
  setEntryDate: (date: Date | undefined) => void;
  tagPhotoUrl?: string;
  handleTagPhotoUpload: (files: FileList) => void;
  scrapObservations: string;
  setScrapObservations: (value: string) => void;
  scrapDate?: Date;
  setScrapDate: (date: Date | undefined) => void;
  scrapInvoice: string;
  setScrapInvoice: (value: string) => void;
  formErrors: {
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
    scrapObservations?: boolean;
    scrapDate?: boolean;
    scrapInvoice?: boolean;
  };
  onCameraCapture: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const ScrapForm: React.FC<ScrapFormProps> = ({
  tagNumber,
  setTagNumber,
  entryInvoice,
  setEntryInvoice,
  entryDate,
  setEntryDate,
  tagPhotoUrl,
  handleTagPhotoUpload,
  scrapObservations,
  setScrapObservations,
  scrapDate,
  setScrapDate,
  scrapInvoice,
  setScrapInvoice,
  formErrors,
  onCameraCapture,
  disabled = false
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validação para Sucateamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Informações do Setor</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>TAG:</strong> {tagNumber || "N/A"}</div>
                <div><strong>NF Entrada:</strong> {entryInvoice || "N/A"}</div>
                <div><strong>Data Entrada:</strong> {entryDate ? format(entryDate, "dd/MM/yyyy") : "N/A"}</div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Motivo do Sucateamento</h3>
              <Textarea
                id="scrapObservations"
                value={scrapObservations}
                onChange={(e) => setScrapObservations(e.target.value)}
                placeholder="Adicione o motivo pelo qual este setor deve ser sucateado..."
                className={formErrors.scrapObservations ? "border-red-500" : ""}
                disabled={disabled}
              />
              {formErrors.scrapObservations && (
                <p className="text-xs text-red-500">Motivo do sucateamento é obrigatório</p>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="scrapInvoice" className={formErrors.scrapInvoice ? "text-red-500" : ""}>
                  Nota Fiscal de Devolução*
                </Label>
                <Input
                  id="scrapInvoice"
                  value={scrapInvoice}
                  onChange={(e) => setScrapInvoice(e.target.value)}
                  placeholder="Ex: NF-54321"
                  className={formErrors.scrapInvoice ? "border-red-500" : ""}
                  disabled={disabled}
                />
                {formErrors.scrapInvoice && (
                  <p className="text-xs text-red-500">Nota fiscal é obrigatória</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scrapDate" className={formErrors.scrapDate ? "text-red-500" : ""}>
                  Data de Devolução*
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="scrapDate"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scrapDate && "text-muted-foreground",
                        formErrors.scrapDate && "border-red-500"
                      )}
                      disabled={disabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scrapDate ? format(scrapDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scrapDate}
                      onSelect={setScrapDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.scrapDate && (
                  <p className="text-xs text-red-500">Data é obrigatória</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapForm;
