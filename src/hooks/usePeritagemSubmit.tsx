
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, Photo, SectorStatus } from "@/types";
import { toast } from "sonner";
import { ensureUserProfile } from "@/utils/ensureUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueCycleCount } from "@/utils/cycleUtils";
import { validatePeritagemData, findServicesWithoutPhotos } from "@/utils/peritagemValidation";
import { 
  processServicePhotos, 
  updateSectorStatusAndMetadata,
  prepareSectorData 
} from "@/utils/sectorSubmitUtils";

/**
 * Hook for handling peritagem submission
 */
export function usePeritagemSubmit() {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addSector, updateSector, uploadPhoto, refreshData } = useApi();

  /**
   * Handles the submission of peritagem data
   * @param data The sector data to submit
   * @param isEditing Whether this is an edit or a new sector
   * @param sectorId The ID of the sector (for editing)
   */
  const handleSubmit = async (data: Partial<Sector>, isEditing: boolean, sectorId?: string) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      console.log("Submitting sector data:", {
        isEditing,
        sectorId,
        tagNumber: data.tagNumber,
        services: data.services?.filter(s => s.selected).length
      });
      
      // Ensure user profile exists before continuing
      try {
        console.log("⏳ Verificando/criando perfil do usuário...");
        await ensureUserProfile();
        console.log("✅ Perfil de usuário verificado com sucesso");
      } catch (profileError) {
        console.error("❌ Erro ao verificar/criar perfil:", profileError);
        toast.error("Erro de autenticação", {
          description: profileError instanceof Error ? profileError.message : "Erro desconhecido de autenticação"
        });
        throw profileError;
      }
      
      // Authentication check
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Session Details:", session?.user?.id ? "Autenticado" : "Não autenticado");
      
      if (sessionError || !session) {
        console.error("Authentication Failed", sessionError);
        toast.error("Não autenticado", {
          description: "Você precisa estar logado para realizar esta operação"
        });
        throw new Error("Não autenticado. Faça login para continuar.");
      }
      
      // Validate required fields
      const validationResult = validatePeritagemData(data);
      if (validationResult) {
        throw new Error(validationResult.error);
      }

      // Verify if all selected services have at least one photo
      if (!isEditing) {
        const selectedServices = data.services?.filter(service => service.selected) || [];
        const servicesWithoutPhotos = findServicesWithoutPhotos(selectedServices);
        
        if (servicesWithoutPhotos.length > 0) {
          const serviceNames = servicesWithoutPhotos.join(", ");
          throw new Error(`Serviços sem fotos: ${serviceNames}. Cada serviço selecionado deve ter pelo menos uma foto.`);
        }
      }

      const selectedServices = data.services?.filter(service => service.selected) || [];
      console.log("Selected Services:", selectedServices);
      
      // Process before photos from services
      const processedPhotos = await processServicePhotos(data.services || [], uploadPhoto);

      // Define initial status - CHANGE: Start with emExecucao instead of peritagemPendente
      // for new sectors after form completion
      const status: SectorStatus = isEditing 
        ? (data.status as SectorStatus) || 'peritagemPendente'
        : 'emExecucao'; // New sectors go directly to 'emExecucao' after form completion

      // Implement attempts to add sector with unique cycleCount
      const maxRetries = 15;
      let attempt = 0;
      let result;
      let lastError;
      let sectorResult: string | Sector | boolean = "";
      
      while (attempt < maxRetries) {
        try {
          // Generate a different unique key for each attempt
          const cycleCount = isEditing ? 
            (data.cycleCount || 1) : 
            generateUniqueCycleCount(attempt);
          
          console.log(`Attempt ${attempt + 1}/${maxRetries} - cycleCount: ${cycleCount}`);
          console.log(`TAG: ${data.tagNumber}, Time: ${new Date().toISOString()}, Attempt: ${attempt + 1}`);

          // Prepare sector data with minimum required fields and updated_at field to avoid error
          const sectorData = prepareSectorData(data, isEditing, sectorId, status, processedPhotos, cycleCount);

          if (isEditing && sectorId) {
            result = await updateSector(sectorId, sectorData);
            sectorResult = result ? sectorId : false;
          } else {
            try {
              result = await addSector(sectorData);
              sectorResult = typeof result === 'string' ? result : false;
            } catch (addError) {
              console.error("Detailed error adding sector:", addError);
              throw addError;
            }
          }
          
          // If we get here, the operation was successful
          console.log("Sector saved successfully:", result);
          break;
        } catch (error: any) {
          attempt++;
          lastError = error;
          
          // Specific log for duplication errors
          if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
            console.warn(`Duplicate cycleCount, trying again... Attempt ${attempt} of ${maxRetries}`, error);
            console.error("Duplication error details:", {
              code: error?.code,
              message: error?.message,
              details: error?.details,
              hint: error?.hint
            });
            
            // Add a small delay between attempts to increase chance of success
            const delayMs = 500 * Math.pow(2, attempt - 1);
            console.log(`Waiting ${delayMs}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            console.warn(`Attempt ${attempt} failed with error other than duplication:`, error);
            console.error("Complete error:", error);
            
            // If the error is related to the updated_at field
            if (error?.message?.includes('modified_at') || error?.message?.includes('updated_at')) {
              console.log("Detected timestamp field error, adjusting fields...");
              continue; // Try again with updated_at field added
            }
            
            // If the error is not duplication or timestamp related, give up immediately
            break;
          }
          
          // If we've reached the maximum number of attempts, give up
          if (attempt >= maxRetries) {
            console.error(`All ${maxRetries} attempts failed. Last error:`, lastError);
            throw new Error(`Failed to save sector after ${maxRetries} attempts. Check if a sector with the same TAG and cycle already exists.`);
          }
        }
      }

      // After saving successfully, directly update the sector status in Supabase to emExecucao
      if (sectorResult && typeof sectorResult === 'string') {
        await updateSectorStatusAndMetadata(sectorResult, data);
      }

      // Reload data to update the interface
      await refreshData();

      toast.success(isEditing ? "Peritagem atualizada" : "Peritagem registrada", {
        description: isEditing 
          ? "A peritagem foi atualizada com sucesso." 
          : "Nova peritagem registrada com sucesso."
      });

      navigate('/peritagem');
      return true;
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao processar o setor';
      
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
