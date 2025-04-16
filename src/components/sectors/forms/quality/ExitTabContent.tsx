
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExitTabContentProps {
  exitDate: Date | undefined;
  setExitDate: (date: Date | undefined) => void;
  exitInvoice: string;
  setExitInvoice: (value: string) => void;
  exitObservations: string;
  setExitObservations: (value: string) => void;
  qualityCompleted: boolean;
  setQualityCompleted: (value: boolean) => void;
  formErrors: {
    exitDate?: boolean;
    exitInvoice?: boolean;
    exitObservations?: boolean;
  };
}

export default function ExitTabContent({
  exitDate,
  setExitDate,
  exitInvoice,
  setExitInvoice,
  exitObservations,
  setExitObservations,
  qualityCompleted,
  setQualityCompleted,
  formErrors
}: ExitTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações de Saída</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exitInvoice" className={formErrors.exitInvoice ? "text-red-500" : ""}>
            Nota Fiscal de Saída*
          </Label>
          <Input
            id="exitInvoice"
            value={exitInvoice}
            onChange={(e) => setExitInvoice(e.target.value)}
            placeholder="Ex: NF-54321"
            className={formErrors.exitInvoice ? "border-red-500" : ""}
            required
          />
          {formErrors.exitInvoice && (
            <p className="text-xs text-red-500">Nota fiscal de saída é obrigatória</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exitDate" className={formErrors.exitDate ? "text-red-500" : ""}>
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
                  formErrors.exitDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {exitDate ? format(exitDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={exitDate}
                onSelect={setExitDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {formErrors.exitDate && (
            <p className="text-xs text-red-500">Data de saída é obrigatória</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exitObservations">
            Observações Adicionais
          </Label>
          <Textarea
            id="exitObservations"
            value={exitObservations}
            onChange={(e) => setExitObservations(e.target.value)}
            placeholder="Registre observações sobre a qualidade do setor..."
          />
        </div>
        
        <div className="flex items-center space-x-2 pt-4">
          <Switch 
            id="qualityCompleted" 
            checked={qualityCompleted} 
            onCheckedChange={setQualityCompleted} 
          />
          <Label htmlFor="qualityCompleted" className="font-medium">Marcar checagem como concluída</Label>
        </div>
        
        <div className="rounded-md bg-yellow-50 p-4 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Marcar como concluído enviará o setor para o status "CONCLUÍDO". Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
