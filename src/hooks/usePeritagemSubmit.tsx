
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, PhotoWithFile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function usePeritagemSubmit() {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addSector, updateSector, uploadPhoto } = useApi();

  const handleSubmit = async (data: Partial<Sector>, isEditing: boolean, sectorId?: string) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      // Verificar se tem usuário autenticado
      if (!localStorage.getItem('supabase.auth.token')) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para realizar esta operação",
          variant: "destructive"
        });
        setIsSaving(false);
        return false;
      }
      
      console.log("Dados iniciais para submissão:", data);
      
      // Verificar se a foto do TAG foi adicionada
      if (!data.tagPhotoUrl) {
        toast({
          title: "Foto do TAG obrigatória",
          description: "Por favor, adicione uma foto do TAG do setor",
          variant: "destructive"
        });
        setIsSaving(false);
        return false;
      }

      // Definir data da peritagem como hoje se for nova peritagem
      if (!isEditing) {
        data.peritagemDate = format(new Date(), 'yyyy-MM-dd');
        data.status = 'emExecucao' as const;
        data.outcome = 'EmAndamento';
        data.cycleCount = 1;
      }

      // Verificar se pelo menos um serviço foi selecionado
      const hasSelectedService = data.services?.some(service => service.selected);
      if (!hasSelectedService) {
        toast({
          title: "Serviço obrigatório",
          description: "Selecione pelo menos um serviço",
          variant: "destructive"
        });
        setIsSaving(false);
        return false;
      }

      // Verificar se todos os serviços selecionados têm pelo menos uma foto de defeito
      const missingPhotoServices = data.services?.filter(
        service => service.selected && (!service.photos || !service.photos.some(p => p.type === 'before'))
      );

      if (missingPhotoServices && missingPhotoServices.length > 0) {
        toast({
          title: "Fotos de defeito obrigatórias",
          description: `Adicione pelo menos uma foto para cada defeito selecionado: ${missingPhotoServices.map(s => s.name).join(', ')}`,
          variant: "destructive"
        });
        setIsSaving(false);
        return false;
      }

      // Processar as fotos - importante: elas não estão na estrutura correta ainda
      const beforePhotos: PhotoWithFile[] = [];
      
      // Para cada serviço com fotos, extrair todas as fotos do tipo 'before'
      if (data.services) {
        for (const service of data.services) {
          if (service.photos && service.photos.length > 0) {
            // Filtrar apenas fotos do tipo "before"
            const serviceBeforePhotos = service.photos.filter(photo => 
              photo.type === 'before'
            );
            
            // Adicionar serviceId às fotos e incluí-las na coleção
            for (const photo of serviceBeforePhotos) {
              beforePhotos.push({
                ...photo,
                serviceId: service.id
              });
            }
          }
        }
      }
      
      console.log("Processando fotos...", beforePhotos.length);
      
      // Upload de fotos, se necessário
      const processedPhotos: PhotoWithFile[] = [];
      for (const photo of beforePhotos) {
        if (photo.file) {
          try {
            console.log("Fazendo upload de foto:", photo.file.name);
            const photoUrl = await uploadPhoto(photo.file, 'before');
            console.log("Upload concluído com URL:", photoUrl);
            processedPhotos.push({
              ...photo,
              url: photoUrl
            });
          } catch (uploadError) {
            console.error('Erro ao fazer upload de foto:', uploadError);
            toast({
              title: "Erro de upload",
              description: "Não foi possível fazer o upload das fotos",
              variant: "destructive"
            });
            setIsSaving(false);
            return false;
          }
        } else {
          processedPhotos.push(photo);
        }
      }
      
      // Upload da foto do TAG, se necessário
      if (data.tagPhotoUrl && data.tagPhotoUrl.startsWith('blob:')) {
        // Converter blob URL para File
        try {
          console.log("Processando foto do TAG...");
          const response = await fetch(data.tagPhotoUrl);
          const blob = await response.blob();
          const file = new File([blob], `tag-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          // Fazer upload do arquivo
          console.log("Fazendo upload da foto do TAG");
          const photoUrl = await uploadPhoto(file, 'tags');
          console.log("Upload de TAG concluído com URL:", photoUrl);
          data.tagPhotoUrl = photoUrl;
        } catch (error) {
          console.error('Erro ao processar foto do TAG:', error);
          toast({
            title: "Erro de upload",
            description: "Não foi possível fazer o upload da foto do TAG",
            variant: "destructive"
          });
          setIsSaving(false);
          return false;
        }
      }
      
      // Salvar a coleção de fotos no objeto de dados
      data.beforePhotos = processedPhotos;

      console.log("Dados do setor antes de salvar:", JSON.stringify(data, null, 2));

      if (isEditing && sectorId) {
        console.log("Atualizando setor existente:", sectorId);
        await updateSector(sectorId, data);
        toast({
          title: "Peritagem atualizada",
          description: "A peritagem foi atualizada com sucesso."
        });
      } else {
        console.log("Criando novo setor");
        await addSector(data as Omit<Sector, 'id'>);
        toast({
          title: "Peritagem registrada",
          description: "Nova peritagem registrada com sucesso."
        });
      }
      navigate('/peritagem');
      return true;
    } catch (error) {
      console.error('Error saving sector:', error);
      
      // Mensagem de erro mais específica
      let errorMsg = "Ocorreu um erro ao salvar os dados do setor";
      
      if (error instanceof Error) {
        errorMsg = error.message;
        console.error("Detalhes do erro:", errorMsg);
        setErrorMessage(errorMsg);
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorMsg,
        variant: "destructive"
      });
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
