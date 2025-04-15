
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Sucateamento() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { getAllSectors } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sucateamento Pendente - Gestão de Recuperação';
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      setLoading(true);
      const allSectors = await getAllSectors();
      
      // Filtrar apenas os setores com status "sucateadoPendente"
      const pendingSectors = allSectors.filter(
        sector => sector.status === 'sucateadoPendente'
      );
      
      console.log(`Encontrados ${pendingSectors.length} setores pendentes de sucateamento`);
      setSectors(pendingSectors);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      toast.error("Erro ao carregar setores");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateSector = (id: string) => {
    navigate(`/sucateamento/${id}`);
  };

  const filteredSectors = searchTerm
    ? sectors.filter(sector => 
        sector.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sector.entryInvoice?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sectors;

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Validação de Sucateamento</h1>
          
          <div className="relative w-full sm:w-auto max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por TAG ou NF"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Carregando setores...</p>
          </div>
        ) : filteredSectors.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              {searchTerm 
                ? "Nenhum setor encontrado com esses termos" 
                : "Não há setores pendentes de validação de sucateamento"}
            </h2>
            {!searchTerm && (
              <p className="text-gray-500 mt-2">
                Quando um setor for marcado para sucateamento, ele aparecerá aqui para validação.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSectors.map((sector) => (
              <Card key={sector.id} className="overflow-hidden border border-red-200">
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
                    <div className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium">
                      Sucateamento Pendente
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => handleValidateSector(sector.id)}
                    >
                      Validar Sucateamento
                    </Button>
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
