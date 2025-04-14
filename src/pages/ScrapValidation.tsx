
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

export default function ScrapValidation() {
  const { sectors, isLoading, refreshData } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const navigate = useNavigate();
  
  // Force refresh on first load
  useEffect(() => {
    document.title = "Validação de Sucateamento - Gestão de Recuperação";
    
    if (!hasRefreshed) {
      refreshData().then(() => setHasRefreshed(true));
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
  
  // Filtra setores apenas com status 'sucateadoPendente'
  const filteredSectors = sectors.filter(sector => {
    if (!sector) return false;
    
    // Aplica filtro de data se fornecido
    let dateMatch = true;
    if (startDate && endDate) {
      // Verificar se peritagemDate é uma string válida antes de tentar criar uma data
      if (!sector.peritagemDate) {
        return false;
      }

      try {
        const sectorDate = new Date(sector.peritagemDate);
        
        // Verificar se a data é válida
        if (!isValid(sectorDate)) {
          console.log("Data inválida:", sector.peritagemDate, "para setor:", sector.tagNumber);
          return false;
        }
        
        const start = parse(startDate, "yyyy-MM-dd", new Date());
        const end = parse(endDate, "yyyy-MM-dd", new Date());
        
        // Verificar se as datas de início e fim são válidas
        if (!isValid(start) || !isValid(end)) {
          return false;
        }
        
        dateMatch = isWithinInterval(sectorDate, { start, end });
      } catch (error) {
        console.error("Erro ao processar data:", error, sector.peritagemDate);
        return false;
      }
    } else if (startDate) {
      if (!sector.peritagemDate) {
        return false;
      }

      try {
        const sectorDate = new Date(sector.peritagemDate);
        
        // Verificar se a data é válida
        if (!isValid(sectorDate)) {
          console.log("Data inválida para filtro de data inicial:", sector.peritagemDate, "para setor:", sector.tagNumber);
          return false;
        }
        
        const start = parse(startDate, "yyyy-MM-dd", new Date());
        
        // Verificar se a data de início é válida
        if (!isValid(start)) {
          return false;
        }
        
        const formattedSectorDate = isValid(sectorDate) ? format(sectorDate, "yyyy-MM-dd") : "";
        
        dateMatch = isAfter(sectorDate, start) || formattedSectorDate === startDate;
      } catch (error) {
        console.error("Erro ao processar data de início:", error, sector.peritagemDate);
        return false;
      }
    } else if (endDate) {
      if (!sector.peritagemDate) {
        return false;
      }

      try {
        const sectorDate = new Date(sector.peritagemDate);
        
        // Verificar se a data é válida
        if (!isValid(sectorDate)) {
          console.log("Data inválida para filtro de data final:", sector.peritagemDate, "para setor:", sector.tagNumber);
          return false;
        }
        
        const end = parse(endDate, "yyyy-MM-dd", new Date());
        
        // Verificar se a data de fim é válida
        if (!isValid(end)) {
          return false;
        }
        
        const formattedSectorDate = isValid(sectorDate) ? format(sectorDate, "yyyy-MM-dd") : "";
        
        dateMatch = isBefore(sectorDate, end) || formattedSectorDate === endDate;
      } catch (error) {
        console.error("Erro ao processar data final:", error, sector.peritagemDate);
        return false;
      }
    }

    const matchesSearch = 
      sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sector.entryInvoice && sector.entryInvoice.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return sector.status === 'sucateadoPendente' && matchesSearch && dateMatch;
  });
  
  // Ordena setores pelo mais recente primeiro
  const sortedSectors = [...filteredSectors].sort((a, b) => {
    try {
      // Verificar se ambas as datas são válidas
      if (!a.peritagemDate || !b.peritagemDate) {
        return 0;
      }
      
      // Verificar se as strings de data são válidas antes de converter
      if (!a.peritagemDate.match(/^\d{4}-\d{2}-\d{2}/) || !b.peritagemDate.match(/^\d{4}-\d{2}-\d{2}/)) {
        return 0;
      }
      
      const dateA = new Date(a.peritagemDate);
      const dateB = new Date(b.peritagemDate);
      
      if (!isValid(dateA) || !isValid(dateB)) {
        console.log("Datas inválidas durante ordenação:", a.peritagemDate, b.peritagemDate);
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

  console.log('Setores filtrados para sucateamento pendente:', filteredSectors.length);

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="page-title">Validação de Sucateamento</h1>
        
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
            {sectors.some(s => s.status === 'sucateadoPendente') === false && (
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
