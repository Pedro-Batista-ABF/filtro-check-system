
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { SectorStatus, Sector, Service, ServiceType } from '@/types';
import { ApiContext } from './ApiContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { getSectorsByStatus as fetchSectorsByStatus } from '@/utils/sectorServices';

// Interface para o contexto estendido da API
interface ApiContextExtendedProps {
  children: React.ReactNode;
}

interface ApiContextExtendedValue {
  uploadPhoto: (file: File) => Promise<string>;
  addSector: (sectorData: Omit<Sector, 'id'>) => Promise<string | boolean>;
  updateSector: (id: string, sectorData: Partial<Sector>) => Promise<boolean>;
  getSectorById: (id: string) => Promise<Sector | null>;
  getSectorsByStatus: (status: SectorStatus) => Promise<Sector[]>;
  getServiceTypes: () => Promise<ServiceType[]>;
  refreshData: () => Promise<void>;
}

// Criar o contexto
const ApiContextExtendedContext = createContext<ApiContextExtendedValue>({
  uploadPhoto: async () => '',
  addSector: async () => false,
  updateSector: async () => false,
  getSectorById: async () => null,
  getSectorsByStatus: async () => [],
  getServiceTypes: async () => [],
  refreshData: async () => {},
});

// Provider do contexto
export const ApiContextExtendedProvider: React.FC<ApiContextExtendedProps> = ({ children }) => {
  const apiContext = useContext(ApiContext) || {};
  const refreshData = apiContext.refreshData || (async () => {});
  const { user } = useAuth();

  // Upload de uma foto
  const uploadPhoto = useCallback(
    async (file: File): Promise<string> => {
      try {
        // Verificar autenticação
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        // Gerar nome do arquivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `sector_photos/${fileName}`;

        // Upload do arquivo
        const { error: uploadError } = await supabase.storage
          .from('sector_photos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Erro ao fazer upload de foto:', uploadError);
          throw uploadError;
        }

        // Obter URL pública
        const { data } = supabase.storage
          .from('sector_photos')
          .getPublicUrl(filePath);

        return data.publicUrl;
      } catch (error) {
        console.error('Erro ao fazer upload de foto:', error);
        throw error;
      }
    },
    [user]
  );

  // Adicionar um setor
  const addSector = useCallback(
    async (sectorData: Omit<Sector, 'id'>): Promise<string | boolean> => {
      try {
        // Verificar autenticação
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        // Adicionar setor
        const { data: sectorResult, error: sectorError } = await supabase
          .from('sectors')
          .insert({
            tag_number: sectorData.tagNumber,
            tag_photo_url: sectorData.tagPhotoUrl,
            nf_entrada: sectorData.entryInvoice,
            data_entrada: sectorData.entryDate,
            current_status: sectorData.status || 'peritagemPendente',
            current_outcome: sectorData.outcome || 'EmAndamento',
            cycle_count: sectorData.cycleCount || 1,
            created_by: user.id,
            updated_by: user.id,
          })
          .select();

        if (sectorError) {
          console.error('Erro ao adicionar setor:', sectorError);
          throw sectorError;
        }

        if (!sectorResult || sectorResult.length === 0) {
          throw new Error('Nenhum resultado retornado ao criar setor');
        }

        const sectorId = sectorResult[0].id;

        // Adicionar serviços do setor
        if (sectorData.services && sectorData.services.length > 0) {
          const servicesToInsert = sectorData.services
            .filter((service) => service.selected)
            .map((service) => ({
              sector_id: sectorId,
              service_id: service.id,
              selected: service.selected,
              quantity: service.quantity || 1,
              observations: service.observations || '',
              stage: service.stage || 'peritagem',
            }));

          if (servicesToInsert.length > 0) {
            const { error: servicesError } = await supabase
              .from('sector_services')
              .insert(servicesToInsert);

            if (servicesError) {
              console.error('Erro ao adicionar serviços do setor:', servicesError);
              // Não precisa interromper, apenas logar
            }
          }
        }

        return sectorId;
      } catch (error) {
        console.error('Erro ao adicionar setor:', error);
        return false;
      }
    },
    [user]
  );

  // Atualizar um setor
  const updateSector = useCallback(
    async (id: string, sectorData: Partial<Sector>): Promise<boolean> => {
      try {
        // Verificar autenticação
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        // Atualizar setor
        const { error: sectorError } = await supabase
          .from('sectors')
          .update({
            tag_number: sectorData.tagNumber,
            tag_photo_url: sectorData.tagPhotoUrl,
            nf_entrada: sectorData.entryInvoice,
            data_entrada: sectorData.entryDate,
            current_status: sectorData.status,
            current_outcome: sectorData.outcome,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (sectorError) {
          console.error('Erro ao atualizar setor:', sectorError);
          throw sectorError;
        }

        // Atualizar serviços do setor
        if (sectorData.services && sectorData.services.length > 0) {
          // Primeiro, remover serviços existentes
          const { error: deleteError } = await supabase
            .from('sector_services')
            .delete()
            .eq('sector_id', id);

          if (deleteError) {
            console.error('Erro ao remover serviços do setor:', deleteError);
            // Não precisa interromper, apenas logar
          }

          // Depois, adicionar os novos serviços
          const servicesToInsert = sectorData.services
            .filter((service) => service.selected)
            .map((service) => ({
              sector_id: id,
              service_id: service.id,
              selected: service.selected,
              quantity: service.quantity || 1,
              observations: service.observations || '',
              stage: service.stage || 'peritagem',
            }));

          if (servicesToInsert.length > 0) {
            const { error: servicesError } = await supabase
              .from('sector_services')
              .insert(servicesToInsert);

            if (servicesError) {
              console.error('Erro ao adicionar serviços do setor:', servicesError);
              // Não precisa interromper, apenas logar
            }
          }
        }

        return true;
      } catch (error) {
        console.error('Erro ao atualizar setor:', error);
        return false;
      }
    },
    [user]
  );

  // Obter um setor pelo ID
  const getSectorById = useCallback(async (id: string): Promise<Sector | null> => {
    try {
      // Buscar setor
      const { data: sector, error: sectorError } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', id)
        .single();

      if (sectorError) {
        console.error('Erro ao buscar setor:', sectorError);
        throw sectorError;
      }

      // Buscar serviços do setor
      const { data: sectorServices, error: servicesError } = await supabase
        .from('sector_services')
        .select('*')
        .eq('sector_id', id);

      if (servicesError) {
        console.error('Erro ao buscar serviços do setor:', servicesError);
        // Não precisa interromper, apenas logar
      }

      // Buscar tipos de serviço
      const { data: serviceTypes, error: typesError } = await supabase
        .from('service_types')
        .select('*');

      if (typesError) {
        console.error('Erro ao buscar tipos de serviço:', typesError);
        // Não precisa interromper, apenas logar
      }

      // Mapear serviços
      const services: Service[] = [];

      if (sectorServices && sectorServices.length > 0 && serviceTypes && serviceTypes.length > 0) {
        // Criar map de tipos de serviço para acesso mais rápido
        const serviceTypesMap = new Map();
        serviceTypes.forEach((type) => {
          serviceTypesMap.set(type.id, type);
        });

        // Para cada serviço do setor, buscar fotos
        for (const sectorService of sectorServices) {
          const serviceType = serviceTypesMap.get(sectorService.service_id);

          if (serviceType) {
            // Buscar fotos do serviço
            const { data: photos, error: photosError } = await supabase
              .from('photos')
              .select('*')
              .eq('service_id', sectorService.service_id)
              .is('cycle_id', null);

            if (photosError) {
              console.error('Erro ao buscar fotos do serviço:', photosError);
              // Não precisa interromper, apenas logar
            }

            services.push({
              id: serviceType.id,
              name: serviceType.name,
              description: serviceType.description,
              selected: sectorService.selected,
              quantity: sectorService.quantity || 1,
              observations: sectorService.observations,
              photos: photos || [],
              completed: sectorService.completed,
              stage: sectorService.stage,
            });
          }
        }
      }

      // Preencher setor
      return {
        id: sector.id,
        tagNumber: sector.tag_number,
        tagPhotoUrl: sector.tag_photo_url,
        entryInvoice: sector.nf_entrada,
        entryDate: sector.data_entrada,
        services,
        status: sector.current_status as SectorStatus,
        outcome: sector.current_outcome,
        cycleCount: sector.cycle_count,
        updated_at: sector.updated_at,
      };
    } catch (error) {
      console.error('Erro ao obter setor por ID:', error);
      return null;
    }
  }, []);

  // Obter tipos de serviço
  const getServiceTypes = useCallback(async (): Promise<ServiceType[]> => {
    try {
      const { data, error } = await supabase.from('service_types').select('*');

      if (error) {
        console.error('Erro ao buscar tipos de serviço:', error);
        return [];
      }

      return data as ServiceType[];
    } catch (error) {
      console.error('Erro ao obter tipos de serviço:', error);
      return [];
    }
  }, []);

  // Obter setores por status, usando o utilitário importado
  const getSectorsByStatusCallback = useCallback(
    async (status: SectorStatus): Promise<Sector[]> => {
      return fetchSectorsByStatus(status);
    },
    []
  );

  // Memoizar o valor do contexto
  const value = useMemo(
    () => ({
      uploadPhoto,
      addSector,
      updateSector,
      getSectorById,
      getSectorsByStatus: getSectorsByStatusCallback,
      getServiceTypes,
      refreshData,
    }),
    [
      uploadPhoto,
      addSector,
      updateSector,
      getSectorById,
      getSectorsByStatusCallback,
      getServiceTypes,
      refreshData,
    ]
  );

  return (
    <ApiContextExtendedContext.Provider value={value}>
      {children}
    </ApiContextExtendedContext.Provider>
  );
};

// Hook para usar o contexto
export const useApi = () => useContext(ApiContextExtendedContext);
