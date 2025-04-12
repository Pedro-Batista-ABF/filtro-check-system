
import React from 'react';
import { Sector } from '@/types';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from '@/contexts/ApiContextExtended';
import PhotoComparison from '@/components/sectors/PhotoComparison';

const ReportPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [sector, setSector] = React.useState<Sector | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
            onClick={() => navigate('/relatorio')}
            className="mt-4"
            variant="outline"
          >
            Voltar para Relatórios
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Service types organization
  const getServicesByType = (sector: Sector) => {
    const groupedServices = sector.services.reduce((groups, service) => {
      const type = service.type;
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
            onClick={() => navigate('/relatorio')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">Relatório Consolidado</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sector Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Detalhes do Setor</h3>
            <p><strong>Tag:</strong> {sector.tagNumber}</p>
            <p><strong>Nota Fiscal:</strong> {sector.entryInvoice}</p>
            <p><strong>Data de Entrada:</strong> {sector.entryDate}</p>
            <p><strong>Status:</strong> {sector.status}</p>
            {sector.comments && <p><strong>Comentários:</strong> {sector.comments}</p>}
          </div>

          {/* Cycle Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações do Ciclo</h3>
            {sector.cycles && sector.cycles.length > 0 ? (
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
                    {sector.cycles.map((cycle, index) => (
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
            ) : (
              <p>Nenhum ciclo registrado para este setor.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Serviços Executados</h3>
          
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
                    <p className="text-sm">{service.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Photo Comparisons */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Comparativo de Fotos</h3>
          {sector.services.map(service => (
            <PhotoComparison 
              key={service.id} 
              sector={sector} 
              service={service} 
              sectorId={sector.id}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ReportPreview;
