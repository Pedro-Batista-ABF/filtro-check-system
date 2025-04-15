
import { createContext, useContext } from 'react';
import { useApi as useApiBase } from './ApiContext';
import { supabaseServices } from '@/services/supabase';
import { usePhotoService } from '@/services/photoService';

// Define the extended API context type
export type ApiContextExtendedType = ReturnType<typeof useApiExtendedOriginal>;

// Create the extended context
export const ApiContextExtended = createContext<ApiContextExtendedType | null>(null);

// This hook combines the base API with extended functionality
export const useApiExtendedOriginal = () => {
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
    throw new Error('useApi must be used within an ApiContextExtendedProvider');
  }
  return context;
};

// The provider component
export const ApiContextExtendedProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApiExtendedOriginal();
  
  return (
    <ApiContextExtended.Provider value={api}>
      {children}
    </ApiContextExtended.Provider>
  );
};
