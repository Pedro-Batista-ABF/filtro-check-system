
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
import { Sector } from "@/types";

interface ScrapFormProps {
  sector: Sector;
  isScrap: boolean;
  setIsScrap: (value: boolean) => void;
  scrapObservations: string;
  setScrapObservations: (value: string) => void;
  scrapDate: Date | undefined;
  setScrapDate: (date: Date | undefined) => void;
  scrapInvoice: string;
  setScrapInvoice: (value: string) => void;
  formErrors: {
    scrapObservations?: boolean;
    scrapDate?: boolean;
    scrapInvoice?: boolean;
  };
}

export default function ScrapForm({
  sector,
  isScrap,
  setIsScrap,
  scrapObservations,
  setScrapObservations,
  scrapDate,
  setScrapDate,
  scrapInvoice,
  setScrapInvoice,
  formErrors
}: ScrapFormProps) {
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
                <div><strong>TAG:</strong> {sector.tagNumber}</div>
                <div><strong>NF Entrada:</strong> {sector.entryInvoice}</div>
                <div><strong>Data Entrada:</strong> {sector.entryDate}</div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Motivo do Sucateamento</h3>
              <p className="text-sm bg-gray-50 p-3 rounded">
                {sector.cycles && sector.cycles.length > 0 && sector.cycles[0].comments}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch 
                id="isScrap" 
                checked={isScrap} 
                onCheckedChange={setIsScrap} 
              />
              <Label htmlFor="isScrap">Confirmar Sucateamento</Label>
            </div>
            
            {isScrap && (
              <div className="pl-6 space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="scrapObservations" className={formErrors.scrapObservations ? "text-red-500" : ""}>
                    Comentários Adicionais*
                  </Label>
                  <Textarea
                    id="scrapObservations"
                    value={scrapObservations}
                    onChange={(e) => setScrapObservations(e.target.value)}
                    placeholder="Adicione comentários sobre o sucateamento..."
                    className={formErrors.scrapObservations ? "border-red-500" : ""}
                  />
                  {formErrors.scrapObservations && (
                    <p className="text-xs text-red-500">Comentários são obrigatórios</p>
                  )}
                </div>
                
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
