
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
      
      console.log("Iniciando submissão de dados do setor...");
      
      // Verificar se tem usuário autenticado
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("Verificação de sessão:", sessionData?.session ? "Autenticado" : "Não autenticado");
      
      if (sessionError) {
        console.error("Erro ao verificar sessão:", sessionError);
        throw new Error(`Erro de autenticação: ${sessionError.message}`);
      }
      
      if (!sessionData?.session) {
        toast.error("Não autenticado", {
          description: "Você precisa estar logado para realizar esta operação"
        });
        throw new Error("Não autenticado. Faça login para continuar.");
      }
      
      console.log("Dados iniciais para submissão:", data);
      
      // Verificar se a foto do TAG foi adicionada
      if (!data.tagPhotoUrl) {
        toast.error("Foto do TAG obrigatória", {
          description: "Por favor, adicione uma foto do TAG do setor"
        });
        throw new Error("Foto do TAG obrigatória");
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
        toast.error("Serviço obrigatório", {
          description: "Selecione pelo menos um serviço"
        });
        throw new Error("Selecione pelo menos um serviço");
      }

      // Verificar se todos os serviços selecionados têm pelo menos uma foto de defeito
      const missingPhotoServices = data.services?.filter(
        service => service.selected && (!service.photos || !service.photos.some(p => p.type === 'before'))
      );

      if (missingPhotoServices && missingPhotoServices.length > 0) {
        toast.error("Fotos de defeito obrigatórias", {
          description: `Adicione pelo menos uma foto para cada defeito selecionado: ${missingPhotoServices.map(s => s.name).join(', ')}`
        });
        throw new Error("Adicione pelo menos uma foto para cada defeito selecionado");
      }

      // Processar as fotos
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
            throw new Error(`Erro ao fazer upload de foto: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
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
          throw new Error(`Erro ao processar foto do TAG: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
      
      // Salvar a coleção de fotos no objeto de dados
      data.beforePhotos = processedPhotos;

      console.log("Dados do setor antes de salvar:", JSON.stringify(data, null, 2));

      if (isEditing && sectorId) {
        console.log("Atualizando setor existente:", sectorId);
        await updateSector(sectorId, data);
        toast.success("Peritagem atualizada", {
          description: "A peritagem foi atualizada com sucesso."
        });
      } else {
        console.log("Criando novo setor");
        const result = await addSector(data as Omit<Sector, 'id'>);
        console.log("Resultado da criação:", result);
        toast.success("Peritagem registrada", {
          description: "Nova peritagem registrada com sucesso."
        });
      }
      
      navigate('/peritagem');
      return true;
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      
      let errorMsg = "Ocorreu um erro ao salvar os dados do setor";
      
      if (error instanceof Error) {
        errorMsg = error.message;
        
        // Verificar se é um erro de autenticação
        if (errorMsg.includes("não autenticado") || errorMsg.includes("Não autenticado")) {
          errorMsg = "Você precisa estar logado para realizar esta operação. Faça login novamente.";
          
          // Tentar fazer logout e redirecionar para login
          try {
            await supabase.auth.signOut();
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } catch (logoutError) {
            console.error("Erro ao fazer logout:", logoutError);
          }
        }
        
        // Verificar se é um erro de RLS
        if (errorMsg.includes("row level security") || errorMsg.includes("violates row-level security")) {
          errorMsg = "Erro de permissão: você não tem autorização para realizar esta operação.";
        }
        
        // Verificar se é um erro de recursão infinita
        if (errorMsg.includes("infinite recursion")) {
          errorMsg = "Erro de configuração do banco de dados. Entre em contato com o suporte.";
        }
      }
      
      console.error("Detalhes do erro:", errorMsg);
      setErrorMessage(errorMsg);
      toast.error("Erro ao salvar", {
        description: errorMsg
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
