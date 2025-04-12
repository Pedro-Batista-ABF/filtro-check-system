
import PageLayout from "@/components/layout/PageLayout";
import { useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Sector } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format, parse, isAfter, isBefore, isWithinInterval } from "date-fns";

export default function Execucao() {
  const { sectors, loading } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Filter sectors by status, search term and date
  const filteredSectors = sectors.filter(sector => {
    // Apply date filter if dates are provided
    let dateMatch = true;
    if (startDate && endDate) {
      const sectorDate = new Date(sector.entryDate);
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      const end = parse(endDate, "yyyy-MM-dd", new Date());
      
      dateMatch = isWithinInterval(sectorDate, { start, end });
    } else if (startDate) {
      const sectorDate = new Date(sector.entryDate);
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      dateMatch = isAfter(sectorDate, start) || format(sectorDate, "yyyy-MM-dd") === startDate;
    } else if (endDate) {
      const sectorDate = new Date(sector.entryDate);
      const end = parse(endDate, "yyyy-MM-dd", new Date());
      dateMatch = isBefore(sectorDate, end) || format(sectorDate, "yyyy-MM-dd") === endDate;
    }

    const matchesSearch = 
      sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.entryInvoice.toLowerCase().includes(searchTerm.toLowerCase());
      
    return (sector.status === 'emExecucao' || 
           sector.status === 'checagemFinalPendente' || 
           sector.status === 'concluido') && matchesSearch && dateMatch;
  });
  
  // Sort sectors: emExecucao first, then most recent
  const sortedSectors = [...filteredSectors].sort((a, b) => {
    // First by status priority
    const statusPriority: Record<Sector['status'], number> = {
      'peritagemPendente': 3,
      'emExecucao': 0, // highest priority
      'checagemFinalPendente': 1,
      'concluido': 2,
    };
    
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // If both are in the same status, show incomplete production first
    if (a.status === 'emExecucao' && b.status === 'emExecucao') {
      if (a.productionCompleted !== b.productionCompleted) {
        return a.productionCompleted ? 1 : -1; // Non-completed first
      }
    }
    
    // Then by date (most recent first)
    return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="page-title">Execução de Setores</h1>
        
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
        
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">Carregando setores...</p>
          </div>
        ) : sortedSectors.length > 0 ? (
          <SectorGrid sectors={sortedSectors} />
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500">
              {searchTerm || startDate || endDate
                ? "Nenhum setor encontrado com os critérios de busca" 
                : "Nenhum setor em execução no momento"}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
