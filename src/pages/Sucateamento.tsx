
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Sector } from '@/types';
import SectorGrid from '@/components/sectors/SectorGrid';
import { toast } from 'sonner';
import { checkSupabaseConnection, refreshAuthSession } from "@/utils/connectionUtils";

export default function Sucateamento() {
  const navigate = useNavigate();
  const { sectors, isLoading, refreshData } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [loadingStatus, setLoadingStatus] = useState<'loading' | 'error' | 'success'>('loading');
  
  useEffect(() => {
    document.title = "Sucateamento - Gestão de Recuperação";
    
    const initPage = async () => {
      try {
        setLoadingStatus('loading');
        
        // Verificar conexão e tentar atualizar sessão
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.error("Sem conexão com o Supabase");
          setLoadingStatus('error');
          toast.error("Falha de conexão", {
            description: "Não foi possível conectar ao servidor. Verifique sua conexão."
          });
          return;
        }
        
        // Renovar sessão antes de buscar dados
        await refreshAuthSession();
        
        // Carregar dados
        await refreshData();
        setLoadingStatus('success');
      } catch (error) {
        console.error("Erro ao inicializar página:", error);
        setLoadingStatus('error');
        toast.error("Erro ao carregar página", {
          description: "Não foi possível carregar os dados. Tente novamente."
        });
      }
    };
    
    initPage();
  }, [refreshData]);
  
  // Filter sectors based on status and search term
  const pendingScraps = sectors.filter(sector => 
    sector.status === 'sucateadoPendente' && 
    (searchTerm === '' || sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const completedScraps = sectors.filter(sector => 
    sector.status === 'sucateado' && 
    (searchTerm === '' || sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSectorClick = (sector: Sector) => {
    navigate(`/sucateamento/${sector.id}`);
  };

  // Função para tentar reconectar
  const handleRetry = async () => {
    try {
      setLoadingStatus('loading');
      toast.info("Tentando reconectar...");
      
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        await refreshAuthSession();
        await refreshData();
        setLoadingStatus('success');
        toast.success("Conexão restaurada!");
      } else {
        setLoadingStatus('error');
        toast.error("Falha na reconexão");
      }
    } catch (error) {
      console.error("Erro ao tentar reconectar:", error);
      setLoadingStatus('error');
      toast.error("Erro ao reconectar");
    }
  };

  if (loadingStatus === 'loading' || isLoading) {
    return (
      <PageLayoutWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Carregando setores de sucateamento...</p>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (loadingStatus === 'error') {
    return (
      <PageLayoutWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 text-center">
            <p className="font-bold mb-2">Erro ao carregar dados</p>
            <p className="text-sm">Não foi possível carregar os setores para sucateamento.</p>
          </div>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Sucateamento</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por TAG..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes ({pendingScraps.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Sucateados ({completedScraps.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {pendingScraps.length > 0 ? (
              <SectorGrid
                sectors={pendingScraps}
                onSelect={handleSectorClick}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Não há setores pendentes de sucateamento.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {completedScraps.length > 0 ? (
              <SectorGrid
                sectors={completedScraps}
                onSelect={handleSectorClick}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Não há setores sucateados.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayoutWrapper>
  );
}
