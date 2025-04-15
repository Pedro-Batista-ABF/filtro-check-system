
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Cycle } from '@/types';

interface EntryFormProps {
  cycle: Cycle;
}

export default function EntryForm({ cycle }: EntryFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados de Entrada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tagNumber">TAG do Setor</Label>
            <Input id="tagNumber" value={cycle.tagNumber || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryInvoice">Nota Fiscal de Entrada</Label>
            <Input id="entryInvoice" value={cycle.entryInvoice || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryDate">Data de Entrada</Label>
            <Input id="entryDate" value={cycle.entryDate || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="peritagemDate">Data da Peritagem</Label>
            <Input id="peritagemDate" value={cycle.peritagemDate || ''} readOnly />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entryObservations">Observações</Label>
          <Textarea 
            id="entryObservations" 
            value={cycle.entryObservations || ''} 
            readOnly 
            rows={4} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
