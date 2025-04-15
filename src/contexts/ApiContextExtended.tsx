
import { createContext, useContext } from 'react';
import { useApi as useApiBase } from './ApiContext';
import { supabaseServices } from '@/services/supabase';
import { usePhotoService } from '@/services/photoService';

// Create an extended context that includes additional functions
export type ApiContextExtendedType = ReturnType<typeof useApiOriginal>;

export const ApiContextExtended = createContext<ApiContextExtendedType | null>(null);

// This hook combines the base API with extended functionality
export const useApiOriginal = () => {
  const baseApi = useApiBase();
  const photoService = usePhotoService();
  
  return {
    ...baseApi,
    ...supabaseServices,
    updateServicePhotos: photoService.updateServicePhotos
  };
};

// This is the hook that components will use
export const useApi = () => {
  const context = useContext(ApiContextExtended);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// The provider component
export const ApiContextExtendedProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApiOriginal();
  
  return (
    <ApiContextExtended.Provider value={api}>
      {children}
    </ApiContextExtended.Provider>
  );
};
