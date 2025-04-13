
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, Photo, PhotoWithFile, SectorStatus, CycleOutcome } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

export function usePeritagemSubmit() {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const api = useApi();

  const handleSubmit = async (data: Partial<Sector>, isEditing: boolean, sectorId?: string) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      console.group('Sector Submission Debug');
      console.log("Submission Data:", JSON.stringify(data, null, 2));
      console.log("Is Editing:", isEditing);
      console.log("Sector ID:", sectorId);
      
      // Validate required fields
      if (!data.tagNumber) {
        throw new Error("Número do TAG é obrigatório");
      }

      if (!data.entryInvoice) {
        throw new Error("Nota fiscal de entrada é obrigatória");
      }

      // Verificar foto da tag - deve ser validação rigorosa
      if (!data.tagPhotoUrl || data.tagPhotoUrl === '') {
        console.error("Foto da TAG não encontrada");
        throw new Error("Foto da TAG é obrigatória");
      }

      // Verificar se a foto da TAG está no formato blob
      if (data.tagPhotoUrl && data.tagPhotoUrl.startsWith('blob:')) {
        console.log("Foto da TAG está em formato blob. Tentando processar...");
        
        try {
          // Aqui você pode adicionar lógica para processar a foto
          // Por enquanto, apenas continuamos com o URL do blob
          console.log("Usando URL do blob temporariamente:", data.tagPhotoUrl);
        } catch (photoError) {
          console.error("Erro ao processar foto da TAG:", photoError);
          throw new Error("Não foi possível processar a foto da TAG. Tente fazer o upload novamente.");
        }
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
      
      // Esse é um processamento crucial
      for (const service of servicesToProcess) {
        if (service.selected && service.photos && service.photos.length > 0) {
          for (const photo of service.photos) {
            // Garantir que temos um objeto de foto válido
            if (photo) {
              if ('file' in photo && photo.file instanceof File) {
                try {
                  // Upload da foto e obter URL
                  const photoWithFile = photo as PhotoWithFile;
                  console.log("Enviando foto para upload:", photoWithFile.file.name);
                  const photoUrl = await api.uploadPhoto(photoWithFile.file, 'before');
                  console.log("URL da foto obtida:", photoUrl);
                  
                  // Criar objeto Photo simples sem a propriedade file
                  const processedPhoto: Photo = {
                    id: photo.id || `${service.id}-${Date.now()}`,
                    url: photoUrl,
                    type: 'before',
                    serviceId: service.id
                  };
                  
                  processedPhotos.push(processedPhoto);
                } catch (uploadError) {
                  console.error('Erro no upload de foto:', uploadError);
                  toast.error("Erro ao fazer upload de foto");
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

      // Garantir que a foto da TAG está processada corretamente
      let tagPhotoUrl = data.tagPhotoUrl;
      if (tagPhotoUrl && tagPhotoUrl.startsWith('blob:')) {
        try {
          // Tente fazer upload da foto da TAG
          console.log("Tentando fazer upload da foto da TAG do blob:", tagPhotoUrl);
          // Aqui poderia ter um código para converter o blob em arquivo e fazer upload
          // Por enquanto, apenas mantemos o blob
        } catch (tagPhotoError) {
          console.error("Erro ao processar foto da TAG:", tagPhotoError);
          throw new Error("Não foi possível processar a foto da TAG. Tente fazer o upload novamente.");
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

      let result;
      
      try {
        if (isEditing && sectorId) {
          result = await api.updateSector(sectorId, sectorData);
        } else {
          // Chamando a função addSector diretamente do api
          result = await api.addSector(sectorData);
          console.log("Resposta da API após addSector:", result);
        }
      } catch (apiError) {
        console.error("Erro na chamada da API:", apiError);
        
        // Verificar se é um erro conhecido e tratar adequadamente
        if (apiError instanceof Error) {
          let errorMsg = apiError.message;
          
          if (errorMsg.includes("infinite recursion") || 
              errorMsg.includes("policy for relation")) {
            toast.error("Erro de permissão no banco de dados", {
              description: "Contacte o administrador do sistema para verificar as políticas de RLS",
              duration: 5000
            });
          } else if (errorMsg.includes("not authenticated") || 
                     errorMsg.includes("Não autenticado")) {
            toast.error("Erro de autenticação", {
              description: "Você precisa estar logado para cadastrar um setor",
              duration: 5000
            });
          } else if (errorMsg.includes("foto da TAG") || 
                     errorMsg.includes("TAG é obrigatória") ||
                     errorMsg.includes("TAG não encontrada")) {
            toast.error("Foto da TAG inválida", {
              description: "A foto da TAG é obrigatória. Verifique se você fez o upload corretamente.",
              duration: 5000
            });
            // Explicitamente definir o erro para ser mais específico
            errorMsg = "Foto da TAG não encontrada ou inválida";
          } else {
            toast.error("Erro ao processar setor", {
              description: errorMsg,
              duration: 5000
            });
          }
          
          // Atualizar a mensagem de erro para exibição
          setErrorMessage(errorMsg);
        } else {
          const genericError = "Erro desconhecido ao processar o setor";
          toast.error("Erro desconhecido", {
            description: genericError,
            duration: 5000
          });
          setErrorMessage(genericError);
        }
        
        throw apiError;
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
      
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao processar o setor';
      
      setErrorMessage(errorMsg);
      
      // Não exibir toast duplicado se já foi exibido no try/catch anterior
      if (!errorMsg.includes("TAG")) {
        toast.error("Erro ao salvar", { description: errorMsg });
      }
      
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
