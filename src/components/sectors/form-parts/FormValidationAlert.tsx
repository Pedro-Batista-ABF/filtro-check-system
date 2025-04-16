
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export interface FormValidationAlertProps {
  tagNumber?: boolean;
  tagPhoto?: boolean;
  entryInvoice?: boolean;
  entryDate?: boolean;
  services?: boolean;
  photos?: boolean;
  [key: string]: boolean | undefined;
}

export const FormValidationAlert: React.FC<FormValidationAlertProps> = ({
  tagNumber,
  tagPhoto,
  entryInvoice,
  entryDate,
  services,
  photos,
  ...otherErrors
}) => {
  console.log("🔄 FormValidationAlert render", Date.now());
  console.log("🔄 Erros recebidos:", { tagNumber, tagPhoto, entryInvoice, entryDate, services, photos, ...otherErrors });
  
  const errors = {
    tagNumber: tagNumber || false,
    tagPhoto: tagPhoto || false,
    entryInvoice: entryInvoice || false,
    entryDate: entryDate || false,
    services: services || false,
    photos: photos || false,
    ...otherErrors
  };

  const hasErrors = Object.values(errors).some(error => error === true);

  if (!hasErrors) {
    console.log("🔄 FormValidationAlert - Sem erros, não renderizando", Date.now());
    return null;
  }

  const errorMessages: Record<string, string> = {
    tagNumber: 'O número da TAG é obrigatório',
    tagPhoto: 'Uma foto da TAG é obrigatória',
    entryInvoice: 'O número da nota fiscal de entrada é obrigatório',
    entryDate: 'A data de entrada é obrigatória',
    services: 'Pelo menos um serviço deve ser selecionado',
    photos: 'Cada serviço selecionado deve ter pelo menos uma foto'
  };

  // Generate error messages for any errors flagged as true
  const activeErrorMessages = Object.entries(errors)
    .filter(([key, value]) => value === true)
    .map(([key]) => errorMessages[key] || `Erro no campo ${key}`);

  console.log("🔄 FormValidationAlert - Erros ativos:", activeErrorMessages);
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro ao salvar formulário</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {activeErrorMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
