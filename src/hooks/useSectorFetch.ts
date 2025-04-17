import { useState } from "react";
import { Sector } from "@/types";
import { toast } from "sonner";
import { useApi } from "@/contexts/api";

export function useSectorFetch(id?: string) {
  const [sector, setSector] = useState<Sector | null>(null);
  const { getSectorById } = useApi();

  const fetchSector = async () => {
    if (!id) return;
    try {
      const fetchedSector = await getSectorById(id);
      if (fetchedSector) {
        setSector(fetchedSector);
      } else {
        toast.error("Setor não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar setor:", error);
      toast.error("Erro ao buscar setor");
    }
  };

  return { sector, fetchSector };
}
