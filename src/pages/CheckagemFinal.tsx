
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import ConnectionStatus from '@/components/peritagem/ConnectionStatus';
import { useConnectionAuth } from '@/hooks/useConnectionAuth';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector } from '@/types';
import SectorGrid from '@/components/sectors/SectorGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function CheckagemFinal() {
  const navigate = useNavigate();
  const { connectionStatus, handleRetryConnection } = useConnectionAuth();
  const { getSectorsByStatus } = useApi();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = "Checagem Final - Gestão de Recuperação";
    
    const fetchSectors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Buscando setores em checagem final...");
        const emChecagemSectors = await getSectorsByStatus("emChecagem");
        
        if (emChecagemSectors && Array.isArray(emChecagemSectors)) {
          console.log(`Encontrados ${emChecagemSectors.length} setores em checagem final`);
          setSectors(emChecagemSectors);
        } else {
          console.error("Resultado inesperado ao buscar setores:", emChecagemSectors);
          setSectors([]);
        }
      } catch (error) {
        console.error("Erro ao buscar setores em checagem final:", error);
        setError("Falha ao carregar setores em checagem final");
        toast.error("Falha ao carregar setores em checagem final");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectors();
  }, [getSectorsByStatus]);
  
  const handleSectorSelect = (sector: Sector) => {
    navigate(`/checagem/${sector.id}`);
  };
  
  const HeaderExtra = (
    <ConnectionStatus 
      status={connectionStatus} 
      onRetryConnection={handleRetryConnection} 
      showDetails={true}
    />
  );
  
  return (
    <PageLayout HeaderExtra={HeaderExtra}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Checagem Final</h1>
          <Button variant="outline" onClick={() => navigate('/checagem')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-500">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
                >
                  Tentar novamente
                </button>
              </div>
            </CardContent>
          </Card>
        ) : sectors.length > 0 ? (
          <SectorGrid 
            sectors={sectors}
            onSelect={handleSectorSelect}
          />
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Nenhum setor em checagem final no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
