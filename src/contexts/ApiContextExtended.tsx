
import React, { createContext, useContext } from 'react';
import { useApi as useApiOriginal } from './ApiContext';
import { Sector } from '@/types';

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
    // Garantir que addSector está disponível
    addSector: (sectorData: Omit<Sector, 'id'>) => {
      return api.createSector(sectorData as any); // Use proper function from ApiContext
    }
  };
};

// Componente wrapper simples para compatibilidade
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
