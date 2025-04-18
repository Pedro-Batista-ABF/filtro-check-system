
import React, { createContext, useState, useContext, ReactNode, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector, Service, Photo } from '@/types';
import { toast } from 'sonner';
import { photoService } from '@/services/photoService';

interface ApiContextValue {
  loading: boolean;
  sectors: Sector[];
  error: string | null;
  uploadPhoto: (file: File, folder?: string) => Promise<string>;
  deletePhoto: (url: string) => Promise<boolean>;
  verifyPhotoUrl: (url: string) => Promise<boolean>;
  regeneratePublicUrl: (url: string) => string | null;
  downloadPhoto: (url: string) => Promise<string | null>;
  updateTagPhotoUrl: (sectorId: string, url: string) => Promise<boolean>;
  updateServicePhotos: (serviceId: string, photos: { url: string, type: string }[]) => Promise<boolean>;
  addSector: (sector: any) => Promise<string | boolean>;
  updateSector: (id: string, data: any) => Promise<boolean>;
  refreshData: () => Promise<void>;
  getSectorById: (id: string) => Promise<Sector | null>;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

export const ApiContextExtendedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Abortable requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadPhoto = async (file: File, folder: string = 'general'): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Criar novo AbortController para cada requisição
      abortControllerRef.current = new AbortController();
      
      // Adicionar timeout para a requisição
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          throw new Error("Upload timeout: a operação demorou muito tempo");
        }
      }, 30000); // 30 segundos de timeout
      
      // Fazer upload da foto
      const fileUrl = await photoService.uploadPhoto(file, folder);
      
      // Limpar timeout se o upload foi bem-sucedido
      clearTimeout(timeoutId);
      
      return fileUrl;
    } catch (error) {
      console.error("Erro no uploadPhoto:", error);
      
      let errorMessage = "Erro ao fazer upload da foto";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const deletePhoto = async (url: string): Promise<boolean> => {
    try {
      return await photoService.deletePhoto(url);
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      return false;
    }
  };

  const verifyPhotoUrl = async (url: string): Promise<boolean> => {
    try {
      return await photoService.verifyPhotoUrl(url);
    } catch (error) {
      console.error("Erro ao verificar URL da foto:", error);
      return false;
    }
  };

  const regeneratePublicUrl = (url: string): string | null => {
    try {
      return photoService.regeneratePublicUrl(url);
    } catch (error) {
      console.error("Erro ao regenerar URL pública:", error);
      return null;
    }
  };

  const downloadPhoto = async (url: string): Promise<string | null> => {
    try {
      return await photoService.downloadPhoto(url);
    } catch (error) {
      console.error("Erro ao baixar foto:", error);
      return null;
    }
  };

  const updateTagPhotoUrl = async (sectorId: string, url: string): Promise<boolean> => {
    try {
      return await photoService.updateTagPhotoUrl(sectorId, url);
    } catch (error) {
      console.error("Erro ao atualizar URL da foto da TAG:", error);
      return false;
    }
  };

  // Implementação para atualizar fotos de serviços
  const updateServicePhotos = async (
    serviceId: string, 
    photos: { url: string, type: string }[]
  ): Promise<boolean> => {
    try {
      console.log(`Atualizando fotos para serviço ${serviceId}:`, photos);
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Register photos in database
      for (const photo of photos) {
        const { error } = await supabase
          .from('photos')
          .insert({
            url: photo.url,
            type: photo.type,
            service_id: serviceId,
            created_by: user.id,
            metadata: {
              service_id: serviceId,
              type: photo.type
            }
          });
          
        if (error) {
          console.error("Erro ao inserir foto:", error);
          throw error;
        }
      }
      
      console.log(`${photos.length} fotos inseridas com sucesso`);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar fotos do serviço:", error);
      toast.error("Falha ao salvar fotos do serviço");
      return false;
    }
  };

  const refreshData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Buscar setores
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (sectorsError) {
        console.error("Erro ao buscar setores:", sectorsError);
        throw sectorsError;
      }
      
      if (sectorsData) {
        const mappedSectors: Sector[] = sectorsData.map(sector => ({
          id: sector.id,
          tagNumber: sector.tag_number || "",
          tagPhotoUrl: sector.tag_photo_url || undefined,
          entryInvoice: sector.nf_entrada || "",
          entryDate: sector.data_entrada ? new Date(sector.data_entrada).toISOString().split('T')[0] : "",
          status: sector.current_status as any || 'peritagemPendente',
          services: [],
          cycleCount: sector.cycle_count || 1,
          updated_at: sector.updated_at
        }));
        
        console.log(`${mappedSectors.length} setores carregados com sucesso`);
        setSectors(mappedSectors);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      let errorMessage = "Erro ao carregar dados";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Implementação completa de getSectorById
  const getSectorById = useCallback(async (id: string): Promise<Sector | null> => {
    console.log(`Buscando setor com ID: ${id}`);
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Buscar setor pelo ID
      const { data: sectorData, error: sectorError } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', id)
        .single();
        
      if (sectorError) {
        console.error(`Erro ao buscar setor com ID ${id}:`, sectorError);
        
        // Verificar se é erro de permissão
        if (sectorError.code === 'PGRST301' || 
            sectorError.message?.includes('permission denied') ||
            sectorError.message?.includes('row-level security policy')) {
          throw new Error("Sem permissão para acessar este setor");
        }
        
        throw sectorError;
      }
      
      if (!sectorData) {
        console.log(`Setor com ID ${id} não encontrado`);
        return null;
      }
      
      // Buscar o ciclo mais recente para este setor
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('*')
        .eq('sector_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError && !cycleError.message.includes('No rows returned')) {
        console.error(`Erro ao buscar ciclo para setor ${id}:`, cycleError);
      }
      
      // Buscar serviços relacionados ao ciclo
      let services: Service[] = [];
      
      if (cycleData) {
        const { data: servicesData, error: servicesError } = await supabase
          .from('cycle_services')
          .select('*')
          .eq('cycle_id', cycleData.id);
          
        if (servicesError) {
          console.error(`Erro ao buscar serviços para ciclo ${cycleData.id}:`, servicesError);
        }
        
        if (servicesData && servicesData.length > 0) {
          // Mapear serviços
          services = servicesData.map(service => ({
            id: service.service_id,
            name: service.service_id, // Ajustar conforme estrutura real
            description: "",
            selected: service.selected || false,
            quantity: service.quantity || 0,
            observations: service.observations || "",
            photos: [], // Será preenchido abaixo
            type: service.service_id,
            completed: service.completed || false
          }));
          
          // Buscar fotos para cada serviço
          for (const service of services) {
            const { data: photosData, error: photosError } = await supabase
              .from('photos')
              .select('*')
              .eq('service_id', service.id);
              
            if (photosError) {
              console.error(`Erro ao buscar fotos para serviço ${service.id}:`, photosError);
            }
            
            if (photosData && photosData.length > 0) {
              service.photos = photosData.map(photo => ({
                id: photo.id,
                url: photo.url,
                type: photo.type,
                serviceId: photo.service_id,
                metadata: photo.metadata,
                created_at: photo.created_at
              }));
            }
          }
        }
      }
      
      // Montar objeto do setor com todos os dados
      const mappedSector: Sector = {
        id: sectorData.id,
        tagNumber: sectorData.tag_number || "",
        tagPhotoUrl: sectorData.tag_photo_url || undefined,
        entryInvoice: sectorData.nf_entrada || "",
        entryDate: sectorData.data_entrada ? new Date(sectorData.data_entrada).toISOString().split('T')[0] : "",
        peritagemDate: cycleData?.peritagem_date ? new Date(cycleData.peritagem_date).toISOString().split('T')[0] : "",
        services: services,
        beforePhotos: [],
        afterPhotos: [],
        scrapPhotos: [],
        productionCompleted: cycleData?.production_completed || false,
        status: sectorData.current_status as any || 'peritagemPendente',
        outcome: sectorData.current_outcome as any || 'EmAndamento',
        cycleCount: sectorData.cycle_count || 1,
        updated_at: sectorData.updated_at,
        entryObservations: cycleData?.entry_observations || "",
        exitDate: cycleData?.exit_date ? new Date(cycleData.exit_date).toISOString().split('T')[0] : "",
        exitInvoice: cycleData?.exit_invoice || "",
        checagemDate: cycleData?.checagem_date ? new Date(cycleData.checagem_date).toISOString().split('T')[0] : "",
        exitObservations: cycleData?.exit_observations || "",
        scrapObservations: cycleData?.scrap_observations || "",
        scrapValidated: cycleData?.scrap_validated || false,
        scrapReturnDate: cycleData?.scrap_return_date ? new Date(cycleData.scrap_return_date).toISOString().split('T')[0] : "",
        scrapReturnInvoice: cycleData?.scrap_return_invoice || ""
      };
      
      console.log(`Setor ${id} carregado com sucesso:`, mappedSector);
      return mappedSector;
    } catch (error) {
      console.error(`Erro ao buscar setor ${id}:`, error);
      throw error;
    }
  }, []);

  // Implementação simplificada de addSector
  const addSector = async (sector: any): Promise<string | boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('sectors')
        .insert({
          tag_number: sector.tagNumber,
          tag_photo_url: sector.tagPhotoUrl,
          nf_entrada: sector.entryInvoice,
          data_entrada: sector.entryDate,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao adicionar setor:", error);
        throw error;
      }
      
      if (!data || !data.id) {
        throw new Error("Falha ao obter ID do setor após inserção");
      }
      
      return data.id;
    } catch (error) {
      console.error("Erro em addSector:", error);
      throw error;
    }
  };

  // Implementação de updateSector
  const updateSector = async (id: string, data: Partial<Sector>): Promise<boolean> => {
    try {
      console.log(`Atualizando setor ${id} com dados:`, data);
      
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Verificar se o setor existe
      const { data: existingSector, error: checkError } = await supabase
        .from('sectors')
        .select('id')
        .eq('id', id)
        .single();
        
      if (checkError) {
        console.error(`Erro ao verificar setor ${id}:`, checkError);
        throw checkError;
      }
      
      if (!existingSector) {
        throw new Error(`Setor com ID ${id} não encontrado`);
      }
      
      // Mapear dados para formato do banco
      const updateData: any = {
        updated_by: user.id,
        updated_at: new Date().toISOString()
      };
      
      // Converter campos específicos
      if (data.tagNumber) updateData.tag_number = data.tagNumber;
      if (data.tagPhotoUrl) updateData.tag_photo_url = data.tagPhotoUrl;
      if (data.entryInvoice) updateData.nf_entrada = data.entryInvoice;
      if (data.entryDate) updateData.data_entrada = data.entryDate;
      if (data.status) updateData.current_status = data.status;
      if (data.outcome) updateData.current_outcome = data.outcome;
      
      // Atualizar setor
      const { error: updateError } = await supabase
        .from('sectors')
        .update(updateData)
        .eq('id', id);
        
      if (updateError) {
        console.error(`Erro ao atualizar setor ${id}:`, updateError);
        throw updateError;
      }
      
      // Se precisar atualizar ciclo
      if (data.exitDate || data.exitInvoice || data.checagemDate || 
          data.exitObservations || data.scrapObservations || 
          data.scrapReturnDate || data.scrapReturnInvoice || 
          typeof data.productionCompleted !== 'undefined') {
        
        // Buscar ciclo atual
        const { data: cycleData, error: cycleError } = await supabase
          .from('cycles')
          .select('id')
          .eq('sector_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (cycleError && !cycleError.message.includes('No rows returned')) {
          console.error(`Erro ao buscar ciclo para setor ${id}:`, cycleError);
          throw cycleError;
        }
        
        if (cycleData) {
          // Preparar dados para atualizar ciclo
          const cycleUpdateData: any = {
            updated_by: user.id,
            status: data.status || 'emExecucao'
          };
          
          if (typeof data.productionCompleted !== 'undefined') 
            cycleUpdateData.production_completed = data.productionCompleted;
          if (data.exitDate) cycleUpdateData.exit_date = data.exitDate;
          if (data.exitInvoice) cycleUpdateData.exit_invoice = data.exitInvoice;
          if (data.checagemDate) cycleUpdateData.checagem_date = data.checagemDate;
          if (data.exitObservations) cycleUpdateData.exit_observations = data.exitObservations;
          if (data.scrapObservations) cycleUpdateData.scrap_observations = data.scrapObservations;
          if (typeof data.scrapValidated !== 'undefined') 
            cycleUpdateData.scrap_validated = data.scrapValidated;
          if (data.scrapReturnDate) cycleUpdateData.scrap_return_date = data.scrapReturnDate;
          if (data.scrapReturnInvoice) cycleUpdateData.scrap_return_invoice = data.scrapReturnInvoice;
          
          // Atualizar ciclo
          const { error: cycleUpdateError } = await supabase
            .from('cycles')
            .update(cycleUpdateData)
            .eq('id', cycleData.id);
            
          if (cycleUpdateError) {
            console.error(`Erro ao atualizar ciclo ${cycleData.id}:`, cycleUpdateError);
            throw cycleUpdateError;
          }
        }
      }
      
      console.log(`Setor ${id} atualizado com sucesso`);
      return true;
    } catch (error) {
      console.error(`Erro em updateSector para setor ${id}:`, error);
      throw error;
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    refreshData().catch(err => {
      console.error("Erro ao carregar dados iniciais:", err);
    });
  }, [refreshData]);

  const value = {
    loading,
    sectors,
    error,
    uploadPhoto,
    deletePhoto,
    verifyPhotoUrl,
    regeneratePublicUrl,
    downloadPhoto,
    updateTagPhotoUrl,
    updateServicePhotos,
    addSector,
    updateSector,
    refreshData,
    getSectorById
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = (): ApiContextValue => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi deve ser usado dentro de um ApiProvider");
  }
  return context;
};
