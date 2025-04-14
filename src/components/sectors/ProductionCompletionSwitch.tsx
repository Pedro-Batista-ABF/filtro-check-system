
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sector } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";

interface ProductionCompletionSwitchProps {
  sector: Sector;
}

export default function ProductionCompletionSwitch({ sector }: ProductionCompletionSwitchProps) {
  const [isCompleted, setIsCompleted] = useState(
    sector.status === "checagemFinalPendente" || 
    sector.status === "concluido" ||
    sector.productionCompleted || false
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { refreshData } = useApi();
  
  const handleToggle = async (checked: boolean) => {
    try {
      setIsUpdating(true);
      setIsCompleted(checked);
      
      // Se estiver em execução e foi marcado como concluído, atualiza para checagemFinalPendente
      const newStatus = (sector.status === "emExecucao" && checked) 
        ? "checagemFinalPendente" 
        : (sector.status === "checagemFinalPendente" && !checked)
          ? "emExecucao"
          : sector.status;
      
      console.log(`Atualizando status do setor de ${sector.status} para ${newStatus}`);
      
      // Atualiza o setor no Supabase - usando apenas updated_at
      const { error } = await supabase
        .from('sectors')
        .update({
          current_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', sector.id);
      
      if (error) {
        console.error("Erro ao atualizar status do setor:", error);
        throw error;
      }
      
      // Atualiza o ciclo atual no Supabase
      const { error: cycleError } = await supabase
        .from('cycles')
        .update({
          status: newStatus,
          production_completed: checked,
          updated_at: new Date().toISOString()
        })
        .eq('sector_id', sector.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cycleError) {
        console.error("Erro ao atualizar ciclo:", cycleError);
        throw cycleError;
      }
      
      // Atualiza os dados locais
      await refreshData();
      
      // Notificar usuário
      toast.success(
        checked ? "Produção concluída!" : "Produção reaberta", 
        { 
          description: checked 
            ? "Setor enviado para checagem final" 
            : "Setor retornado para execução"
        }
      );
      
      // Se foi marcado como concluído, redireciona para a página de execução
      if (checked) {
        setTimeout(() => {
          navigate('/execucao');
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao atualizar produção:", error);
      setIsCompleted(!checked); // Reverte o estado em caso de erro
      toast.error("Erro ao atualizar produção", {
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="productionCompleted" 
        checked={isCompleted}
        onCheckedChange={handleToggle}
        disabled={isUpdating || sector.status === "concluido" || sector.status === "sucateado"}
      />
      <Label htmlFor="productionCompleted" className="cursor-pointer">
        {isUpdating ? "Atualizando..." : "Produção concluída"}
      </Label>
    </div>
  );
}
