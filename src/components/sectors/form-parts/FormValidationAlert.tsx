
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormValidationAlertProps {
  show: boolean;
}

export function FormValidationAlert({ show }: FormValidationAlertProps) {
  if (!show) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Formulário com erros</AlertTitle>
      <AlertDescription>
        Verifique os campos destacados em vermelho e tente novamente.
      </AlertDescription>
    </Alert>
  );
}
