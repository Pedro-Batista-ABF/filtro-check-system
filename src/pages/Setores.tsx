
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Trash2, Edit, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Setores() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Gerenciamento de Setores - Gestão de Recuperação';
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      
      // Fetch all sectors directly from Supabase
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      // Map the data to our Sector type
      const mappedSectors: Sector[] = data.map(sector => ({
        id: sector.id,
        tagNumber: sector.tag_number,
        tagPhotoUrl: sector.tag_photo_url,
        entryInvoice: sector.nf_entrada || '',
        entryDate: sector.data_entrada ? new Date(sector.data_entrada).toISOString().split('T')[0] : '',
        exitInvoice: sector.nf_saida || '',
        exitDate: sector.data_saida ? new Date(sector.data_saida).toISOString().split('T')[0] : '',
        status: sector.current_status as any,
        outcome: sector.current_outcome as any || 'EmAndamento',
        peritagemDate: '',  // Will be populated as needed
        productionCompleted: false,
        services: [],
        beforePhotos: [],
        afterPhotos: [],
        scrapPhotos: [],
        cycleCount: sector.cycle_count || 1,
        updated_at: sector.updated_at
      }));
      
      setSectors(mappedSectors);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      toast.error('Erro ao carregar setores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSector = async () => {
    try {
      if (!deletingSector) return;
      
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', deletingSector.id);
        
      if (error) throw error;
      
      // Remove from local state
      setSectors(sectors.filter(s => s.id !== deletingSector.id));
      toast.success('Setor excluído com sucesso');
      setIsDialogOpen(false);
      setDeletingSector(null);
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast.error('Erro ao excluir setor. Verifique se você tem permissão.');
    }
  };

  const confirmDelete = (sector: Sector) => {
    setDeletingSector(sector);
    setIsDialogOpen(true);
  };

  const editSector = (sector: Sector) => {
    // Navigate to edit based on status
    if (sector.status === 'peritagemPendente') {
      navigate(`/peritagem/${sector.id}`);
    } else if (sector.status === 'emExecucao') {
      navigate(`/execucao/${sector.id}`);
    } else if (sector.status === 'aguardandoChecagem') {
      navigate(`/checagem/${sector.id}`);
    } else if (sector.status === 'sucateadoPendente') {
      navigate(`/sucateamento/${sector.id}`);
    } else {
      navigate(`/setores/relatorio/${sector.id}`);
    }
  };

  const viewReport = (sector: Sector) => {
    navigate(`/setores/relatorio/${sector.id}`);
  };

  // Filter sectors
  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = 
      sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sector.entryInvoice && sector.entryInvoice.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter ? sector.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  // Get status display info
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'peritagemPendente': { label: 'Peritagem Pendente', color: 'bg-yellow-100 text-yellow-800' },
      'emExecucao': { label: 'Em Execução', color: 'bg-blue-100 text-blue-800' },
      'aguardandoChecagem': { label: 'Aguardando Checagem', color: 'bg-purple-100 text-purple-800' },
      'checagemCompleta': { label: 'Checagem Completa', color: 'bg-green-100 text-green-800' },
      'sucateadoPendente': { label: 'Aguardando Validação de Sucateamento', color: 'bg-red-100 text-red-800' },
      'sucateado': { label: 'Sucateado', color: 'bg-red-100 text-red-800' }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciamento de Setores</h1>
          <Button onClick={() => navigate('/peritagem/novo')}>
            Novo Setor
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por TAG ou NF"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="w-full md:w-64">
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="peritagemPendente">Peritagem Pendente</option>
                  <option value="emExecucao">Em Execução</option>
                  <option value="aguardandoChecagem">Aguardando Checagem</option>
                  <option value="checagemCompleta">Checagem Completa</option>
                  <option value="sucateadoPendente">Sucateamento Pendente</option>
                  <option value="sucateado">Sucateado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando setores...</p>
          </div>
        ) : filteredSectors.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              {searchTerm || statusFilter
                ? "Nenhum setor encontrado com esses critérios"
                : "Nenhum setor cadastrado"
              }
            </h2>
            {searchTerm || statusFilter ? (
              <Button variant="ghost" onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }} className="mt-2">
                Limpar filtros
              </Button>
            ) : (
              <p className="text-gray-500 mt-2">
                Clique em "Novo Setor" para adicionar um setor
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSectors.map((sector) => {
              const statusInfo = getStatusDisplay(sector.status);
              return (
                <Card key={sector.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-bold">TAG: {sector.tagNumber}</h2>
                        <p className="text-sm text-gray-500">
                          NF Entrada: {sector.entryInvoice || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Data Entrada: {sector.entryDate ? new Date(sector.entryDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => editSector(sector)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => viewReport(sector)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => confirmDelete(sector)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o setor com TAG {deletingSector?.tagNumber}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteSector}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
