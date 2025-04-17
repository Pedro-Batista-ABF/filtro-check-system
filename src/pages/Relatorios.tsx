
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Filter, Download, AlertTriangle } from 'lucide-react';
import { Sector } from '@/types';
import { useApi } from '@/contexts/ApiContextExtended';
import SectorGrid from '@/components/sectors/SectorGrid';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Relatorios() {
  const navigate = useNavigate();
  const { sectors, loading } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('completed');
  
  useEffect(() => {
    document.title = "Relatórios - Gestão de Recuperação";
  }, []);

  // Filter sectors based on status and search term
  const completedSectors = sectors.filter(sector => 
    sector.status === 'checado' && 
    (searchTerm === '' || sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const scrapSectors = sectors.filter(sector => 
    sector.status === 'sucateado' && 
    (searchTerm === '' || sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSectorSelect = (sector: Sector) => {
    navigate(`/relatorio/setor/${sector.id}`);
  };

  const handleCreateConsolidatedReport = () => {
    navigate('/relatorio/consolidado');
  };

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por TAG..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCreateConsolidatedReport}
              variant="default"
            >
              <FileText className="mr-2 h-4 w-4" />
              Relatório Consolidado
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Filter className="mr-2 h-5 w-5 text-blue-500" />
                Setores Recuperados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedSectors.length}</div>
              <p className="text-sm text-muted-foreground">Setores com recuperação finalizada</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                Setores Sucateados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{scrapSectors.length}</div>
              <p className="text-sm text-muted-foreground">Setores sem possibilidade de recuperação</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Download className="mr-2 h-5 w-5 text-green-500" />
                Relatórios Gerados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Relatórios consolidados gerados</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="completed" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="completed">
              Setores Recuperados ({completedSectors.length})
            </TabsTrigger>
            <TabsTrigger value="scrapped">
              Setores Sucateados ({scrapSectors.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="completed" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : completedSectors.length > 0 ? (
              <SectorGrid
                sectors={completedSectors}
                onSelect={handleSectorSelect}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Não há setores finalizados disponíveis para emissão de relatórios.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="scrapped" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : scrapSectors.length > 0 ? (
              <SectorGrid
                sectors={scrapSectors}
                onSelect={handleSectorSelect}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Não há setores sucateados disponíveis para emissão de relatórios.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayoutWrapper>
  );
}
