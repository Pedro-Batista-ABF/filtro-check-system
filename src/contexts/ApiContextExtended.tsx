
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sector, Service, ServiceType, Photo } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useApiOriginal } from './ApiContext';

interface ApiContextValue {
  sectors: Sector[];
  loading: boolean;
  addSector: (sector: Omit<Sector, 'id'>) => Promise<string>;
  updateSector: (id: string, updates: Partial<Sector>) => Promise<boolean>;
  getSectorById: (id: string) => Promise<Sector | undefined>;
  getSectorsByTag: (tagNumber: string) => Promise<Sector[]>;
  getDefaultServices: () => Promise<Service[]>;
  updateServicePhotos: (sectorId: string, serviceId: string, photoUrl: string, type: 'before' | 'after') => Promise<boolean>;
  uploadPhoto: (file: File, folder?: string) => Promise<string>;
  
  // Auth properties and methods from AuthContext
  user: { id: string; email: string; } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (userData: { email: string; password: string; fullName: string; }) => Promise<boolean>;
}

// Create a new context that extends the original ApiContext
const ApiContextExtended = createContext<ApiContextValue | undefined>(undefined);

// This provider will combine both original API functionality and authentication
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the original api context
  const api = useApiOriginal();
  
  // Use the auth context for authentication functionality
  const auth = useAuth();

  // Simplify user object to match expected API
  const userInfo = auth.user ? {
    id: auth.user.id,
    email: auth.user.email || ''
  } : null;

  // Helper function to handle common database errors
  const handleDatabaseError = (error: any, defaultMessage: string): Error => {
    console.error(defaultMessage, error);
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check for infinite recursion error in database policies
      if (error.message.includes("infinite recursion")) {
        return new Error("Erro de configuração do banco de dados: problema de recursão infinita nas políticas de acesso. Contate o administrador do sistema.");
      }
      
      // Check for other database error messages that might be useful
      if (error.message.includes("violates row-level security policy")) {
        return new Error("Erro de permissão: você não tem autorização para realizar esta operação.");
      }
      
      return error;
    }
    
    // For unknown errors
    return new Error(defaultMessage);
  };

  // Adapter methods for extended API context
  const addSector = async (sectorData: Omit<Sector, 'id'>): Promise<string> => {
    try {
      const newSector = await api.createSector(sectorData);
      return newSector.id;
    } catch (error) {
      throw handleDatabaseError(error, "Não foi possível adicionar o setor");
    }
  };

  const updateSector = async (id: string, updates: Partial<Sector>): Promise<boolean> => {
    try {
      // Primeiro, busca o setor atual
      const currentSector = await api.getSectorById(id);
      if (!currentSector) {
        throw new Error("Setor não encontrado");
      }

      // Combina os dados atuais com as atualizações
      const updatedSector: Sector = {
        ...currentSector,
        ...updates
      };

      // Atualiza o setor
      await api.updateSector(updatedSector);
      return true;
    } catch (error) {
      throw handleDatabaseError(error, "Não foi possível atualizar o setor");
    }
  };

  const updateServicePhotos = async (
    sectorId: string, 
    serviceId: string, 
    photoUrl: string, 
    type: 'before' | 'after'
  ): Promise<boolean> => {
    try {
      // Busca o setor atual
      const sector = await api.getSectorById(sectorId);
      if (!sector) {
        throw new Error("Setor não encontrado");
      }

      // Cria uma cópia do setor para modificar
      const updatedSector = { ...sector };

      // Encontra o serviço
      const serviceIndex = updatedSector.services.findIndex(s => s.id === serviceId);
      if (serviceIndex === -1) {
        throw new Error("Serviço não encontrado");
      }

      // Inicializa o array de fotos do serviço se necessário
      if (!updatedSector.services[serviceIndex].photos) {
        updatedSector.services[serviceIndex].photos = [];
      }

      // Adiciona a nova foto
      const newPhoto: Photo = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        url: photoUrl,
        type,
        serviceId: serviceId as ServiceType
      };

      // Adiciona a foto ao array apropriado dependendo do tipo
      if (type === 'before') {
        updatedSector.beforePhotos = [...(updatedSector.beforePhotos || []), newPhoto];
      } else {
        updatedSector.afterPhotos = [...(updatedSector.afterPhotos || []), newPhoto];
      }

      // Atualiza o setor
      await api.updateSector(updatedSector);
      return true;
    } catch (error) {
      throw handleDatabaseError(error, "Não foi possível atualizar as fotos do serviço");
    }
  };

  // Combine the original API context with authentication context
  const value: ApiContextValue = {
    sectors: api.sectors,
    loading: api.loading,
    addSector,
    updateSector,
    getSectorById: api.getSectorById,
    getSectorsByTag: api.getSectorsByTag,
    getDefaultServices: api.getDefaultServices,
    updateServicePhotos,
    uploadPhoto: api.uploadPhoto,
    
    // Include auth properties and methods
    user: userInfo,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    registerUser: auth.registerUser,
  };

  return <ApiContextExtended.Provider value={value}>{children}</ApiContextExtended.Provider>;
};

// Create a custom hook for using the extended API context
export const useApi = (): ApiContextValue => {
  const context = useContext(ApiContextExtended);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
