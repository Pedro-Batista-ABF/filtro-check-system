
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Link } from "react-router-dom";
import { Sector } from "@/types";

export default function Peritagem() {
  const { sectors, loading } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter sectors that are pending peritagem or filterable by search
  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = 
      sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.entryInvoice.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesSearch;
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
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Buscar por tag ou nota fiscal..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">Carregando setores...</p>
          </div>
        ) : sortedSectors.length > 0 ? (
          <SectorGrid sectors={sortedSectors} />
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500">
              {searchTerm 
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
