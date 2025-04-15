
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, SectorStatus, Service } from "@/types";
import { toast } from "sonner";
import { generateUniqueCycleCount } from "@/utils/cycleUtils";
import { processServicePhotos } from "@/utils/sectorSubmitUtils";
import { usePhotoUploadWithMetadata } from "./usePhotoUploadWithMetadata";
import { useSectorStatus } from "./useSectorStatus";
import { useSectorDataPreparation } from "./useSectorDataPreparation";
import { supabase } from "@/integrations/supabase/client";
import { validatePeritagemData, findServicesWithoutPhotos } from "@/utils/peritagemValidation";

export function usePeritagemSubmit() {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addSector, updateSector, uploadPhoto, refreshData } = useApi();
  const { uploadPhotosWithMetadata } = usePhotoUploadWithMetadata();
  const { updateSectorStatus } = useSectorStatus();
  const { prepareSectorData } = useSectorDataPreparation();

  const handleSubmit = async (data: Partial<Sector>, isEditing: boolean, sectorId?: string) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Não autenticado");
        throw new Error("Não autenticado");
      }

      // Validar dados
      const validationResult = validatePeritagemData(data);
      if (validationResult) {
        throw new Error(validationResult.error);
      }

      // Validação extra para a foto da TAG
      if (!data.tagPhotoUrl) {
        throw new Error("Foto da TAG do setor é obrigatória");
      }

      // Verificar se todos os serviços selecionados possuem quantidade válida
      const selectedServices = data.services?.filter(service => service.selected) || [];
      const servicesWithoutValidQuantity = selectedServices.filter(
        service => !service.quantity || service.quantity <= 0
      );
      
      if (servicesWithoutValidQuantity.length > 0) {
        const serviceNames = servicesWithoutValidQuantity.map(s => s.name).join(", ");
        throw new Error(`Os seguintes serviços estão sem quantidade válida: ${serviceNames}`);
      }

      // Processar fotos
      const processedPhotos = await processServicePhotos(data.services || [], uploadPhoto);
      const status = isEditing ? (data.status as SectorStatus) || 'peritagemPendente' : 'emExecucao';

      let sectorResult: string | boolean = "";
      let attempt = 0;
      const maxRetries = 15;
      
      while (attempt < maxRetries) {
        try {
          const cycleCount = isEditing ? 
            (data.cycleCount || 1) : 
            generateUniqueCycleCount(attempt);

          // Preparar dados do setor garantindo metadados completos
          const sectorData = prepareSectorData(data, isEditing, sectorId, status, processedPhotos, cycleCount);

          // Garantir que os serviços tenham stage = 'peritagem'
          if (sectorData.services) {
            sectorData.services = sectorData.services.map(service => ({
              ...service,
              stage: 'peritagem',
              quantity: service.quantity || 1
            }));
          }

          let apiResult;
          if (isEditing && sectorId) {
            apiResult = await updateSector(sectorId, sectorData);
            sectorResult = apiResult ? sectorId : false;
          } else {
            apiResult = await addSector(sectorData as Omit<Sector, 'id'>);
            sectorResult = typeof apiResult === 'string' ? apiResult : false;
          }

          break;
        } catch (error: any) {
          attempt++;
          if (attempt >= maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
        }
      }

      if (sectorResult && typeof sectorResult === 'string') {
        await Promise.all([
          updateSectorStatus(sectorResult, data, status),
          uploadPhotosWithMetadata(sectorResult, data)
        ]);
      }

      await refreshData();
      
      toast.success(isEditing ? "Peritagem atualizada" : "Peritagem registrada");
      navigate('/peritagem');
      return true;
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrorMessage(errorMessage);
      toast.error("Erro ao salvar", { description: errorMessage });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleSubmit,
    isSaving,
    errorMessage
  };
}
