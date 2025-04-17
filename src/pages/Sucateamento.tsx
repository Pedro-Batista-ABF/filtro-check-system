
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
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function Sucateamento() {
  const navigate = useNavigate();
  const { sectors, isLoading } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [localSectors, setLocalSectors] = useState<Sector[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = "Sucateamento - Gestão de Recuperação";
  }, []);
  
  // This effect will only run once to fetch sectors directly
  useEffect(() => {
    const fetchSectorsDirectly = async () => {
      try {
        setLocalLoading(true);
        setError(null);
        
        // Verify authentication
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          navigate('/login');
          return;
        }
        
        // Fetch sectors with sucateado or sucateadoPendente status
        const { data: sectorsData, error: sectorsError } = await supabase
          .from('sectors')
          .select('*')
          .in('current_status', ['sucateado', 'sucateadoPendente']);
          
        if (sectorsError) {
          console.error("Erro ao buscar setores:", sectorsError);
          setError("Falha ao carregar setores. Tente novamente.");
          setLocalLoading(false);
          return;
        }
        
        if (sectorsData) {
          // Convert to Sector type and set
          const mappedSectors: Sector[] = sectorsData.map(sector => ({
            id: sector.id,
            tagNumber: sector.tag_number || "",
            tagPhotoUrl: sector.tag_photo_url || undefined,
            entryInvoice: sector.nf_entrada || "",
            entryDate: sector.data_entrada ? new Date(sector.data_entrada) : undefined,
            status: sector.current_status as any,
            outcome: sector.current_outcome as any || "EmAndamento",
            services: [],
            cycleCount: sector.cycle_count || 1,
            updated_at: sector.updated_at
          }));
          
          setLocalSectors(mappedSectors);
        }
      } catch (err) {
        console.error("Erro na busca direta de setores:", err);
        setError("Ocorreu um erro inesperado. Tente novamente.");
      } finally {
        setLocalLoading(false);
      }
    };
    
    fetchSectorsDirectly();
  }, [navigate]);
  
  // Use data from context if available
  useEffect(() => {
    if (!isLoading && sectors && sectors.length > 0) {
      setLocalSectors(sectors);
      setLocalLoading(false);
    }
  }, [sectors, isLoading]);
  
  // Filter sectors based on status and search term
  const pendingScraps = localSectors.filter(sector => 
    sector.status === 'sucateadoPendente' && 
    (searchTerm === '' || sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const completedScraps = localSectors.filter(sector => 
    sector.status === 'sucateado' && 
    (searchTerm === '' || sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSectorClick = (sector: Sector) => {
    navigate(`/sucateamento/${sector.id}`);
  };

  const handleRetryFetch = async () => {
    setLocalLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate('/login');
        return;
      }
      
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .in('current_status', ['sucateado', 'sucateadoPendente']);
        
      if (sectorsError) throw sectorsError;
      
      if (sectorsData) {
        const mappedSectors: Sector[] = sectorsData.map(sector => ({
          id: sector.id,
          tagNumber: sector.tag_number || "",
          tagPhotoUrl: sector.tag_photo_url || undefined,
          entryInvoice: sector.nf_entrada || "",
          entryDate: sector.data_entrada ? new Date(sector.data_entrada) : undefined,
          status: sector.current_status as any,
          outcome: sector.current_outcome as any || "EmAndamento",
          services: [],
          cycleCount: sector.cycle_count || 1, 
          updated_at: sector.updated_at
        }));
        
        setLocalSectors(mappedSectors);
        toast.success("Dados atualizados com sucesso");
      }
    } catch (err) {
      console.error("Erro ao tentar novamente:", err);
      setError("Falha ao recarregar dados. Tente novamente.");
      toast.error("Erro ao recarregar dados");
    } finally {
      setLocalLoading(false);
    }
  };

  if (error) {
    return (
      <PageLayoutWrapper>
        <div className="flex flex-col items-center justify-center py-10">
          <h1 className="text-xl font-bold text-red-500">Erro ao carregar dados</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleRetryFetch}
          >
            Tentar novamente
          </Button>
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
            {localLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingScraps.length > 0 ? (
              <SectorGrid
                sectors={pendingScraps}
                onSectorClick={handleSectorClick}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Não há setores pendentes de sucateamento.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {localLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : completedScraps.length > 0 ? (
              <SectorGrid
                sectors={completedScraps}
                onSectorClick={handleSectorClick}
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
