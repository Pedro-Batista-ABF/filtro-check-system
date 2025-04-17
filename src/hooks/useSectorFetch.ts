
import { Sector } from "@/types";
import { useState } from "react";
import { useApi } from "@/contexts/ApiContextExtended";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

export function useSectorFetch(id?: string) {
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getSectorById } = useApi();
  const navigate = useNavigate();

  const fetchSector = async () => {
    if (!id) return;

    try {
      const sectorData = await getSectorById(id);
      if (!sectorData) {
        toast.error("Setor não encontrado", {
          description: `O setor com ID ${id} não foi encontrado.`
        });
        navigate('/peritagem/novo', { replace: true });
        return;
      }

      setSector(sectorData);
    } catch (error) {
      console.error("Error fetching sector:", error);
      setErrorMessage("Erro ao carregar dados do setor");
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
    fetchSector,
    getDefaultSector
  };
}
