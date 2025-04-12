import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Sector, Service, Cycle } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import PhotoComparison from "@/components/sectors/PhotoComparison";

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
      <div className="space-y-6">
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
        
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-4">Informações do Setor</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Tag:</strong> {sector.tagNumber}
              </div>
              <div>
                <strong>Nota Fiscal:</strong> {sector.entryInvoice}
              </div>
              <div>
                <strong>Data de Entrada:</strong> {sector.entryDate}
              </div>
              <div>
                <strong>Status:</strong> {sector.status}
              </div>
            </div>
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
              
              <div className="space-y-2 pl-4">
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
      </div>
    </PageLayout>
  );
}

// Helper function to group services by type
function getServicesByType(sector: Sector) {
  const groupedServices = sector.services.reduce((groups, service) => {
    const type = service.type; // Mantendo o uso de 'type'
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(service);
    return groups;
  }, {} as Record<string, typeof sector.services>);
  
  return groupedServices;
}

// Vamos corrigir as comparações que estão causando erros TS2367
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
                {/* Substituindo comparações de string literal por string indexada */}
                <span className={cycle.outcome === "recovered" ? "text-green-600" : cycle.outcome === "scrapped" ? "text-red-600" : "text-yellow-600"}>
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

// Corrigindo o serviço para usar 'type' em vez de tipos inexistentes
const ServiceDetails = ({ service }: { service: Service }) => {
  return (
    <div className="service-details">
      <h3 className="font-medium">{service.name}</h3>
      <p className="text-sm text-gray-500">Tipo: {service.type}</p>
      {/* Adicione aqui outros detalhes do serviço que você queira exibir */}
    </div>
  );
};
