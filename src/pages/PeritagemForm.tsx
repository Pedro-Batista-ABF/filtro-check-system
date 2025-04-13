
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector, Service } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, addSector, updateSector, getDefaultServices } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Buscar dados ao carregar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar lista de serviços
        const defaultServices = await getDefaultServices();
        setServices(defaultServices);
        
        // Se tem ID, buscar o setor
        if (id) {
          const sectorData = await getSectorById(id);
          setSector(sectorData);
          
          if (!sectorData) {
            console.warn(`Setor com ID ${id} não encontrado.`);
            navigate('/peritagem/novo', { replace: true });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, getSectorById, navigate, getDefaultServices]);
  
  const isEditing = !!sector;

  if (loading) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold">Carregando...</h1>
      </div>
    );
  }

  const handleSubmit = async (data: Partial<Sector>) => {
    try {
      if (isEditing && sector) {
        await updateSector(sector.id, data);
      } else {
        await addSector(data as Omit<Sector, 'id'>);
      }
      navigate('/peritagem');
    } catch (error) {
      console.error('Error saving sector:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-2 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/peritagem')}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">
          {isEditing ? 'Editar Peritagem' : 'Nova Peritagem'}
        </h1>
      </div>
      
      <Card className="border-none shadow-lg">
        <div className="p-6">
          <SectorForm 
            sector={sector}
            services={services}
            onSubmit={handleSubmit}
            formType="entry"
          />
        </div>
      </Card>
    </div>
  );
}
