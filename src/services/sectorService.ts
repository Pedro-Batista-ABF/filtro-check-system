
import { Sector, Photo, PhotoWithFile, ServiceType, SectorStatus, CycleOutcome } from '@/types';
import { toast } from 'sonner';
import { handleDatabaseError } from '@/utils/errorHandlers';
import { useApiOriginal } from '@/contexts/ApiContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from './supabaseService';

/**
 * Service for sector operations
 */
export const useSectorService = () => {
  // Usamos diretamente o supabaseService para evitar dependência cíclica
  // e evitar o erro de useApiOriginal fora de um ApiProvider
  
  const addSector = async (sectorData: Omit<Sector, 'id'>): Promise<string> => {
    try {
      // Verificar autenticação primeiro
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Não autenticado", {
          description: "Você precisa estar logado para realizar esta operação"
        });
        throw new Error("Não autenticado");
      }

      // Garantir que os tipos estejam corretos
      const status: SectorStatus = sectorData.status || 'peritagemPendente';
      const outcome: CycleOutcome = sectorData.outcome || 'EmAndamento';

      // Certifique-se de que todos os serviços tenham o campo 'type' definido corretamente
      const processedServices = sectorData.services?.map(service => ({
        ...service,
        type: service.id as ServiceType,
        // Remover a propriedade 'file' dos photos dentro dos serviços para evitar recursão
        photos: service.photos?.map(photo => ({
          id: photo.id,
          url: photo.url,
          type: photo.type,
          serviceId: photo.serviceId
        })) || []
      })) || [];

      // Garantir que as fotos estejam no formato correto sem propriedades extras
      const processedBeforePhotos = (sectorData.beforePhotos || []).map(photo => ({
        id: photo.id,
        url: photo.url,
        type: photo.type,
        serviceId: photo.serviceId
      }));

      // Adicionar campo updated_at para evitar o erro de "modified_at"
      const completeData = {
        tagNumber: sectorData.tagNumber,
        entryInvoice: sectorData.entryInvoice,
        entryDate: sectorData.entryDate,
        peritagemDate: sectorData.peritagemDate || '',
        services: processedServices,
        beforePhotos: processedBeforePhotos,
        afterPhotos: sectorData.afterPhotos || [],
        productionCompleted: sectorData.productionCompleted || false,
        status,
        outcome,
        cycleCount: sectorData.cycleCount || 1,
        tagPhotoUrl: sectorData.tagPhotoUrl,
        entryObservations: sectorData.entryObservations,
        updated_at: new Date().toISOString() // Adicionar campo updated_at
      };

      try {
        console.log("Enviando dados para criação de setor:", completeData);
        
        // Tentar diretamente pelo supabaseService
        try {
          console.log("Tentando criar setor diretamente pelo supabaseService");
          const result = await supabaseService.addSector(completeData);
          console.log("Resultado da criação direta:", result);
          
          if (result && 'id' in result) {
            toast.success("Setor cadastrado com sucesso!");
            return result.id;
          }
          
          throw new Error("Falha ao obter ID do setor criado");
        } catch (directError) {
          console.error("Erro na criação direta:", directError);
          throw directError;
        }
      } catch (error) {
        console.error("Erro detalhado ao adicionar setor:", error);
        const processedError = handleDatabaseError(error, "Não foi possível adicionar o setor");
        toast.error(processedError.message);
        throw processedError;
      }
    } catch (error) {
      console.error("Erro detalhado ao adicionar setor:", error);
      const processedError = handleDatabaseError(error, "Não foi possível adicionar o setor");
      toast.error(processedError.message);
      throw processedError;
    }
  };

  const updateSector = async (id: string, updates: Partial<Sector>): Promise<boolean> => {
    try {
      // Verificar autenticação primeiro
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Não autenticado", {
          description: "Você precisa estar logado para realizar esta operação"
        });
        throw new Error("Não autenticado");
      }

      // Primeiro, busca o setor atual
      const currentSector = await supabaseService.getSectorById(id);
      if (!currentSector) {
        throw new Error("Setor não encontrado");
      }

      // Garantir tipagem correta
      const status: SectorStatus = (updates.status as SectorStatus) || currentSector.status;
      const outcome: CycleOutcome = (updates.outcome as CycleOutcome) || currentSector.outcome || 'EmAndamento';

      // Certifique-se de que todos os serviços atualizados tenham o campo 'type' definido corretamente
      const processedServices = updates.services?.map(service => ({
        ...service,
        type: service.id as ServiceType,
        // Remover a propriedade 'file' dos photos dentro dos serviços para evitar recursão
        photos: service.photos?.map(photo => ({
          id: photo.id,
          url: photo.url,
          type: photo.type,
          serviceId: photo.serviceId
        })) || []
      })) || currentSector.services;

      // Garantir que as fotos estejam no formato correto sem propriedades extras
      const processedBeforePhotos = (updates.beforePhotos || currentSector.beforePhotos || []).map(photo => ({
        id: photo.id,
        url: photo.url,
        type: photo.type,
        serviceId: photo.serviceId
      }));

      const processedAfterPhotos = (updates.afterPhotos || currentSector.afterPhotos || []).map(photo => ({
        id: photo.id,
        url: photo.url,
        type: photo.type,
        serviceId: photo.serviceId
      }));

      // Garantir que apenas os campos necessários sejam modificados (para reduzir problemas com RLS)
      const safeUpdateData: Sector = {
        id: currentSector.id,
        tagNumber: updates.tagNumber || currentSector.tagNumber,
        entryInvoice: updates.entryInvoice || currentSector.entryInvoice,
        entryDate: updates.entryDate || currentSector.entryDate,
        peritagemDate: updates.peritagemDate || currentSector.peritagemDate,
        services: processedServices,
        status: status,
        beforePhotos: processedBeforePhotos,
        afterPhotos: processedAfterPhotos,
        productionCompleted: updates.productionCompleted !== undefined ? updates.productionCompleted : currentSector.productionCompleted || false,
        outcome: outcome,
        cycleCount: updates.cycleCount || currentSector.cycleCount || 1,
        tagPhotoUrl: updates.tagPhotoUrl || currentSector.tagPhotoUrl,
        updated_at: new Date().toISOString() // Adicionar campo updated_at
      };

      try {
        console.log("Enviando dados para atualização de setor:", safeUpdateData);
        
        // Tentar diretamente pelo supabaseService
        try {
          console.log("Tentando atualizar setor diretamente");
          const result = await supabaseService.updateSector(safeUpdateData);
          console.log("Resultado da atualização direta:", result);
          toast.success("Setor atualizado com sucesso!");
          return true;
        } catch (directError) {
          console.error("Erro na atualização direta:", directError);
          throw directError;
        }
      } catch (error) {
        console.error("Erro detalhado ao atualizar setor:", error);
        const processedError = handleDatabaseError(error, "Não foi possível atualizar o setor");
        toast.error(processedError.message);
        throw processedError;
      }
    } catch (error) {
      console.error("Erro detalhado ao atualizar setor:", error);
      const processedError = handleDatabaseError(error, "Não foi possível atualizar o setor");
      toast.error(processedError.message);
      throw processedError;
    }
  };

  return {
    addSector,
    updateSector
  };
};
