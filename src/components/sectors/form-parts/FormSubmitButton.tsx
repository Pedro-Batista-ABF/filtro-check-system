
import { Button } from "@/components/ui/button";

interface FormSubmitButtonProps {
  isLoading: boolean;
  mode: 'create' | 'edit' | 'view' | 'checagem' | 'scrap';
  fullWidth?: boolean;
}

export function FormSubmitButton({ isLoading, mode, fullWidth = false }: FormSubmitButtonProps) {
  let buttonText = "Salvar";
  if (isLoading) buttonText = "Salvando...";
  else if (mode === 'create') buttonText = "Registrar Peritagem";
  else if (mode === 'checagem') buttonText = "Concluir Checagem";

  return (
    <Button 
      type="submit" 
      disabled={isLoading} 
      className={fullWidth ? "w-full" : ""}
    >
      {buttonText}
    </Button>
  );
}
