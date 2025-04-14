
import PageLayout from "@/components/layout/PageLayout";
import { useState, useEffect } from "react";
import { useApi } from "@/contexts/ApiContextExtended";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Calendar, AlertTriangle } from "lucide-react";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Sector } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format, parse, isAfter, isBefore, isWithinInterval, isValid } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ScrapValidation() {
  const { sectors, isLoading, refreshData } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [pendingSectors, setPendingSectors] = useState<Sector[]>([]);
  const navigate = useNavigate();
  
  // Force refresh on first load and direct query to database
  useEffect(() => {
    document.title = "Validação de Sucateamento - Gestão de Recuperação";
    
    const fetchPendingSectors = async () => {
      try {
        console.log("Buscando setores com status sucateadoPendente diretamente do banco...");
        // Buscar diretamente do Supabase setores com status 'sucateadoPendente'
        const { data, error } = await supabase
          .from('sectors')
          .select('*')
          .eq('current_status', 'sucateadoPendente');
          
        if (error) {
          throw error;
        }
        
        console.log(`Busca direta: Encontrados ${data?.length || 0} setores com status sucateadoPendente`);
        
        // Mapear para o formato utilizado na aplicação
        if (data && data.length > 0) {
          const mappedSectors: Sector[] = data.map(sector => ({
            id: sector.id,
            tagNumber: sector.tag_number,
            tagPhotoUrl: sector.tag_photo_url,
            status: sector.current_status as any,
            outcome: sector.current_outcome as any || 'EmAndamento',
            cycleCount: sector.cycle_count || 1,
            services: [],
            beforePhotos: [],
            afterPhotos: [],
            scrapPhotos: [],
            entryInvoice: sector.nf_entrada || '',
            entryDate: sector.data_entrada ? new Date(sector.data_entrada).toISOString().split('T')[0] : '',
            peritagemDate: '',
            productionCompleted: false,
            updated_at: sector.updated_at
          }));
          
          setPendingSectors(mappedSectors);
        }
      } catch (fetchError) {
        console.error("Erro ao buscar setores pendentes diretamente:", fetchError);
      }
    };

    if (!hasRefreshed) {
      console.log("Atualizando dados via refreshData...");
      refreshData().then(() => {
        setHasRefreshed(true);
        // Depois de atualizar via API, tenta buscar diretamente do banco
        fetchPendingSectors();
      });
    } else {
      // Em carregamentos subsequentes, mantém a busca direta
      fetchPendingSectors();
    }
    
    // Diagnóstico
    console.log("Total de setores:", sectors.length);
    console.log("Setores com status sucateadoPendente:", 
      sectors.filter(s => s.status === 'sucateadoPendente').length);
    console.log("Status de todos os setores:", sectors.map(s => ({ 
      id: s.id, 
      tag: s.tagNumber, 
      status: s.status 
    })));
  }, [sectors, refreshData, hasRefreshed]);
  
  // Filtra setores para exibição
  const filteredSectors = [...pendingSectors, ...sectors.filter(sector => 
    sector && sector.status === 'sucateadoPendente'
  )].filter((sector, index, self) => 
    // Remover duplicados pelo ID
    index === self.findIndex(s => s.id === sector.id)
  ).filter(sector => {
    if (!sector) return false;
    
    // Aplica filtro de busca de texto
    const matchesSearch = 
      sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sector.entryInvoice && sector.entryInvoice.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Se não há filtro de data, retorna pelo texto
    if (!startDate && !endDate) {
      return matchesSearch;
    }
    
    // Verifica se há data válida no setor para filtrar
    if (!sector.peritagemDate && !sector.entryDate) {
      return false;
    }
    
    // Tenta usar peritagemDate ou entryDate para o filtro
    const dateToFilter = sector.peritagemDate || sector.entryDate;
    
    try {
      const sectorDate = new Date(dateToFilter);
      
      // Verificar se a data é válida
      if (!isValid(sectorDate)) {
        console.log("Data inválida:", dateToFilter, "para setor:", sector.tagNumber);
        return matchesSearch; // Inclui mesmo com data inválida se o texto corresponder
      }
      
      let dateMatch = true;
      
      if (startDate && endDate) {
        const start = parse(startDate, "yyyy-MM-dd", new Date());
        const end = parse(endDate, "yyyy-MM-dd", new Date());
        
        // Verificar se as datas de início e fim são válidas
        if (!isValid(start) || !isValid(end)) {
          return matchesSearch;
        }
        
        dateMatch = isWithinInterval(sectorDate, { start, end });
      } else if (startDate) {
        const start = parse(startDate, "yyyy-MM-dd", new Date());
        
        // Verificar se a data de início é válida
        if (!isValid(start)) {
          return matchesSearch;
        }
        
        dateMatch = isAfter(sectorDate, start) || format(sectorDate, "yyyy-MM-dd") === startDate;
      } else if (endDate) {
        const end = parse(endDate, "yyyy-MM-dd", new Date());
        
        // Verificar se a data de fim é válida
        if (!isValid(end)) {
          return matchesSearch;
        }
        
        dateMatch = isBefore(sectorDate, end) || format(sectorDate, "yyyy-MM-dd") === endDate;
      }
      
      return matchesSearch && dateMatch;
    } catch (error) {
      console.error("Erro ao processar data para filtro:", error);
      return matchesSearch; // Inclui mesmo com erro se o texto corresponder
    }
  });
  
  // Ordena setores pelo mais recente primeiro
  const sortedSectors = [...filteredSectors].sort((a, b) => {
    try {
      // Usar o campo updated_at para ordenação, se disponível
      const dateA = a.updated_at ? new Date(a.updated_at) : 
                   a.peritagemDate ? new Date(a.peritagemDate) : 
                   a.entryDate ? new Date(a.entryDate) : new Date(0);
                   
      const dateB = b.updated_at ? new Date(b.updated_at) : 
                   b.peritagemDate ? new Date(b.peritagemDate) : 
                   b.entryDate ? new Date(b.entryDate) : new Date(0);
      
      if (!isValid(dateA) || !isValid(dateB)) {
        return 0;
      }
      
      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.error("Erro ao ordenar datas:", error);
      return 0;
    }
  });

  const handleSelectSector = (sector: Sector) => {
    navigate(`/sucateamento/${sector.id}`);
  };

  const handleRefresh = async () => {
    toast.info("Recarregando dados...");
    await refreshData();
    setHasRefreshed(false); // Força nova busca direta
  };

  // Adicionar diagnóstico para debug
  useEffect(() => {
    console.log('Total de setores no estado:', sectors.length);
    console.log('Setores com status sucateadoPendente:', sectors.filter(s => s.status === 'sucateadoPendente').length);
    console.log('Setores pendentes buscados diretamente:', pendingSectors.length);
    console.log('Setores filtrados para exibição:', filteredSectors.length);
  }, [sectors, filteredSectors, pendingSectors]);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Validação de Sucateamento</h1>
          <button 
            onClick={handleRefresh} 
            className="text-sm text-blue-500 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50"
          >
            Atualizar Dados
          </button>
        </div>
        
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Setores Aguardando Validação de Sucateamento</AlertTitle>
          <AlertDescription>
            Nesta página, você pode validar os setores marcados como sucateados durante a peritagem.
            A validação é obrigatória para registrar a devolução do setor ao cliente.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <div className="flex mt-1">
                  <Calendar className="h-4 w-4 mr-2 mt-3 text-gray-500" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <div className="flex mt-1">
                  <Calendar className="h-4 w-4 mr-2 mt-3 text-gray-500" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="md:col-span-3">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    id="search"
                    placeholder="Buscar por tag ou nota fiscal..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">Carregando setores...</p>
          </div>
        ) : sortedSectors.length > 0 ? (
          <SectorGrid 
            sectors={sortedSectors} 
            onSelect={handleSelectSector}
          />
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500">
              {searchTerm || startDate || endDate
                ? "Nenhum setor encontrado com os critérios de busca" 
                : "Nenhum setor aguardando validação de sucateamento"}
            </p>
            {sectors.length > 0 && (
              <button 
                onClick={() => {
                  toast.info("Diagnóstico", {
                    description: `Total: ${sectors.length} setores. Estados encontrados: ${
                      Object.entries(
                        sectors.reduce((acc, s) => {
                          acc[s.status] = (acc[s.status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([k, v]) => `${k}:${v}`).join(', ')
                    }`
                  });
                }}
                className="text-xs text-blue-500 mt-2 underline"
              >
                Mostrar diagnóstico
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
