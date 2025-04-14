
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sector } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useApi } from "@/contexts/ApiContextExtended";
import { toast } from "sonner";

interface ProductionCompletionSwitchProps {
  sector: Sector;
}

export default function ProductionCompletionSwitch({ sector }: ProductionCompletionSwitchProps) {
  const [isCompleted, setIsCompleted] = useState(sector.productionCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshData } = useApi();
  
  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    
    try {
      // Atualizar o status do setor primeiro na tabela sectors
      const { error: sectorError } = await supabase
        .from('sectors')
        .update({
          current_status: checked ? 'checagemFinalPendente' : 'emExecucao',
          updated_at: new Date().toISOString()
        })
        .eq('id', sector.id);
        
      if (sectorError) {
        throw sectorError;
      }
      
      // Atualizar o ciclo atual
      const { data: cycleData } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sector.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleData) {
        const { error: cycleError } = await supabase
          .from('cycles')
          .update({
            production_completed: checked,
            status: checked ? 'checagemFinalPendente' : 'emExecucao',
            updated_at: new Date().toISOString()
          })
          .eq('id', cycleData.id);
          
        if (cycleError) {
          throw cycleError;
        }
      }
      
      setIsCompleted(checked);
      
      // Atualizar dados na interface
      await refreshData();
      
      toast.success(
        checked 
          ? "Setor marcado como concluído pela produção" 
          : "Setor marcado como em execução",
        {
          description: checked 
            ? "O setor está pronto para checagem final" 
            : "O setor voltou para execução"
        }
      );
    } catch (error) {
      console.error("Erro ao atualizar status de produção:", error);
      toast.error("Erro ao atualizar status", {
        description: "Não foi possível atualizar o status do setor"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="production-completed"
        checked={isCompleted}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <Label htmlFor="production-completed" className="font-medium">
        {isLoading 
          ? "Atualizando..." 
          : isCompleted 
            ? "Concluído pela produção" 
            : "Marcar como concluído pela produção"}
      </Label>
    </div>
  );
}
