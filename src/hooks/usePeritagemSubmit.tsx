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
        entryInvoice: data.entryInvoice,
        nf_entrada: data.entryInvoice, // Explicitly log nf_entrada
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
      let sectorResult: string | boolean = "";
      
      // Make sure both entryInvoice and nf_entrada are set to the same value
      if (data.entryInvoice) {
        (data as any).nf_entrada = data.entryInvoice;
      }
      
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
            // Fixed updateSector call - now passing sectorId separately
            result = await updateSector(sectorId, sectorData);
            sectorResult = result ? sectorId : false;
          } else {
            try {
              // For addSector we need a full sector, not partial
              result = await addSector(sectorData as Omit<Sector, 'id'>);
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
            
            // Se o erro estiver relacionado ao campo updated_at
            if (error?.message?.includes('updated_at') || error?.message?.includes('modified_at')) {
              console.log("Detected timestamp field error, adjusting fields...");
              continue; // Tentar novamente com o campo updated_at adicionado
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
        await updateSectorStatusInSupabase(sectorResult, data, status);
      }

      // Upload all photos with proper metadata directly to Supabase for better traceability
      if (sectorResult && typeof sectorResult === 'string') {
        await uploadPhotosWithMetadata(sectorResult, data);
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

  // New function to directly upload photos to Supabase with proper metadata
  const uploadPhotosWithMetadata = async (sectorId: string, data: Partial<Sector>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the latest cycle ID for this sector
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError || !cycleData) {
        console.error("Erro ao buscar ciclo para salvar fotos:", cycleError);
        return;
      }
      
      console.log("Salvando fotos para o ciclo:", cycleData.id);
      
      // Process all photos from selected services
      const selectedServices = data.services?.filter(service => service.selected) || [];
      
      for (const service of selectedServices) {
        const servicePhotos = service.photos || [];
        
        for (const photo of servicePhotos) {
          if (photo.url) {
            // Skip if the photo URL already exists in the database
            const { data: existingPhoto } = await supabase
              .from('photos')
              .select('id')
              .eq('url', photo.url)
              .maybeSingle();
              
            if (existingPhoto) {
              console.log("Foto já existe no banco:", photo.url);
              continue;
            }
            
            // Insert the photo with proper metadata
            const { error: photoError } = await supabase
              .from('photos')
              .insert({
                cycle_id: cycleData.id,
                service_id: service.id,
                url: photo.url,
                type: photo.type || 'before',
                created_by: user.id,
                metadata: {
                  sector_id: sectorId,
                  service_id: service.id,
                  stage: 'peritagem',
                  type: photo.type || 'servico'
                }
              });
              
            if (photoError) {
              console.error(`Erro ao inserir foto para serviço ${service.id}:`, photoError);
            } else {
              console.log(`Foto inserida com sucesso para serviço ${service.id}`);
            }
          }
        }
      }
      
      // Process tag photo if available
      if (data.tagPhotoUrl) {
        const { data: existingTagPhoto } = await supabase
          .from('photos')
          .select('id')
          .eq('url', data.tagPhotoUrl)
          .eq('type', 'tag')
          .maybeSingle();
          
        if (!existingTagPhoto) {
          const { error: tagPhotoError } = await supabase
            .from('photos')
            .insert({
              cycle_id: cycleData.id,
              service_id: null,
              url: data.tagPhotoUrl,
              type: 'tag',
              created_by: user.id,
              metadata: {
                sector_id: sectorId,
                stage: 'peritagem',
                type: 'tag'
              }
            });
            
          if (tagPhotoError) {
            console.error('Erro ao inserir foto da TAG:', tagPhotoError);
          } else {
            console.log("Foto da TAG inserida com sucesso");
          }
        }
      }
      
    } catch (error) {
      console.error("Erro ao fazer upload de fotos com metadados:", error);
    }
  };

  // Updated function to directly update sector status in Supabase
  const updateSectorStatusInSupabase = async (sectorId: string, data: Partial<Sector>, status: SectorStatus) => {
    try {
      console.log(`Atualizando status do setor ${sectorId} para ${status}`);
      
      // Update sector status
      const { error } = await supabase
        .from('sectors')
        .update({
          current_status: status,
          current_outcome: data.outcome || 'EmAndamento',
          updated_at: new Date().toISOString()
        })
        .eq('id', sectorId);
        
      if (error) {
        console.error("Erro ao atualizar status do setor:", error);
        throw error;
      }
      
      // Update cycle status
      const { error: cycleError } = await supabase
        .from('cycles')
        .update({
          status: status,
          outcome: data.outcome || 'EmAndamento',
          updated_at: new Date().toISOString(),
          entry_invoice: data.entryInvoice,
          tag_number: data.tagNumber,
          peritagem_date: data.peritagemDate
        })
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cycleError) {
        console.error("Erro ao atualizar status do ciclo:", cycleError);
        throw cycleError;
      }
      
      console.log("Status atualizado com sucesso para:", status);
      return true;
    } catch (error) {
      console.error(`Error updating sector ${sectorId} status:`, error);
      return false;
    }
  };

  return {
    handleSubmit,
    isSaving,
    errorMessage
  };
}
