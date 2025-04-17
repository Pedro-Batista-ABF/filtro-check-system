
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface ScrapFormProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  entryDate: Date | undefined;
  setEntryDate: (date: Date | undefined) => void;
  scrapObservations: string;
  setScrapObservations: (value: string) => void;
  scrapDate: Date | undefined;
  setScrapDate: (date: Date | undefined) => void;
  scrapInvoice: string;
  setScrapInvoice: (value: string) => void;
  handlePhotoUpload: (files: FileList) => void;
  tagPhotoUrl: string | undefined;
  handleTagPhotoUpload: (files: FileList) => Promise<string | undefined>;
}

export default function ScrapForm({
  scrapObservations,
  setScrapObservations,
  scrapDate,
  setScrapDate,
  scrapInvoice,
  setScrapInvoice,
  tagPhotoUrl,
  tagNumber,
  entryInvoice,
  entryDate
}: ScrapFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <CardTitle>Informações de Sucateamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Ao confirmar o sucateamento deste setor, ele será enviado
              para aprovação e não poderá mais ser processado para recuperação.
            </p>
          </div>
          
          <div className="grid gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="scrap-reason">Motivo do Sucateamento</Label>
              <Textarea
                id="scrap-reason"
                value={scrapObservations}
                onChange={(e) => setScrapObservations(e.target.value)}
                placeholder="Descreva detalhadamente o motivo pelo qual este setor precisou ser sucateado..."
                className="h-32"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="scrap-date">Data de Sucateamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="scrap-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scrapDate && "text-muted-foreground"
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
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="scrap-invoice">Nota Fiscal de Sucateamento</Label>
                <Input
                  id="scrap-invoice"
                  value={scrapInvoice}
                  onChange={(e) => setScrapInvoice(e.target.value)}
                  placeholder="Ex: NF-12345"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="font-medium mb-2">Dados do Setor</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">TAG:</span> {tagNumber}
              </div>
              <div>
                <span className="font-medium">NF Entrada:</span> {entryInvoice}
              </div>
              <div>
                <span className="font-medium">Data Entrada:</span> {entryDate ? format(entryDate, "dd/MM/yyyy") : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
