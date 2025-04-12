
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Link } from "react-router-dom";
import { Sector } from "@/types";
import { format, parse, isAfter, isBefore, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Peritagem() {
  const { sectors, loading } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Filter sectors that are pending peritagem or filterable by search
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
      
    return matchesSearch && dateMatch;
  });
  
  // Sort sectors by status and date (most recent first)
  const sortedSectors = [...filteredSectors].sort((a, b) => {
    // First by status priority
    const statusPriority: Record<Sector['status'], number> = {
      'peritagemPendente': 0,
      'emExecucao': 1,
      'checagemFinalPendente': 2,
      'concluido': 3,
    };
    
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by date (most recent first)
    return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="page-title">Peritagem de Setores</h1>
          <Button asChild>
            <Link to="/peritagem/novo" className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Setor
            </Link>
          </Button>
        </div>
        
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
                : "Nenhum setor cadastrado ainda"}
            </p>
            <Button asChild className="mt-4">
              <Link to="/peritagem/novo">
                <PlusCircle className="h-4 w-4 mr-2" />
                Cadastrar Novo Setor
              </Link>
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
