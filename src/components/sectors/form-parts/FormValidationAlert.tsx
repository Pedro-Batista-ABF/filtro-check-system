
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FormValidationAlertProps {
  tagNumber?: boolean;
  tagPhoto?: boolean;
  entryInvoice?: boolean;
  entryDate?: boolean;
  services?: boolean;
  photos?: boolean;
  exitDate?: boolean;
  exitInvoice?: boolean;
  scrapObservations?: boolean;
}

export const FormValidationAlert: React.FC<FormValidationAlertProps> = ({
  tagNumber,
  tagPhoto,
  entryInvoice,
  entryDate,
  services,
  photos,
  exitDate,
  exitInvoice,
  scrapObservations
}) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro no preenchimento do formulário</AlertTitle>
      <AlertDescription>
        <p>Por favor, corrija os seguintes erros antes de continuar:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
          {tagNumber && <li>O número da TAG é obrigatório</li>}
          {tagPhoto && <li>A foto da TAG é obrigatória</li>}
          {entryInvoice && <li>O número da nota fiscal de entrada é obrigatório</li>}
          {entryDate && <li>A data de entrada é obrigatória</li>}
          {services && <li>Selecione pelo menos um serviço</li>}
          {photos && <li>Adicione fotos para todos os serviços selecionados</li>}
          {exitDate && <li>A data de saída é obrigatória</li>}
          {exitInvoice && <li>O número da nota fiscal de saída é obrigatório</li>}
          {scrapObservations && <li>O motivo do sucateamento é obrigatório</li>}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
