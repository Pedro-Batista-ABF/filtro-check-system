
import React, { createContext, useContext } from 'react';
import { useApi as useApiOriginal } from './ApiContext';
import { Sector } from '@/types';
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
      } as Sector); // Force cast to Sector since we know id is provided
    },
    // Garantir que addSector está disponível e trata corretamente os erros
    addSector: (sectorData: Omit<Sector, 'id'>) => {
      console.log('ApiContextExtended.addSector chamado com:', sectorData);
      
      try {
        // Verificar se temos o tagNumber e entryInvoice como requisitos mínimos
        if (!sectorData.tagNumber || !sectorData.entryInvoice) {
          throw new Error("Número da TAG e Nota Fiscal são obrigatórios");
        }
        
        // Limpar e formatar os dados para evitar erros
        const cleanedData = {
          ...sectorData,
          // Converter objetos de Blob/File para URLs simples se necessário
          tagPhotoUrl: typeof sectorData.tagPhotoUrl === 'string' ? sectorData.tagPhotoUrl : undefined,
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
        
        return api.createSector(cleanedData);
      } catch (error) {
        console.error("Erro no ApiContextExtended.addSector:", error);
        toast.error("Erro ao preparar dados do setor");
        throw error;
      }
    }
  };
};

// Componente wrapper simples para compatibilidade
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
