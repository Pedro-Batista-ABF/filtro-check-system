
import { useState } from "react";
import { Sector } from "@/types";
import { toast } from "sonner";
import { useApi } from "@/contexts/api";

export function useSectorFetch(id?: string) {
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { getSectorById } = useApi();

  const fetchSector = async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const fetchedSector = await getSectorById(id);
      if (fetchedSector) {
        setSector(fetchedSector);
      } else {
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
  };

  return { sector, fetchSector, loading, error };
}
