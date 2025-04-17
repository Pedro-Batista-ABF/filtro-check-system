
import { useState, useCallback } from "react";
import { Sector } from "@/types";
import { toast } from "sonner";
import { useApi } from "@/contexts/api";

export function useSectorFetch(id?: string) {
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { getSectorById } = useApi();

  const fetchSector = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    try {
      console.log(`Buscando setor com ID: ${id}`);
      const fetchedSector = await getSectorById(id);
      
      if (fetchedSector) {
        console.log("Setor encontrado:", fetchedSector);
        setSector(fetchedSector);
      } else {
        console.error("Setor não encontrado para o ID:", id);
        setError(true);
        toast.error("Setor não encontrado");
      }
    } catch (err) {
      console.error("Erro ao buscar setor:", err);
      setError(true);
      toast.error("Erro ao buscar setor");
    } finally {
      setLoading(false);
    }
  }, [id, getSectorById]);

  return { sector, fetchSector, loading, error };
}
