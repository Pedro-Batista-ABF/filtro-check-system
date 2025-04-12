
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockSectors } from '@/services/mockData';
import { Sector, Service } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface ApiContextValue {
  sectors: Sector[];
  loading: boolean;
  addSector: (sector: Omit<Sector, 'id'>) => Promise<string>;
  updateSector: (id: string, updates: Partial<Sector>) => Promise<boolean>;
  getSectorById: (id: string) => Sector | undefined;
  updateServicePhotos: (sectorId: string, serviceId: string, photoUrl: string, type: 'before' | 'after') => Promise<boolean>;
  
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
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use the auth context for authentication functionality
  const auth = useAuth();

  useEffect(() => {
    const loadSectors = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSectors(mockSectors);
      setLoading(false);
    };

    loadSectors();
  }, []);

  const getCurrentUserIdentifier = () => {
    if (!auth.user) return 'system';
    const metadata = auth.getUserMetadata();
    return metadata.email || auth.user.id || 'system';
  };

  const addSector = async (sectorData: Omit<Sector, 'id'>): Promise<string> => {
    // Associate current user with the action
    const currentUser = getCurrentUserIdentifier();
    
    // Create a new sector with ID and tracking info
    const newSector: Sector = {
      ...sectorData,
      id: `sector-${Date.now()}`,
      // Add user tracking information
      _createdBy: currentUser,
      _createdAt: new Date().toISOString(),
    } as Sector;

    setSectors(prev => [...prev, newSector]);
    return newSector.id;
  };

  const updateSector = async (id: string, updates: Partial<Sector>): Promise<boolean> => {
    // Associate current user with the action
    const currentUser = getCurrentUserIdentifier();
    
    // Add user tracking information
    const updatesWithTracking = {
      ...updates,
      _updatedBy: currentUser,
      _updatedAt: new Date().toISOString(),
    };

    setSectors(prev => 
      prev.map(sector => 
        sector.id === id ? { ...sector, ...updatesWithTracking } : sector
      )
    );
    return true;
  };

  const getSectorById = (id: string): Sector | undefined => {
    return sectors.find(sector => sector.id === id);
  };

  const updateServicePhotos = async (
    sectorId: string, 
    serviceId: string, 
    photoUrl: string, 
    type: 'before' | 'after'
  ): Promise<boolean> => {
    setSectors(prev => {
      return prev.map(sector => {
        if (sector.id === sectorId) {
          const services = sector.services.map(service => {
            if (service.id === serviceId) {
              // Get existing photos or initialize
              const photos = service.photos || [];
              
              // Add new photo with user tracking
              const newPhoto = {
                id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                url: photoUrl,
                type,
                serviceId,
                _addedBy: getCurrentUserIdentifier(),
                _addedAt: new Date().toISOString(),
              };
              
              return {
                ...service,
                photos: [...photos, newPhoto],
              };
            }
            return service;
          });
          
          return {
            ...sector,
            services,
            _updatedBy: getCurrentUserIdentifier(),
            _updatedAt: new Date().toISOString(),
          };
        }
        return sector;
      });
    });
    
    return true;
  };

  // Simplify user object to match expected API
  const userInfo = auth.user ? {
    id: auth.user.id,
    email: auth.user.email || ''
  } : null;

  // Combine the original API context with authentication context
  const value: ApiContextValue = {
    sectors,
    loading,
    addSector,
    updateSector,
    getSectorById,
    updateServicePhotos,
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
