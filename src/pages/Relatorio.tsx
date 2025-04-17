
import { useEffect, useState } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, AlertCircle, Download } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const Relatorio = () => {
  const { sectors, loading } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.title = "Relatórios - Gestão de Recuperação";
  }, []);

  // Filtrar setores concluídos
  const completedSectors = sectors.filter(
    (sector) => 
      sector.status === "concluido" && 
      (searchTerm === "" || sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectSector = (sectorId: string) => {
    if (selectedSectors.includes(sectorId)) {
      setSelectedSectors(selectedSectors.filter(id => id !== sectorId));
    } else {
      setSelectedSectors([...selectedSectors, sectorId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSectors.length === completedSectors.length) {
      setSelectedSectors([]);
    } else {
      setSelectedSectors(completedSectors.map(sector => sector.id));
    }
  };

  const handleGenerateReport = async () => {
    if (selectedSectors.length === 0) {
      alert("Selecione pelo menos um setor para gerar o relatório");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulação da geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert("Esta funcionalidade de geração de relatório está em implementação.");
      
      setIsGenerating(false);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setIsGenerating(false);
    }
  };

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por TAG..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="select-all"
              checked={selectedSectors.length === completedSectors.length && completedSectors.length > 0}
              onCheckedChange={handleSelectAll}
              disabled={completedSectors.length === 0}
            />
            <Label htmlFor="select-all">
              Selecionar todos ({completedSectors.length})
            </Label>
          </div>
          
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating || selectedSectors.length === 0}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                Gerando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : completedSectors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedSectors.map((sector) => (
              <Card 
                key={sector.id} 
                className={`cursor-pointer transition-colors ${
                  selectedSectors.includes(sector.id) ? "border-primary" : ""
                }`}
                onClick={() => handleSelectSector(sector.id)}
              >
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Checkbox 
                        className="mr-2"
                        checked={selectedSectors.includes(sector.id)}
                        onCheckedChange={() => handleSelectSector(sector.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      TAG: {sector.tagNumber}
                    </CardTitle>
                    <CardDescription>
                      NF Entrada: {sector.entryInvoice || "N/A"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Entrada:</span>{" "}
                        {sector.entryDate
                          ? format(new Date(sector.entryDate), "dd/MM/yyyy", { locale: pt })
                          : "N/A"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Saída:</span>{" "}
                        {sector.exitDate
                          ? format(new Date(sector.exitDate), "dd/MM/yyyy", { locale: pt })
                          : "N/A"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">NF Saída:</span>{" "}
                        {sector.exitInvoice || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                Nenhum setor concluído encontrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Não há setores concluídos para gerar relatórios ou sua busca não retornou resultados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayoutWrapper>
  );
};

export default Relatorio;
