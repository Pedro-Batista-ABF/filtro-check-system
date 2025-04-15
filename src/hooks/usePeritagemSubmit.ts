
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector } from "@/types";
import { toast } from "sonner";
import { generateUniqueCycleCount } from "@/utils/cycleUtils";
import { validatePeritagemData, findServicesWithoutPhotos } from "@/utils/peritagemValidation";
import { processServicePhotos } from "@/utils/sectorSubmitUtils";
import { usePhotoUploadWithMetadata } from "./usePhotoUploadWithMetadata";
import { useSectorStatus } from "./useSectorStatus";
import { useSectorDataPreparation } from "./useSectorDataPreparation";
import { supabase } from "@/integrations/supabase/client";

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

      // Validate data
      const validationResult = validatePeritagemData(data);
      if (validationResult) {
        throw new Error(validationResult.error);
      }

      // Check photos for selected services
      if (!isEditing) {
        const selectedServices = data.services?.filter(service => service.selected) || [];
        const servicesWithoutPhotos = findServicesWithoutPhotos(selectedServices);
        
        if (servicesWithoutPhotos.length > 0) {
          throw new Error(`Serviços sem fotos: ${servicesWithoutPhotos.join(", ")}`);
        }
      }

      // Process photos
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

          const sectorData = prepareSectorData(data, isEditing, sectorId, status, processedPhotos, cycleCount);

          if (isEditing && sectorId) {
            result = await updateSector(sectorId, sectorData);
            sectorResult = result ? sectorId : false;
          } else {
            result = await addSector(sectorData as Omit<Sector, 'id'>);
            sectorResult = typeof result === 'string' ? result : false;
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
