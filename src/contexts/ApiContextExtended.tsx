
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sector, Service, Photo, PhotoWithFile } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useApiOriginal } from './ApiContext';
import { useSectorService } from '@/services/sectorService';
import { usePhotoService } from '@/services/photoService';
import { supabase } from '@/integrations/supabase/client';

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
  refreshData: () => Promise<void>;
  
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

  // Use our new service modules
  const sectorService = useSectorService();
  const photoService = usePhotoService();

  // Simplify user object to match expected API
  const userInfo = auth.user ? {
    id: auth.user.id,
    email: auth.user.email || ''
  } : null;

  // Função aprimorada para recarregar dados
  const refreshData = async () => {
    try {
      console.log("Iniciando recarregamento de dados...");
      toast.info("Recarregando dados...");
      
      // Verifica se o usuário está autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("Erro de autenticação ao recarregar dados:", sessionError);
        toast.error("Erro de autenticação", {
          description: "Por favor, faça login novamente."
        });
        return;
      }
      
      // Força o refresh da sessão
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Erro ao atualizar sessão:", error);
      }
      
      // Tentar recarregar os dados explicitamente
      try {
        // Limpar o cache do Supabase
        const channels = supabase.getChannels();
        for (const channel of channels) {
          supabase.removeChannel(channel);
        }

        // Recarregar dados através do método original se existir
        if (api && typeof api.refreshData === 'function') {
          await api.refreshData();
        } else {
          // Caso não exista um método de refresh, recarregar a página
          window.location.reload();
        }
        
        toast.success("Dados atualizados com sucesso");
      } catch (error) {
        console.error("Erro ao recarregar setores:", error);
        toast.error("Erro ao recarregar dados");
      }
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      toast.error("Erro ao recarregar dados");
    }
  };

  // Combine the original API context with authentication context and our new services
  const value: ApiContextValue = {
    sectors: api.sectors,
    loading: api.loading,
    addSector: sectorService.addSector,
    updateSector: sectorService.updateSector,
    getSectorById: api.getSectorById,
    getSectorsByTag: api.getSectorsByTag,
    getDefaultServices: api.getDefaultServices,
    updateServicePhotos: photoService.updateServicePhotos,
    uploadPhoto: api.uploadPhoto,
    refreshData,
    
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
