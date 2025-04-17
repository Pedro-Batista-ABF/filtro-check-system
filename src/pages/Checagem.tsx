
import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContextExtended";
import { SectorStatus, Sector } from "@/types";
import { useNavigate } from "react-router-dom";
import SectorStatusCard from "@/components/sectors/SectorStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, isWithinInterval, parse } from "date-fns";

export default function Checagem() {
  const { sectors, loading } = useApi();
  const navigate = useNavigate();
  
  // Estado para os filtros
  const [tagFilter, setTagFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);
  
  // Aplicar filtros
  useEffect(() => {
    let result = [...sectors];
    
    // Filtrar por TAG
    if (tagFilter) {
      result = result.filter(sector => 
        sector.tagNumber.toLowerCase().includes(tagFilter.toLowerCase())
      );
    }
    
    // Filtrar por nota fiscal
    if (invoiceFilter) {
      result = result.filter(sector => 
        (sector.entryInvoice && sector.entryInvoice.toLowerCase().includes(invoiceFilter.toLowerCase())) ||
        (sector.exitInvoice && sector.exitInvoice.toLowerCase().includes(invoiceFilter.toLowerCase()))
      );
    }
    
    // Filtrar por intervalo de datas
    if (startDate && endDate) {
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      const end = parse(endDate, "yyyy-MM-dd", new Date());
      
      result = result.filter(sector => {
        const sectorDate = new Date(sector.entryDate);
        return isWithinInterval(sectorDate, { start, end });
      });
    } 
    // Filtrar apenas por data inicial
    else if (startDate) {
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      
      result = result.filter(sector => {
        const sectorDate = new Date(sector.entryDate);
        return isAfter(sectorDate, start) || format(sectorDate, "yyyy-MM-dd") === startDate;
      });
    } 
    // Filtrar apenas por data final
    else if (endDate) {
      const end = parse(endDate, "yyyy-MM-dd", new Date());
      
      result = result.filter(sector => {
        const sectorDate = new Date(sector.entryDate);
        return isBefore(sectorDate, end) || format(sectorDate, "yyyy-MM-dd") === endDate;
      });
    }
    
    // Filtrar por data específica (calendário único)
    if (dateFilter) {
      const filterDateStr = format(dateFilter, "yyyy-MM-dd");
      
      result = result.filter(sector => {
        const sectorDateStr = format(new Date(sector.entryDate), "yyyy-MM-dd");
        return sectorDateStr === filterDateStr;
      });
    }
    
    setFilteredSectors(result);
  }, [sectors, tagFilter, invoiceFilter, dateFilter, startDate, endDate]);
  
  // Calculate sector counts by status
  const statusCounts: Record<SectorStatus, number> = {
    peritagemPendente: filteredSectors.filter(s => s.status === 'peritagemPendente').length,
    emExecucao: filteredSectors.filter(s => s.status === 'emExecucao').length,
    checagemFinalPendente: filteredSectors.filter(s => s.status === 'checagemFinalPendente').length,
    concluido: filteredSectors.filter(s => s.status === 'concluido').length,
    sucateado: filteredSectors.filter(s => s.status === 'sucateado').length,
    sucateadoPendente: filteredSectors.filter(s => s.status === 'sucateadoPendente').length
  };

  const resetFilters = () => {
    setTagFilter("");
    setInvoiceFilter("");
    setDateFilter(undefined);
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    document.title = "Checagem - Gestão de Recuperação";
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Painel de Checagem Final
          </h1>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Filtros
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="h-8 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tagFilter">Filtrar por TAG</Label>
                  <Input
                    id="tagFilter"
                    placeholder="Digite o número da TAG..."
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceFilter">Filtrar por Nota Fiscal</Label>
                  <Input
                    id="invoiceFilter"
                    placeholder="Digite o número da NF..."
                    value={invoiceFilter}
                    onChange={(e) => setInvoiceFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFilter">Filtrar por Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dateFilter"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SectorStatusCard
              title="Pendentes de Checagem"
              status="checagemFinalPendente"
              count={statusCounts.checagemFinalPendente}
              onClick={() => navigate('/checagem-final')}
            />

            <SectorStatusCard
              title="Concluídos"
              status="concluido"
              count={statusCounts.concluido}
              onClick={() => navigate('/concluidos')}
            />

            <SectorStatusCard
              title="Sucateamento Pendente"
              status="sucateadoPendente"
              count={statusCounts.sucateadoPendente}
              onClick={() => navigate('/sucateamento')}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
