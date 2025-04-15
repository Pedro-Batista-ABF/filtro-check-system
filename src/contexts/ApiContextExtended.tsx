
import { createContext, useContext, useMemo } from 'react';
import { useApi as useApiBase } from './ApiContext';
import { usePhotoService } from '@/services/photoService';
import { ApiServiceType } from './ApiContext';

// Define the extended API context type
export type ApiContextExtendedType = ApiServiceType & {
  updateServicePhotos: (
    sectorId: string,
    serviceId: string,
    photoUrl: string,
    type: 'before' | 'after'
  ) => Promise<boolean>;
};

// Create the extended context
export const ApiContextExtended = createContext<ApiContextExtendedType | null>(null);

// This hook combines the base API with extended functionality
const useApiExtendedInternal = () => {
  const baseApi = useApiBase();
  const photoService = usePhotoService();
  
  // Use useMemo to prevent unnecessary re-renders
  return useMemo(() => ({
    ...baseApi,
    updateServicePhotos: photoService.updateServicePhotos
  }), [baseApi, photoService]);
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
  const api = useApiExtendedInternal();
  
  return (
    <ApiContextExtended.Provider value={api}>
      {children}
    </ApiContextExtended.Provider>
  );
};
