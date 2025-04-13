
import React, { createContext, useContext } from 'react';
import { useApi as useApiOriginal } from './ApiContext';

// Exportamos o mesmo hook do ApiContext para manter compatibilidade
export const useApi = useApiOriginal;

// Componente wrapper vazio para compatibilidade
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
