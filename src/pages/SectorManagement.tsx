
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Filter, 
  Plus, 
  Search, 
  Pencil, 
  Trash, 
  MoreVertical, 
  AlertTriangle, 
  Loader2,
  FileText
} from "lucide-react";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector } from "@/types";
import { toast } from "sonner";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';

export default function SectorManagement() {
  const navigate = useNavigate();
  const { sectors, refreshData } = useApi();
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.title = "Gerenciamento de Setores - Gestão de Recuperação";
    
    const loadData = async () => {
      try {
        setLoading(true);
        await refreshData();
      } catch (error) {
        console.error("Error loading sectors:", error);
        toast.error("Erro ao carregar setores");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [refreshData]);

  useEffect(() => {
    // Filter sectors based on search term and status filter
    let filtered = [...sectors];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sector => 
        sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sector.entryInvoice && sector.entryInvoice.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(sector => sector.status === statusFilter);
    }
    
    setFilteredSectors(filtered);
  }, [sectors, searchTerm, statusFilter]);

  const handleDeleteSector = async () => {
    if (!sectorToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Delete sector from Supabase directly
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sectorToDelete.id);
        
      if (error) {
        console.error("Error deleting sector:", error);
        throw error;
      }
      
      // Refresh data to update the list
      await refreshData();
      
      toast.success("Setor excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting sector:", error);
      toast.error("Erro ao excluir setor. Verifique se você tem permissão.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSectorToDelete(null);
    }
  };

  // Map status to readable text and badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'peritagemPendente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Peritagem Pendente</Badge>;
      case 'emExecucao':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Em Execução</Badge>;
      case 'checagemFinalPendente':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Checagem Pendente</Badge>;
      case 'concluido':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Concluído</Badge>;
      case 'sucateadoPendente':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Sucateamento Pendente</Badge>;
      case 'sucateado':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Sucateado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="page-title">Gerenciamento de Setores</h1>
          <Button onClick={() => navigate('/peritagem/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Setor
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre os setores por TAG, NF ou status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por TAG ou NF..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    {statusFilter ? `Filtro: ${statusFilter}` : "Filtrar por Status"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('peritagemPendente')}>
                    Peritagem Pendente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('emExecucao')}>
                    Em Execução
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('checagemFinalPendente')}>
                    Checagem Pendente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('concluido')}>
                    Concluído
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('sucateadoPendente')}>
                    Sucateamento Pendente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('sucateado')}>
                    Sucateado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Setores</CardTitle>
            <CardDescription>
              Total: {filteredSectors.length} setores
              {statusFilter && ` com status "${statusFilter}"`}
              {searchTerm && ` contendo "${searchTerm}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="ml-2">Carregando setores...</p>
              </div>
            ) : filteredSectors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum setor encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TAG</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>NF Entrada</TableHead>
                      <TableHead>Data Entrada</TableHead>
                      <TableHead>NF Saída</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSectors.map((sector) => (
                      <TableRow key={sector.id}>
                        <TableCell className="font-medium">{sector.tagNumber}</TableCell>
                        <TableCell>{getStatusBadge(sector.status)}</TableCell>
                        <TableCell>{sector.entryInvoice || "-"}</TableCell>
                        <TableCell>{formatDate(sector.entryDate)}</TableCell>
                        <TableCell>{sector.exitInvoice || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => navigate(`/relatorio/${sector.id}`)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => {
                                // Navigate to appropriate edit based on status
                                switch (sector.status) {
                                  case 'peritagemPendente':
                                    navigate(`/peritagem/${sector.id}`);
                                    break;
                                  case 'emExecucao':
                                    navigate(`/execucao/${sector.id}`);
                                    break;
                                  case 'checagemFinalPendente':
                                    navigate(`/checagem/${sector.id}`);
                                    break;
                                  default:
                                    navigate(`/peritagem/${sector.id}`);
                                }
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSectorToDelete(sector);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Excluir Setor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o setor com TAG "{sectorToDelete?.tagNumber}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Atenção!</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      A exclusão removerá permanentemente todos os dados associados a este setor, 
                      incluindo fotos, serviços e histórico de ciclos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSector}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir Permanentemente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
