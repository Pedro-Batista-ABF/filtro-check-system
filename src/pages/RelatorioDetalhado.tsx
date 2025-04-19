
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useApi } from '@/contexts/ApiContextExtended';
import { toast } from 'sonner';
import { Sector } from '@/types';

export default function RelatorioDetalhado() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const { getSectorById } = useApi();
  
  useEffect(() => {
    async function loadSectorData() {
      if (!id) return;
      
      try {
        setLoading(true);
        const sectorData = await getSectorById(id);
        setSector(sectorData);
      } catch (error) {
        console.error("Erro ao carregar dados do setor:", error);
        toast.error("Falha ao carregar dados do relatório");
      } finally {
        setLoading(false);
      }
    }
    
    loadSectorData();
  }, [id, getSectorById]);
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!sector) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-500">Setor não encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                Não foi possível encontrar os dados do setor solicitado.
              </p>
              <Button 
                onClick={() => navigate('/relatorios')}
                className="w-full"
              >
                Voltar para Relatórios
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Relatório Detalhado - Setor {sector.tagNumber}</h1>
          <Button 
            onClick={() => navigate('/relatorios')}
            variant="outline"
          >
            Voltar
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações do Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">TAG</p>
                <p className="font-medium">{sector.tagNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NF de Entrada</p>
                <p className="font-medium">{sector.entryInvoice || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Entrada</p>
                <p className="font-medium">{sector.entryDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NF de Saída</p>
                <p className="font-medium">{sector.exitInvoice || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Saída</p>
                <p className="font-medium">{sector.exitDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{sector.status || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Executados</CardTitle>
            </CardHeader>
            <CardContent>
              {sector.services && sector.services.length > 0 ? (
                <ul className="space-y-2">
                  {sector.services.map((service) => (
                    <li key={service.id} className="p-2 border rounded">
                      <p className="font-medium">{service.name}</p>
                      {service.observations && (
                        <p className="text-sm text-muted-foreground">{service.observations}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nenhum serviço executado</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Observações de Entrada</p>
                  <p className="text-muted-foreground">
                    {sector.entryObservations || "Nenhuma observação registrada"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Observações de Saída</p>
                  <p className="text-muted-foreground">
                    {sector.exitObservations || "Nenhuma observação registrada"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Button>
          Gerar PDF do Relatório
        </Button>
      </div>
    </DashboardLayout>
  );
}
