
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Sector } from '@/types';
import SectorGrid from '@/components/sectors/SectorGrid';

// Let's define the props that SectorGrid expects
interface SectorGridProps {
  sectors: Sector[];
  onSectorClick?: (sector: Sector) => void;
}

export default function Sucateamento() {
  const navigate = useNavigate();
  const { sectors, isLoading, refreshData } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  useEffect(() => {
    document.title = "Sucateamento - Gestão de Recuperação";
    refreshData();
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
            {isLoading ? (
              <p>Carregando...</p>
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
            {isLoading ? (
              <p>Carregando...</p>
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
