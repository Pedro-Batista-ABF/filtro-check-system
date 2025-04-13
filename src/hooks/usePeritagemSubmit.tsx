
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, Photo, PhotoWithFile, SectorStatus, CycleOutcome } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePeritagemSubmit() {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast: shadcnToast } = useToast();
  const navigate = useNavigate();
  const { addSector, updateSector, uploadPhoto } = useApi();

  const ensureUserProfile = async () => {
    // Verificar se o usuário está autenticado
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error("Não autenticado. Faça login para continuar.");
    }
    
    // Verificar se o perfil já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle();
    
    // Se o perfil não existir, crie-o
    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'Usuário',
          role: 'producao'
        });
      
      if (insertError) {
        console.error("Erro ao criar perfil:", insertError);
        throw new Error("Não foi possível criar o perfil do usuário");
      }
      
      console.log("Perfil de usuário criado com sucesso");
    }
    
    return session.user.id;
  };

  const handleSubmit = async (data: Partial<Sector>, isEditing: boolean, sectorId?: string) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      console.group('Sector Submission Debug');
      console.log("Submission Data:", JSON.stringify(data, null, 2));
      console.log("Is Editing:", isEditing);
      console.log("Sector ID:", sectorId);
      
      // Garantir que o perfil do usuário existe antes de continuar
      try {
        await ensureUserProfile();
        console.log("Perfil de usuário verificado com sucesso");
      } catch (profileError) {
        console.error("Erro ao verificar/criar perfil:", profileError);
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
                    serviceId: service.id
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
                  serviceId: photo.serviceId
                });
              }
            }
          }
        }
      }

      // Garantir que status e outcome sejam valores válidos nos tipos corretos
      const status: SectorStatus = (data.status as SectorStatus) || 'peritagemPendente';
      const outcome: CycleOutcome = (data.outcome as CycleOutcome) || 'EmAndamento';

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
        cycleCount: data.cycleCount || 1,
        entryObservations: data.entryObservations || ''
      };

      console.log("Final Sector Data:", JSON.stringify(sectorData, null, 2));

      // Implementar tentativas com atraso exponencial
      const maxRetries = 3;
      let attempt = 0;
      let result;
      
      while (attempt < maxRetries) {
        try {
          if (isEditing && sectorId) {
            result = await updateSector(sectorId, sectorData);
          } else {
            result = await addSector(sectorData);
          }
          // Se chegar aqui, a operação foi bem-sucedida
          break;
        } catch (retryError) {
          attempt++;
          console.warn(`Tentativa ${attempt} falhou:`, retryError);
          
          if (attempt >= maxRetries) {
            throw retryError; // Lançar o erro se todas as tentativas falharem
          }
          
          // Espera exponencial antes da próxima tentativa (500ms, 1000ms, 2000ms)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
        }
      }

      console.log("Submission Result:", result);
      console.groupEnd();

      toast.success(isEditing ? "Peritagem atualizada" : "Peritagem registrada", {
        description: isEditing 
          ? "A peritagem foi atualizada com sucesso." 
          : "Nova peritagem registrada com sucesso."
      });

      navigate('/peritagem');
      return true;
    } catch (error) {
      console.group('Sector Submission Error');
      console.error('Submission Error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao processar o setor';
      
      setErrorMessage(errorMessage);
      toast.error("Erro ao salvar", { description: errorMessage });
      
      console.groupEnd();
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
