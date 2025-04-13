
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

  // Função para gerar um cycleCount único
  const generateUniqueCycleCount = (attempt: number): number => {
    // Diferentes estratégias para cada tentativa
    const timestamp = Date.now();
    
    // Primeira tentativa: timestamp base + random
    if (attempt === 0) {
      const random = Math.floor(Math.random() * 10000);
      return timestamp + random;
    } 
    // Última tentativa: UUID totalmente aleatório convertido para número
    else if (attempt >= 6) {
      const randomUUID = crypto.randomUUID();
      const numericPart = parseInt(randomUUID.replace(/[^0-9]/g, '').slice(0, 8));
      const highRandomness = timestamp * 1000 + numericPart + Math.floor(Math.random() * 1000000);
      console.log(`Tentativa final (${attempt + 1}): gerando cycleCount totalmente aleatório: ${highRandomness}`);
      return highRandomness;
    } 
    // Tentativas intermediárias: aumentando progressivamente a aleatoriedade
    else {
      const spacing = Math.pow(10, attempt + 2); // 100, 1000, 10000, etc.
      const randomFactor = Math.floor(Math.random() * spacing);
      return timestamp + randomFactor + (attempt * 10000);
    }
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

      // Verificar se todos os serviços selecionados possuem pelo menos uma foto
      if (!isEditing) {
        let missingPhotos = false;
        for (const service of selectedServices) {
          if (!service.photos || service.photos.length === 0) {
            missingPhotos = true;
            break;
          }
        }
        
        if (missingPhotos) {
          throw new Error("Cada serviço selecionado deve ter pelo menos uma foto");
        }
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
      const maxRetries = 10; // Aumentamos para 10 tentativas
      let attempt = 0;
      let result;
      let lastError;
      
      while (attempt < maxRetries) {
        try {
          // Gera uma chave única diferente para cada tentativa
          const cycleCount = isEditing ? 
            (data.cycleCount || 1) : 
            generateUniqueCycleCount(attempt);
          
          console.log(`Tentativa ${attempt + 1}/${maxRetries} - cycleCount: ${cycleCount}`);
          console.log(`TAG: ${data.tagNumber}, Time: ${new Date().toISOString()}, Attempt: ${attempt + 1}`);

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

          if (isEditing && sectorId) {
            result = await updateSector(sectorId, sectorData);
          } else {
            result = await addSector(sectorData);
          }
          
          // Se chegar aqui, a operação foi bem-sucedida
          console.log("Setor salvo com sucesso:", result);
          break;
        } catch (error: any) {
          attempt++;
          lastError = error;
          
          // Log específico para erros de duplicação
          if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
            console.warn(`CycleCount duplicado, tentando novamente... Tentativa ${attempt} de ${maxRetries}`, error);
            console.error("Detalhes do erro de duplicação:", {
              code: error?.code,
              message: error?.message,
              details: error?.details,
              hint: error?.hint
            });
            
            // Adicionamos uma pequena espera entre tentativas para aumentar chance de sucesso
            const delayMs = 500 * Math.pow(2, attempt - 1);
            console.log(`Aguardando ${delayMs}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            console.warn(`Tentativa ${attempt} falhou com erro diferente de duplicação:`, error);
            
            // Se o erro não for de duplicação, desistimos imediatamente
            break;
          }
          
          // Se já chegou ao número máximo de tentativas, desiste
          if (attempt >= maxRetries) {
            console.error(`Todas as ${maxRetries} tentativas falharam. Último erro:`, lastError);
            throw new Error(`Falha ao salvar setor após ${maxRetries} tentativas. Verifique se já existe um setor com a mesma TAG e ciclo.`);
          }
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
