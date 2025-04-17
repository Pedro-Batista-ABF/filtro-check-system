
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import PageLayout from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Sector } from '@/types';
import SectorGrid from '@/components/sectors/SectorGrid';
import { toast } from 'sonner';

export default function Sucateamento() {
  const navigate = useNavigate();
  const { sectors, isLoading, error, refreshData } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [localSectors, setLocalSectors] = useState<Sector[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  
  useEffect(() => {
    document.title = "Sucateamento - Gestão de Recuperação";
    
    const loadData = async () => {
      try {
        setLocalLoading(true);
        await refreshData();
        setLocalLoading(false);
      } catch (err) {
        toast.error("Erro ao carregar setores");
        setLocalLoading(false);
      }
    };
    
    loadData();
  }, [refreshData]);
  
  useEffect(() => {
    if (!isLoading && sectors) {
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

  if (error) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-10">
          <h1 className="text-xl font-bold text-red-500">Erro ao carregar dados</h1>
          <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar os setores.</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => refreshData()}
          >
            Tentar novamente
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
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
    </PageLayout>
  );
}
