
import PageLayout from "@/components/layout/PageLayout";
import { useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Printer, Mail, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sector } from "@/types";
import { format, parse, isAfter, isBefore, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ConsolidatedReport() {
  const { sectors } = useApi();
  const navigate = useNavigate();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Filter sectors that are fully completed with quality check
  const completedSectors = sectors.filter(sector => {
    const isFullyCompleted = sector.status === 'concluido';
    
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
    
    // Apply status filter if provided
    let statusMatch = true;
    if (statusFilter && statusFilter !== "all") {
      statusMatch = sector.status === statusFilter;
    }
    
    // Apply search filter if provided
    let searchMatch = true;
    if (searchTerm) {
      searchMatch = 
        sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sector.entryInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sector.exitInvoice && sector.exitInvoice.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return isFullyCompleted && dateMatch && statusMatch && searchMatch;
  });

  const toggleSectorSelection = (sectorId: string) => {
    setSelectedSectors(prev => 
      prev.includes(sectorId)
        ? prev.filter(id => id !== sectorId)
        : [...prev, sectorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSectors.length === completedSectors.length) {
      setSelectedSectors([]);
    } else {
      setSelectedSectors(completedSectors.map(sector => sector.id));
    }
  };

  const handleGenerateReport = () => {
    if (selectedSectors.length === 0) {
      toast.error("Selecione pelo menos um setor para gerar o relatório");
      return;
    }
    
    // Navigate to the preview page with selected sector IDs
    navigate(`/relatorio-preview?sectors=${selectedSectors.join(',')}`);
  };

  const handleEmailReport = () => {
    if (selectedSectors.length === 0) {
      toast.error("Selecione pelo menos um setor para enviar o relatório");
      return;
    }
    
    toast.success(`Relatório enviado por e-mail com ${selectedSectors.length} setores`);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">Relatório Consolidado</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleEmailReport}
              className="flex items-center"
              disabled={selectedSectors.length === 0}
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar por E-mail
            </Button>
            <Button 
              onClick={handleGenerateReport}
              className="flex items-center"
              disabled={selectedSectors.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
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
              
              <div>
                <Label htmlFor="statusFilter">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-3">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Buscar por tag ou nota fiscal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Setores com Checagem Concluída</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="selectAll" 
                checked={selectedSectors.length === completedSectors.length && completedSectors.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="selectAll" className="text-sm">Selecionar Todos</Label>
            </div>
          </CardHeader>
          <CardContent>
            {completedSectors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum setor com checagem concluída encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedSectors.map((sector) => (
                  <div 
                    key={sector.id} 
                    className={`p-4 border rounded-lg flex items-center justify-between ${
                      selectedSectors.includes(sector.id) ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => toggleSectorSelection(sector.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={selectedSectors.includes(sector.id)}
                        onCheckedChange={() => toggleSectorSelection(sector.id)}
                        id={`sector-${sector.id}`}
                      />
                      <div>
                        <Label 
                          htmlFor={`sector-${sector.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          TAG: {sector.tagNumber}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(sector.entryDate), "dd/MM/yyyy", { locale: ptBR })}
                          {sector.exitDate ? ` - ${format(new Date(sector.exitDate), "dd/MM/yyyy", { locale: ptBR })}` : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Concluído
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
