
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, PhotoWithFile } from "@/types";
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

  const handleSubmit = async (data: Partial<Sector>, isEditing: boolean, sectorId?: string) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      console.group('Sector Submission Debug');
      console.log("Submission Data:", JSON.stringify(data, null, 2));
      console.log("Is Editing:", isEditing);
      console.log("Sector ID:", sectorId);
      
      // Extensive authentication check
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Session Details:", session);
      console.log("Session Error:", sessionError);
      
      if (sessionError || !session) {
        console.error("Authentication Failed", sessionError);
        toast.error("Não autenticado", {
          description: "Você precisa estar logado para realizar esta operação"
        });
        throw new Error("Não autenticado. Faça login para continuar.");
      }
      
      const user = session.user;
      console.log("Current User:", user);

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
      const processedPhotos: PhotoWithFile[] = [];
      if (data.services) {
        for (const service of data.services) {
          if (service.selected && service.photos) {
            for (const photo of service.photos) {
              // Verificar se a foto tem a propriedade 'file' antes de usá-la
              if ('file' in photo && photo.file instanceof File) {
                try {
                  const photoUrl = await uploadPhoto(photo.file, 'before');
                  processedPhotos.push({
                    ...photo,
                    url: photoUrl
                  });
                } catch (uploadError) {
                  console.error('Foto Upload Error:', uploadError);
                  throw new Error(`Erro ao fazer upload de foto: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
                }
              } else if (photo.url) {
                // Se a foto já tem URL mas não tem file, simplesmente a adicione
                processedPhotos.push(photo as PhotoWithFile);
              }
            }
          }
        }
      }

      data.beforePhotos = processedPhotos;

      // Prepare sector data
      const sectorData: Omit<Sector, 'id'> = {
        ...data,
        status: 'peritagemPendente',
        outcome: 'EmAndamento',
        peritagemDate: format(new Date(), 'yyyy-MM-dd'),
        cycleCount: 1
      } as Omit<Sector, 'id'>;

      console.log("Final Sector Data:", JSON.stringify(sectorData, null, 2));

      let result;
      if (isEditing && sectorId) {
        result = await updateSector(sectorId, sectorData);
      } else {
        result = await addSector(sectorData);
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
