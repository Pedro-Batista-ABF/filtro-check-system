
import React, { createContext, useContext } from 'react';
import { useApi as useApiOriginal } from './ApiContext';
import { Sector, Photo } from '@/types';
import { toast } from 'sonner';

// Reexportando o hook useApi para manter compatibilidade
export const useApi = () => {
  const api = useApiOriginal();
  
  // Wrap das funções para garantir que estão sendo exportadas corretamente
  return {
    ...api,
    // Garantir que updateSector aceita o formato correto (id, updates)
    updateSector: (id: string, updates: Partial<Sector>) => {
      // Combinar id com updates para o formato esperado pelo ApiContext
      return api.updateSector({
        id,
        ...updates
      } as Sector);
    },
    // Garantir que addSector está disponível e trata corretamente os erros
    addSector: async (sectorData: Omit<Sector, 'id'>) => {
      console.log('ApiContextExtended.addSector chamado com:', sectorData);
      
      try {
        // Verificar se temos o tagNumber e entryInvoice como requisitos mínimos
        if (!sectorData.tagNumber || !sectorData.entryInvoice) {
          throw new Error("Número da TAG e Nota Fiscal são obrigatórios");
        }
        
        // Verificar se a tagPhotoUrl é válida e está presente
        if (!sectorData.tagPhotoUrl) {
          console.warn("ERRO CRÍTICO: Setor sendo cadastrado sem foto da TAG");
          throw new Error("Foto da TAG é obrigatória");
        }
        
        // Verificar se a foto da TAG é um blob
        if (sectorData.tagPhotoUrl.startsWith('blob:')) {
          console.error("Erro: Tentativa de salvar com foto em formato blob:", sectorData.tagPhotoUrl);
          throw new Error("A foto da TAG precisa ser processada antes de salvar o setor.");
        }
        
        // Limpar e formatar os dados para evitar erros
        const cleanedData = {
          ...sectorData,
          // Garantir que não há propriedades 'file' nos objetos de fotos
          beforePhotos: sectorData.beforePhotos?.map(photo => ({
            id: photo.id,
            url: photo.url,
            type: photo.type,
            serviceId: photo.serviceId
          })) || [],
          afterPhotos: sectorData.afterPhotos?.map(photo => ({
            id: photo.id,
            url: photo.url,
            type: photo.type,
            serviceId: photo.serviceId
          })) || []
        };
        
        // Validação final antes do envio
        if (!cleanedData.tagPhotoUrl || cleanedData.tagPhotoUrl === '') {
          console.error("Erro crítico: tagPhotoUrl está vazio após limpeza");
          throw new Error("Foto da TAG inválida ou não encontrada");
        }
        
        console.log("Dados limpos para envio:", cleanedData);
        const result = await api.createSector(cleanedData);
        return result;
      } catch (error) {
        console.error("Erro no ApiContextExtended.addSector:", error);
        
        // Melhorar mensagem de erro para problemas específicos
        if (error instanceof Error) {
          if (error.message.includes("infinite recursion")) {
            toast.error("Erro de permissão no banco de dados", {
              description: "Contacte o administrador do sistema para verificar as políticas de RLS"
            });
          } else if (error.message.includes("not authenticated")) {
            toast.error("Erro de autenticação", {
              description: "Você precisa estar logado para cadastrar um setor"
            });
          } else if (error.message.includes("foto da TAG") || error.message.includes("TAG é obrigatória")) {
            toast.error("Foto da TAG inválida", {
              description: "A foto da TAG é obrigatória e não foi encontrada"
            });
          } else {
            toast.error("Erro ao cadastrar setor", {
              description: error.message
            });
          }
        } else {
          toast.error("Erro desconhecido ao cadastrar setor");
        }
        
        throw error;
      }
    },
    // Adicionar uma nova função para processar fotos da TAG
    processTagPhoto: async (file: File): Promise<string> => {
      try {
        if (!file) {
          throw new Error("Arquivo de foto inválido");
        }
        
        console.log("Processando foto da TAG:", file.name);
        
        // Aqui você pode adicionar lógica para upload para o servidor
        // Por exemplo, usando supabase storage ou outra solução
        
        // Para este exemplo, retornamos uma URL temporária
        const url = URL.createObjectURL(file);
        return url;
      } catch (error) {
        console.error("Erro ao processar foto da TAG:", error);
        toast.error("Erro ao processar foto da TAG");
        throw error;
      }
    }
  };
};

// Componente wrapper simples para compatibilidade
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
