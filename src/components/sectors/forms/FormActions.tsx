
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  loading: boolean;
  mode: 'review' | 'production' | 'quality' | 'scrap';
  isScrap?: boolean;
  qualityCompleted?: boolean;
}

export default function FormActions({ 
  loading, 
  mode,
  isScrap = false,
  qualityCompleted = false
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" type="button" onClick={() => window.history.back()}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          mode === 'scrap' 
            ? (isScrap ? 'Confirmar Sucateamento' : 'Salvar') 
            : (mode === 'quality' && qualityCompleted ? 'Finalizar Setor' : 'Salvar Alterações')
        )}
      </Button>
    </div>
  );
}
