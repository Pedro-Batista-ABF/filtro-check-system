
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Sector, Service, Cycle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhotoComparison from "@/components/sectors/PhotoComparison";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SectorReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Buscar setor ao carregar o componente
  useEffect(() => {
    const fetchSector = async () => {
      if (id) {
        const sectorData = await getSectorById(id);
        setSector(sectorData);
      }
      setLoading(false);
    };
    
    fetchSector();
  }, [id, getSectorById]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">Setor não encontrado</h1>
          <Button 
            onClick={() => navigate('/execucao')} 
            className="mt-4"
            variant="outline"
          >
            Voltar para Execução
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Service types organization
  const getServicesByType = (sector: Sector) => {
    const groupedServices = sector.services.reduce((groups, service) => {
      if (!service.selected) return groups;
      
      const type = service.type; // Mantendo o uso de 'type' 
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(service);
      return groups;
    }, {} as Record<string, typeof sector.services>);
    
    return groupedServices;
  };

  const servicesByType = getServicesByType(sector);

  return (
    <PageLayout>
      <div className="space-y-6 print:p-0">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/execucao')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">Relatório do Setor</h1>
          </div>
          
          <Button 
            onClick={handlePrint}
            className="flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Relatório
          </Button>
        </div>
        
        {/* Cabeçalho para impressão */}
        <div className="hidden print:block mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Relatório de Recuperação</h1>
            <p className="text-xl mb-1">Setor: {sector.tagNumber}</p>
            <p className="text-base text-gray-600">
              Data de geração: {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <Card className="shadow-sm border-l-4 border-l-blue-500 print:border-none print:shadow-none">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-4">Informações do Setor</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Tag:</strong> {sector.tagNumber}
              </div>
              <div>
                <strong>Nota Fiscal de Entrada:</strong> {sector.entryInvoice}
              </div>
              <div>
                <strong>Data de Entrada:</strong> {format(new Date(sector.entryDate), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
              <div>
                <strong>Status:</strong> {
                  sector.status === 'concluido' ? 'Concluído' : 
                  sector.status === 'sucateado' ? 'Sucateado' : 
                  sector.status === 'checagemFinalPendente' ? 'Checagem Pendente' : 
                  sector.status === 'emExecucao' ? 'Em Execução' : 
                  sector.status === 'peritagemPendente' ? 'Peritagem Pendente' : 
                  sector.status
                }
              </div>
              {sector.exitInvoice && (
                <div>
                  <strong>Nota Fiscal de Saída:</strong> {sector.exitInvoice}
                </div>
              )}
              {sector.exitDate && (
                <div>
                  <strong>Data de Saída:</strong> {format(new Date(sector.exitDate), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
              )}
            </div>
            
            {(sector.entryObservations || sector.exitObservations) && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Observações:</h3>
                {sector.entryObservations && (
                  <p><strong>Entrada:</strong> {sector.entryObservations}</p>
                )}
                {sector.exitObservations && (
                  <p><strong>Saída:</strong> {sector.exitObservations}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de serviços */}
        <Card className="print:border-none print:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Serviços Executados</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(servicesByType).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(servicesByType).map(([type, services]) => (
                  <div key={type} className="mb-4">
                    <h4 className="font-medium mb-2 bg-gray-100 p-2 rounded">
                      {type === 'lavagem' ? 'Lavagem' : 
                       type === 'pintura' ? 'Pintura' : 
                       type === 'troca_elemento' ? 'Troca de Elemento' : type}
                    </h4>
                    
                    <div className="space-y-2 pl-4">
                      {services.map(service => (
                        <div key={service.id} className="border-l-2 border-gray-300 pl-4">
                          <p className="text-sm">{service.name} {service.quantity && service.quantity > 1 ? `(${service.quantity})` : ''}</p>
                          {service.observations && (
                            <p className="text-xs text-gray-600 mt-1">Obs: {service.observations}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Nenhum serviço selecionado para este setor.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Fotos de Antes e Depois</h3>
          {Object.entries(servicesByType).map(([type, services]) => (
            <div key={type} className="mb-4">
              <h4 className="font-medium mb-2 bg-gray-100 p-2 rounded">
                {type === 'lavagem' ? 'Lavagem' : 
                 type === 'pintura' ? 'Pintura' : 
                 type === 'troca_elemento' ? 'Troca de Elemento' : type}
              </h4>
              
              <div className="space-y-4">
                {services.map(service => (
                  <PhotoComparison 
                    key={service.id} 
                    sector={sector} 
                    service={service} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {sector.cycles && sector.cycles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Ciclos de Recuperação</h3>
            {renderCycleTable(sector.cycles)}
          </div>
        )}

        {/* Assinaturas (apenas para impressão) */}
        <div className="hidden print:block mt-10">
          <div className="flex justify-between">
            <div className="w-1/3 border-t border-black pt-1 text-center">
              <p>Responsável pela Peritagem</p>
            </div>
            <div className="w-1/3 border-t border-black pt-1 text-center">
              <p>Responsável pela Execução</p>
            </div>
            <div className="w-1/3 border-t border-black pt-1 text-center">
              <p>Responsável pela Qualidade</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// Extraindo o rendering da tabela de ciclos
const renderCycleTable = (cycles: Cycle[]) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resultado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Observações
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Técnico
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cycles.map((cycle, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                {cycle.createdAt ? new Date(cycle.createdAt).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={
                  cycle.outcome === "recovered" ? "text-green-600" : 
                  cycle.outcome === "scrapped" ? "text-red-600" : 
                  "text-yellow-600"
                }>
                  {cycle.outcome === "recovered" ? "Recuperado" : 
                   cycle.outcome === "scrapped" ? "Sucateado" : 
                   "Pendente"}
                </span>
              </td>
              <td className="px-6 py-4">
                {cycle.comments || "Nenhuma observação"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {cycle.technicianId || "Não atribuído"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
