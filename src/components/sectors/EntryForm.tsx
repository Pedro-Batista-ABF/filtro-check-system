import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Cycle } from "@/types";

interface EntryFormProps {
  cycle: Cycle;
  onUpdate?: (data: Partial<Cycle>) => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function EntryForm({
  cycle,
  onUpdate,
  readonly = false,
  isLoading = false
}: EntryFormProps) {
  const [tagNumber, setTagNumber] = useState(cycle.tag_number || '');
  const [entryInvoice, setEntryInvoice] = useState(cycle.entry_invoice || '');
  const [entryDate, setEntryDate] = useState(cycle.entry_date || '');
  const [entryObservations, setEntryObservations] = useState(cycle.entry_observations || '');
  const [formErrors, setFormErrors] = useState({
    tagNumber: false,
    entryInvoice: false,
    entryDate: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onUpdate) {
      // Validate required fields
      let isValid = true;
      const newErrors = {
        tagNumber: false,
        entryInvoice: false,
        entryDate: false
      };
      
      if (!tagNumber.trim()) {
        newErrors.tagNumber = true;
        isValid = false;
      }
      if (!entryInvoice.trim()) {
        newErrors.entryInvoice = true;
        isValid = false;
      }
      if (!entryDate.trim()) {
        newErrors.entryDate = true;
        isValid = false;
      }
      
      if (isValid) {
        const data: Partial<Cycle> = {
          tag_number: tagNumber,
          entry_invoice: entryInvoice,
          entry_date: entryDate,
          entry_observations: entryObservations,
          created_at: new Date().toISOString()
        };
        
        onUpdate(data);
      } else {
        setFormErrors(newErrors);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados de Entrada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tagNumber" className={formErrors.tagNumber ? "text-red-500" : ""}>
              Número da TAG*
            </Label>
            <Input
              id="tagNumber"
              type="text"
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              placeholder="Número da TAG"
              readOnly={readonly || isLoading}
              className={formErrors.tagNumber ? "border-red-500" : ""}
            />
            {formErrors.tagNumber && (
              <p className="text-xs text-red-500">Número da TAG é obrigatório</p>
            )}
          </div>
          <div>
            <Label htmlFor="entryInvoice" className={formErrors.entryInvoice ? "text-red-500" : ""}>
              Nota Fiscal de Entrada*
            </Label>
            <Input
              id="entryInvoice"
              type="text"
              value={entryInvoice}
              onChange={(e) => setEntryInvoice(e.target.value)}
              placeholder="Número da Nota Fiscal"
              readOnly={readonly || isLoading}
              className={formErrors.entryInvoice ? "border-red-500" : ""}
            />
            {formErrors.entryInvoice && (
              <p className="text-xs text-red-500">Nota Fiscal é obrigatória</p>
            )}
          </div>
          <div>
            <Label htmlFor="entryDate" className={formErrors.entryDate ? "text-red-500" : ""}>
              Data de Entrada*
            </Label>
            <Input
              id="entryDate"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              readOnly={readonly || isLoading}
              className={formErrors.entryDate ? "border-red-500" : ""}
            />
            {formErrors.entryDate && (
              <p className="text-xs text-red-500">Data de Entrada é obrigatória</p>
            )}
          </div>
          <div>
            <Label htmlFor="entryObservations">Observações</Label>
            <Textarea
              id="entryObservations"
              value={entryObservations}
              onChange={(e) => setEntryObservations(e.target.value)}
              placeholder="Observações sobre a entrada"
              readOnly={readonly || isLoading}
            />
          </div>
          {!readonly && (
            <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Atualizar
            </button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
