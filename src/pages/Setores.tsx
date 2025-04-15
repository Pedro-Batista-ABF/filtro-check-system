
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PenLine, Trash2, FileText } from 'lucide-react';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteSector } from '@/services/sectorService';

export default function Setores() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const { getAllSectors } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Gerenciamento de Setores - Gestão de Recuperação';
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      setLoading(true);
      const data = await getAllSectors();
      setSectors(data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      toast.error("Erro ao carregar setores");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSector = async (id: string) => {
    try {
      const result = await deleteSector(id);
      if (result) {
        toast.success("Setor excluído com sucesso");
        // Atualizar a lista de setores
        setSectors(sectors.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error("Erro ao excluir setor:", error);
      toast.error("Erro ao excluir setor");
    }
  };

  const filteredSectors = sectors
    .filter(sector => 
      statusFilter === 'todos' || sector.status === statusFilter
    )
    .filter(sector => 
      sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.entryInvoice?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Ordenar por data de atualização (mais recente primeiro)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  // Mapear status para exibição amigável
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'peritagemPendente': return 'Peritagem Pendente';
      case 'emExecucao': return 'Em Execução';
      case 'sucateadoPendente': return 'Sucateamento Pendente';
      case 'sucateado': return 'Sucateado';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };
  
  // Obter classe de cor para o status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'peritagemPendente': return 'bg-gray-100 text-gray-800';
      case 'emExecucao': return 'bg-blue-100 text-blue-800';
      case 'sucateadoPendente': return 'bg-red-100 text-red-800';
      case 'sucateado': return 'bg-red-100 text-red-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Gerenciamento de Setores</h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por TAG ou NF"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="peritagemPendente">Peritagem Pendente</SelectItem>
                <SelectItem value="emExecucao">Em Execução</SelectItem>
                <SelectItem value="sucateadoPendente">Sucateamento Pendente</SelectItem>
                <SelectItem value="sucateado">Sucateado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Carregando setores...</p>
          </div>
        ) : filteredSectors.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              {searchTerm || statusFilter !== 'todos' 
                ? "Nenhum setor encontrado com esses filtros" 
                : "Não há setores cadastrados"}
            </h2>
            {!searchTerm && statusFilter === 'todos' && (
              <p className="text-gray-500 mt-2">
                Registre um novo setor na página de peritagem.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSectors.map((sector) => (
              <Card key={sector.id} className="overflow-hidden">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-bold">TAG: {sector.tagNumber}</h2>
                      <p className="text-sm text-gray-500">
                        NF Entrada: {sector.entryInvoice || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Data: {sector.entryDate ? new Date(sector.entryDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <Badge className={getStatusColor(sector.status)}>
                      {getStatusDisplay(sector.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Serviços</p>
                        <p>{sector.services.filter(s => s.selected).length} serviço(s) registrado(s)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ciclo</p>
                        <p>{sector.cycleCount || 1}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Opções</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/setores/relatorio/${sector.id}`)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Relatório
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => {
                          if (sector.status === 'peritagemPendente') {
                            navigate(`/peritagem/${sector.id}`);
                          } else if (sector.status === 'emExecucao') {
                            navigate(`/execucao/${sector.id}`);
                          } else if (sector.status === 'sucateadoPendente') {
                            navigate(`/sucateamento/${sector.id}`);
                          }
                        }}>
                          <PenLine className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                              <span className="text-red-600">Excluir</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o setor TAG {sector.tagNumber}?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSector(sector.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
