
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  loading: boolean;
  mode: 'peritagem' | 'production' | 'quality' | 'scrap';
  isScrap?: boolean;
  qualityCompleted?: boolean;
  onCancel?: () => void;
}

export default function FormActions({ 
  loading, 
  mode,
  isScrap = false,
  qualityCompleted = false,
  onCancel
}: FormActionsProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  const getButtonText = () => {
    if (loading) return "Salvando...";
    
    if (mode === 'scrap') {
      return isScrap ? 'Confirmar Sucateamento' : 'Salvar';
    }
    
    if (mode === 'quality') {
      return qualityCompleted ? 'Finalizar Setor' : 'Salvar Alterações';
    }
    
    if (mode === 'peritagem') {
      return isScrap ? 'Confirmar Sucateamento' : 'Salvar Peritagem';
    }
    
    return 'Salvar Alterações';
  };

  return (
    <div className="flex justify-end space-x-2">
      <Button 
        variant="outline" 
        type="button" 
        onClick={handleCancel}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          getButtonText()
        )}
      </Button>
    </div>
  );
}
