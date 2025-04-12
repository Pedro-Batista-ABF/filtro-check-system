
import { useState } from "react";
import { Sector } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useApi } from "@/contexts/ApiContext";
import { toast } from "sonner";

interface ProductionCompletionSwitchProps {
  sector: Sector;
}

export default function ProductionCompletionSwitch({ sector }: ProductionCompletionSwitchProps) {
  const { updateSector } = useApi();
  const [isCompleted, setIsCompleted] = useState<boolean>(sector.productionCompleted);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      // Update the status to checagemFinalPendente if switching to completed
      const newStatus = checked ? 'checagemFinalPendente' : 'emExecucao';
      
      const updatedSector = await updateSector({
        ...sector,
        productionCompleted: checked,
        status: newStatus
      });
      
      setIsCompleted(updatedSector.productionCompleted);
      toast.success(`Setor ${checked ? 'liberado para checagem' : 'retornado para produção'}`);
    } catch (error) {
      toast.error('Erro ao atualizar status de conclusão');
      // Revert UI state on error
      setIsCompleted(sector.productionCompleted);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id={`production-complete-${sector.id}`}
        checked={isCompleted}
        onCheckedChange={handleToggle}
        disabled={isUpdating || sector.status === 'concluido'}
      />
      <Label 
        htmlFor={`production-complete-${sector.id}`}
        className={isCompleted ? "text-green-600 font-medium" : "text-gray-700"}
      >
        {isCompleted ? "Produção Concluída" : "Produção em Andamento"}
      </Label>
    </div>
  );
}
