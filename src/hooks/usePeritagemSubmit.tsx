
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, Photo, PhotoWithFile, SectorStatus, CycleOutcome } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ensureUserProfile } from "@/utils/ensureUserProfile";

export function usePeritagemSubmit() {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast: shadcnToast } = useToast();
  const navigate = useNavigate();
  const { addSector, updateSector, uploadPhoto } = useApi();

  // Função para gerar um cycleCount único e aleatório
  const generateUniqueCycleCount = () => {
    // Timestamp atual (últimos 5 dígitos) + número aleatório (3 dígitos)
    return Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000);
  };

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
      
      // Garantir que o perfil do usuário existe antes de continuar
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
      
      // Verificação de autenticação
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
      if (!data.tagNumber) {
        throw new Error("Número do TAG é obrigatório");
      }

      if (!data.entryInvoice) {
        throw new Error("Nota fiscal de entrada é obrigatória");
      }

      // Verify services
      const selectedServices = data.services?.filter(service => service.selected) || [];
      if (selectedServices.length === 0) {
        throw new Error("Selecione pelo menos um serviço");
      }

      console.log("Selected Services:", selectedServices);
      
      // Process before photos from services
      const processedPhotos: Photo[] = [];
      const servicesToProcess = data.services || [];
      
      for (const service of servicesToProcess) {
        if (service.selected && service.photos && service.photos.length > 0) {
          for (const photo of service.photos) {
            // Garantir que temos um objeto de foto válido
            if (photo) {
              if ('file' in photo && photo.file instanceof File) {
                try {
                  // Upload da foto e obter URL
                  const photoWithFile = photo as PhotoWithFile;
                  const photoUrl = await uploadPhoto(photoWithFile.file, 'before');
                  
                  // Criar objeto Photo simples sem a propriedade file
                  const processedPhoto: Photo = {
                    id: photo.id || `${service.id}-${Date.now()}`,
                    url: photoUrl,
                    type: 'before',
                    serviceId: service.id // Usar service.id para serviceId
                  };
                  
                  processedPhotos.push(processedPhoto);
                } catch (uploadError) {
                  console.error('Foto Upload Error:', uploadError);
                  throw new Error(`Erro ao fazer upload de foto: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
                }
              } else if (photo.url) {
                // Se a foto já tem URL, adicione-a como está (garantindo que não tenha file)
                processedPhotos.push({
                  id: photo.id,
                  url: photo.url,
                  type: photo.type,
                  serviceId: service.id // Usar service.id para serviceId
                });
              }
            }
          }
        }
      }

      // Garantir que status e outcome sejam valores válidos nos tipos corretos
      const status: SectorStatus = (data.status as SectorStatus) || 'peritagemPendente';
      const outcome: CycleOutcome = (data.outcome as CycleOutcome) || 'EmAndamento';

      // Implementa tentativas de adicionar o setor com cycleCount único
      const maxRetries = 5;
      let attempt = 0;
      let result;
      let lastError;
      
      while (attempt < maxRetries) {
        try {
          // Para evitar chaves duplicadas, gerar um número aleatório para cycleCount se for um novo setor
          const cycleCount = isEditing 
            ? (data.cycleCount || 1) 
            : generateUniqueCycleCount() + attempt; // Adicionar o número da tentativa para garantir unicidade

          // Prepare sector data com dados mínimos necessários
          const sectorData = {
            tagNumber: data.tagNumber,
            tagPhotoUrl: data.tagPhotoUrl,
            entryInvoice: data.entryInvoice,
            entryDate: data.entryDate || format(new Date(), 'yyyy-MM-dd'),
            peritagemDate: format(new Date(), 'yyyy-MM-dd'),
            services: data.services || [],
            status: status,
            outcome: outcome,
            beforePhotos: processedPhotos,
            afterPhotos: [],
            productionCompleted: data.productionCompleted || false,
            cycleCount: cycleCount,
            entryObservations: data.entryObservations || ''
          };

          console.log(`Tentativa ${attempt + 1} - cycleCount: ${cycleCount}`);

          if (isEditing && sectorId) {
            result = await updateSector(sectorId, sectorData);
          } else {
            result = await addSector(sectorData);
          }
          
          // Se chegar aqui, a operação foi bem-sucedida
          console.log("Setor salvo com sucesso:", result);
          break;
        } catch (error) {
          attempt++;
          lastError = error;
          console.warn(`Tentativa ${attempt} falhou:`, error);
          
          // Se já chegou ao número máximo de tentativas, desiste
          if (attempt >= maxRetries) {
            console.error(`Todas as ${maxRetries} tentativas falharam. Último erro:`, lastError);
            throw lastError;
          }
          
          // Espera exponencial antes da próxima tentativa (500ms, 1000ms, 2000ms...)
          const delayMs = 500 * Math.pow(2, attempt - 1);
          console.log(`Aguardando ${delayMs}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

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
