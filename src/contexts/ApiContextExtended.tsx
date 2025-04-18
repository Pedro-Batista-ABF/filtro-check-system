import React, { createContext, useState, useContext, ReactNode, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector, Service, Photo } from '@/types';
import { toast } from 'sonner';
import { photoService } from '@/services/photoService';
import { sectorService } from '@/services/sectorService';

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
  addSector: (sector: Partial<Sector>) => Promise<string | boolean>;
  updateSector: (id: string, data: Partial<Sector>) => Promise<boolean>;
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
      
      // Log para depuração
      console.log(`Setor encontrado - ID: ${sectorData.id}, Status: ${sectorData.current_status}`);
      
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
      
      // Se não tiver ciclo, criar um objeto mínimo com apenas os dados do setor
      let mappedSector: Sector;
      
      if (!cycleData) {
        console.log("Nenhum ciclo encontrado, criando objeto básico do setor");
        mappedSector = {
          id: sectorData.id,
          tagNumber: sectorData.tag_number || "",
          tagPhotoUrl: sectorData.tag_photo_url || undefined,
          entryInvoice: sectorData.nf_entrada || "",
          entryDate: sectorData.data_entrada ? new Date(sectorData.data_entrada).toISOString().split('T')[0] : "",
          peritagemDate: "",
          services: [],
          beforePhotos: [],
          afterPhotos: [],
          scrapPhotos: [],
          productionCompleted: false,
          status: sectorData.current_status as any || 'peritagemPendente',
          outcome: sectorData.current_outcome as any || 'EmAndamento',
          cycleCount: sectorData.cycle_count || 1,
          updated_at: sectorData.updated_at
        };
        
        return mappedSector;
      }
      
      // Buscar serviços relacionados ao ciclo
      let services: Service[] = [];
      
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
      
      // Buscar fotos do tipo "before", "after" e "scrap"
      const { data: allPhotosData, error: allPhotosError } = await supabase
        .from('photos')
        .select('*')
        .eq('cycle_id', cycleData.id);
        
      if (allPhotosError) {
        console.error(`Erro ao buscar fotos para ciclo ${cycleData.id}:`, allPhotosError);
      }
      
      const beforePhotos = (allPhotosData || [])
        .filter(photo => photo.type === 'before')
        .map(photo => ({
          id: photo.id,
          url: photo.url,
          type: photo.type,
          serviceId: photo.service_id,
          metadata: photo.metadata,
          created_at: photo.created_at
        }));
        
      const afterPhotos = (allPhotosData || [])
        .filter(photo => photo.type === 'after')
        .map(photo => ({
          id: photo.id,
          url: photo.url,
          type: photo.type,
          serviceId: photo.service_id,
          metadata: photo.metadata,
          created_at: photo.created_at
        }));
        
      const scrapPhotos = (allPhotosData || [])
        .filter(photo => photo.type === 'scrap')
        .map(photo => ({
          id: photo.id,
          url: photo.url,
          type: photo.type,
          serviceId: photo.service_id,
          metadata: photo.metadata,
          created_at: photo.created_at
        }));
      
      // Montar objeto do setor com todos os dados
      mappedSector = {
        id: sectorData.id,
        tagNumber: sectorData.tag_number || "",
        tagPhotoUrl: sectorData.tag_photo_url || undefined,
        entryInvoice: sectorData.nf_entrada || "",
        entryDate: sectorData.data_entrada ? new Date(sectorData.data_entrada).toISOString().split('T')[0] : "",
        peritagemDate: cycleData?.peritagem_date ? new Date(cycleData.peritagem_date).toISOString().split('T')[0] : "",
        services: services,
        beforePhotos: beforePhotos,
        afterPhotos: afterPhotos,
        scrapPhotos: scrapPhotos,
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

  // Implementação de updateSector melhorada
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
        .select('id, current_status')
        .eq('id', id)
        .single();
        
      if (checkError) {
        console.error(`Erro ao verificar setor ${id}:`, checkError);
        throw checkError;
      }
      
      if (!existingSector) {
        throw new Error(`Setor com ID ${id} não encontrado`);
      }
      
      console.log(`Status atual do setor: ${existingSector.current_status}`);
      
      // Verificar se estamos atualizando para status sucateado
      const isScrapOperation = data.status === 'sucateado';
      
      if (isScrapOperation) {
        // Validar campos obrigatórios para sucateamento
        if (!data.scrapObservations) {
          throw new Error('Observações de sucateamento são obrigatórias');
        }
        
        if (!data.scrapReturnInvoice) {
          throw new Error('Nota fiscal de devolução é obrigatória');
        }
        
        if (!data.scrapReturnDate) {
          throw new Error('Data de devolução é obrigatória');
        }
        
        if (!data.scrapPhotos || !Array.isArray(data.scrapPhotos) || data.scrapPhotos.length === 0) {
          throw new Error('Pelo menos uma foto de sucateamento é obrigatória');
        }
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
      if (data.scrapObservations) updateData.scrap_observations = data.scrapObservations;
      
      console.log("Dados para atualização do setor:", updateData);
      
      // Atualizar setor
      const { error: updateError } = await supabase
        .from('sectors')
        .update(updateData)
        .eq('id', id);
        
      if (updateError) {
        console.error(`Erro ao atualizar setor ${id}:`, updateError);
        throw updateError;
      }
      
      // Buscar ciclo atual
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError) {
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
        
        console.log("Dados para atualização do ciclo:", cycleUpdateData);
        
        // Atualizar ciclo
        const { error: cycleUpdateError } = await supabase
          .from('cycles')
          .update(cycleUpdateData)
          .eq('id', cycleData.id);
          
        if (cycleUpdateError) {
          console.error(`Erro ao atualizar ciclo ${cycleData.id}:`, cycleUpdateError);
          throw cycleUpdateError;
        }
        
        // Se temos fotos para salvar, vamos salvá-las
        if (isScrapOperation && data.scrapPhotos && data.scrapPhotos.length > 0) {
          console.log(`Salvando ${data.scrapPhotos.length} fotos de sucateamento`);
          
          for (const photo of data.scrapPhotos) {
            // Verificar se a foto já existe (por URL)
            const { data: existingPhoto } = await supabase
              .from('photos')
              .select('id')
              .eq('url', photo.url)
              .maybeSingle();
              
            if (existingPhoto) {
              console.log(`Foto ${photo.url} já existe, pulando...`);
              continue;
            }
            
            // Inserir nova foto
            const { error: photoInsertError } = await supabase
              .from('photos')
              .insert({
                cycle_id: cycleData.id,
                url: photo.url,
                type: 'scrap',
                service_id: photo.serviceId || null,
                created_by: user.id,
                metadata: {
                  sector_id: id,
                  type: 'scrap',
                  created_at: new Date().toISOString()
                }
              });
              
            if (photoInsertError) {
              console.error(`Erro ao inserir foto de sucateamento:`, photoInsertError);
              // Continuar mesmo com erro para tentar salvar as outras fotos
            }
          }
        }
      }
      
      // Verificar se a atualização foi bem-sucedida para status sucateado
      if (isScrapOperation) {
        const { data: checkResult, error: statusCheckError } = await supabase
          .from('sectors')
          .select('current_status, current_outcome')
          .eq('id', id)
          .single();
          
        if (statusCheckError) {
          console.error("Erro ao verificar status final:", statusCheckError);
        } else {
          console.log("Status após atualização:", checkResult);
          
          if (checkResult && checkResult.current_status !== 'sucateado') {
            console.warn("Status não foi atualizado corretamente. Tentando atualização forçada...");
            
            const { error: forceError } = await supabase
              .from('sectors')
              .update({
                current_status: 'sucateado',
                current_outcome: 'Sucateado',
                updated_at: new Date().toISOString(),
                updated_by: user.id
              })
              .eq('id', id);
              
            if (forceError) {
              console.error("Erro na atualização forçada:", forceError);
            } else {
              console.log("Status forçado com sucesso para 'sucateado'");
            }
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
  
  // Add Sector implementation
  const addSector = async (sectorData: Partial<Sector>): Promise<string | boolean> => {
    try {
      console.log("Iniciando addSector com dados:", sectorData);
      setLoading(true);
      
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Use o serviço existente para adicionar o setor
      const result = await sectorService.addSector(sectorData as Omit<Sector, 'id'>);
      
      console.log("Setor adicionado com sucesso:", result);
      toast.success("Setor adicionado com sucesso");
      
      // Atualizar a lista de setores
      await refreshData();
      
      return result;
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(`Falha ao adicionar setor: ${errorMessage}`);
      toast.error(`Erro ao adicionar setor: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
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
