
import PageLayout from "@/components/layout/PageLayout";
import { useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Sector } from "@/types";

export default function Checagem() {
  const { sectors, loading } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter sectors that are pending checagem or already concluded
  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = 
      sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.entryInvoice.toLowerCase().includes(searchTerm.toLowerCase());
      
    return (sector.status === 'checagemFinalPendente' || 
            sector.status === 'concluido') && matchesSearch;
  });
  
  // Sort sectors: checagemFinalPendente first, then most recent
  const sortedSectors = [...filteredSectors].sort((a, b) => {
    // First by status priority (checagemFinalPendente first)
    const statusPriority: Record<Sector['status'], number> = {
      'peritagemPendente': 3,
      'emExecucao': 2,
      'checagemFinalPendente': 0, // highest priority 
      'concluido': 1,
    };
    
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by date (most recent first)
    return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="page-title">Checagem de Qualidade</h1>
        
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
                : "Nenhum setor pendente de checagem"}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
