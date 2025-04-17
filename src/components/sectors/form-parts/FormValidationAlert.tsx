
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FormValidationAlertProps {
  formErrors: {
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
    services?: boolean;
    photos?: boolean;
    exitDate?: boolean;
    exitInvoice?: boolean;
    scrapObservations?: boolean;
    scrapPhotos?: boolean;
  };
  isScrap?: boolean;
}

export const FormValidationAlert: React.FC<FormValidationAlertProps> = ({
  formErrors,
  isScrap = false
}) => {
  if (!formErrors) return null;
  
  // Verificar se há pelo menos um erro
  const hasErrors = Object.values(formErrors).some(error => error === true);
  
  if (!hasErrors) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro no preenchimento do formulário</AlertTitle>
      <AlertDescription>
        <p>Por favor, corrija os seguintes erros antes de continuar:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
          {formErrors.tagNumber && <li>O número da TAG é obrigatório</li>}
          {formErrors.tagPhoto && <li>A foto da TAG é obrigatória</li>}
          {formErrors.entryInvoice && <li>O número da nota fiscal de entrada é obrigatório</li>}
          {formErrors.entryDate && <li>A data de entrada é obrigatória</li>}
          {!isScrap && formErrors.services && <li>Selecione pelo menos um serviço</li>}
          {!isScrap && formErrors.photos && <li>Adicione fotos para todos os serviços selecionados</li>}
          {formErrors.exitDate && <li>A data de saída é obrigatória</li>}
          {formErrors.exitInvoice && <li>O número da nota fiscal de saída é obrigatório</li>}
          {isScrap && formErrors.scrapObservations && <li>O motivo do sucateamento é obrigatório</li>}
          {isScrap && formErrors.scrapPhotos && <li>Adicione fotos do estado de sucateamento</li>}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
