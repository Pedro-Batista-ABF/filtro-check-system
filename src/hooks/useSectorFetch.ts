
import { Sector } from "@/types";
import { useState, useEffect } from "react";
import { useApi } from "@/contexts/ApiContextExtended";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

export function useSectorFetch(id?: string) {
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getSectorById } = useApi();
  const navigate = useNavigate();

  const fetchSector = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log(`Buscando setor com ID: ${id}`);
      const sectorData = await getSectorById(id);
      
      if (!sectorData) {
        console.error(`Setor com ID ${id} não encontrado`);
        toast.error("Setor não encontrado", {
          description: `O setor com ID ${id} não foi encontrado.`
        });
        navigate('/peritagem/novo', { replace: true });
        return;
      }

      console.log(`Setor carregado com sucesso: ${sectorData.tagNumber}`);
      setSector(sectorData);
    } catch (error) {
      console.error("Erro ao carregar setor:", error);
      setErrorMessage("Erro ao carregar dados do setor");
      toast.error("Erro ao carregar setor", {
        description: "Não foi possível carregar os dados do setor. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultSector = (services: any[]): Sector => ({
    id: '',
    tagNumber: '',
    tagPhotoUrl: '',
    entryInvoice: '',
    entryDate: '',
    peritagemDate: format(new Date(), 'yyyy-MM-dd'),
    services,
    beforePhotos: [],
    afterPhotos: [],
    scrapPhotos: [],
    productionCompleted: false,
    cycleCount: 1,
    status: 'peritagemPendente',
    outcome: 'EmAndamento',
    updated_at: new Date().toISOString()
  });

  return {
    sector,
    setSector,
    errorMessage,
    setErrorMessage,
    isLoading,
    fetchSector,
    getDefaultSector
  };
}
