
import React, { useEffect, useState } from 'react';
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Filter, Download } from 'lucide-react';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function Relatorio() {
  const { sectors, loading } = useApi();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filtrar setores concluídos (que podem ser incluídos em relatórios)
  const setoresConcluidos = sectors.filter(setor => setor.status === 'concluido');
  
  useEffect(() => {
    document.title = "Relatórios - Gestão de Recuperação";
  }, []);

  const setoresFiltrados = filtroStatus === 'todos'
    ? setoresConcluidos
    : setoresConcluidos.filter(setor => setor.status === filtroStatus);

  const handleToggleSetor = (setorId: string) => {
    setSelectedSectors(prev => 
      prev.includes(setorId) 
        ? prev.filter(id => id !== setorId) 
        : [...prev, setorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSectors.length === setoresFiltrados.length) {
      // Se todos já estão selecionados, desseleciona todos
      setSelectedSectors([]);
    } else {
      // Seleciona todos os setores filtrados
      setSelectedSectors(setoresFiltrados.map(setor => setor.id));
    }
  };

  const handleGenerateReport = () => {
    if (selectedSectors.length === 0) {
      alert('Selecione pelo menos um setor para gerar o relatório');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulação de geração de relatório
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Relatório gerado com ${selectedSectors.length} setores`);
    }, 1500);
  };

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <Button
            onClick={handleGenerateReport}
            disabled={selectedSectors.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <>Gerando...</>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório ({selectedSectors.length})
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-64">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filtroStatus}
                  onValueChange={setFiltroStatus}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="concluido">Concluídos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Setores Disponíveis</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedSectors.length === setoresFiltrados.length && setoresFiltrados.length > 0
                ? "Desselecionar Todos"
                : "Selecionar Todos"
              }
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <p>Carregando setores...</p>
              </div>
            ) : setoresFiltrados.length > 0 ? (
              <div className="space-y-4">
                {setoresFiltrados.map(setor => (
                  <div 
                    key={setor.id} 
                    className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleToggleSetor(setor.id)}
                  >
                    <Checkbox 
                      checked={selectedSectors.includes(setor.id)} 
                      onCheckedChange={() => handleToggleSetor(setor.id)}
                    />
                    <div>
                      <h3 className="font-medium">{setor.tagNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        NF: {setor.entryInvoice} • 
                        Data: {setor.entryDate ? new Date(setor.entryDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-muted-foreground">
                Nenhum setor disponível para relatório com os filtros selecionados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
