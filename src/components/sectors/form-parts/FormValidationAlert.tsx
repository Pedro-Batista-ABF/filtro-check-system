
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface FormValidationAlertProps {
  tagNumber?: boolean;
  tagPhoto?: boolean;
  entryInvoice?: boolean;
  entryDate?: boolean;
  services?: boolean;
  photos?: boolean;
  exitDate?: boolean;
  exitInvoice?: boolean;
}

export function FormValidationAlert({
  tagNumber = false,
  tagPhoto = false,
  entryInvoice = false,
  entryDate = false,
  services = false,
  photos = false,
  exitDate = false,
  exitInvoice = false
}: FormValidationAlertProps) {
  const hasEntryErrors = tagNumber || tagPhoto || entryInvoice || entryDate;
  const hasServiceErrors = services || photos;
  const hasExitErrors = exitDate || exitInvoice;
  
  if (!hasEntryErrors && !hasServiceErrors && !hasExitErrors) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>
        <p>Por favor, corrija os seguintes erros:</p>
        <ul className="list-disc ml-5 mt-2">
          {tagNumber && <li>Número de TAG é obrigatório</li>}
          {tagPhoto && <li>Foto da TAG é obrigatória</li>}
          {entryInvoice && <li>Nota fiscal de entrada é obrigatória</li>}
          {entryDate && <li>Data de entrada é obrigatória</li>}
          {services && <li>Selecione pelo menos um serviço</li>}
          {photos && <li>Adicione pelo menos uma foto para cada serviço selecionado</li>}
          {exitDate && <li>Data de saída é obrigatória</li>}
          {exitInvoice && <li>Nota fiscal de saída é obrigatória</li>}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
