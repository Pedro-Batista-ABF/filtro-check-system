
import { Sector } from "@/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TagPhotoProps {
  sector: Sector;
}

export default function TagPhoto({ sector }: TagPhotoProps) {
  const [tagPhotoUrl, setTagPhotoUrl] = useState<string | undefined>(sector.tagPhotoUrl);
  
  useEffect(() => {
    // Se não tiver foto da TAG no setor, tenta buscar no banco
    if (!sector.tagPhotoUrl) {
      const fetchTagPhoto = async () => {
        try {
          // Buscar ciclo atual
          const { data: cycleData } = await supabase
            .from('cycles')
            .select('id')
            .eq('sector_id', sector.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (cycleData) {
            // Buscar foto da TAG pelo tipo ou metadados
            const { data: photoData } = await supabase
              .from('photos')
              .select('*')
              .eq('cycle_id', cycleData.id)
              .or('type.eq.tag,and(metadata->>type.eq.tag)')
              .limit(1)
              .maybeSingle();
              
            if (photoData) {
              console.log("Foto da TAG encontrada:", photoData);
              setTagPhotoUrl(photoData.url);
            } else {
              console.log("Nenhuma foto de TAG encontrada para o ciclo", cycleData.id);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar foto da TAG:", error);
        }
      };
      
      fetchTagPhoto();
    }
  }, [sector.id, sector.tagPhotoUrl]);
  
  if (!tagPhotoUrl) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md border">
        <p className="text-gray-500">Nenhuma foto da TAG disponível</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md overflow-hidden border">
      <img 
        src={tagPhotoUrl} 
        alt={`TAG ${sector.tagNumber}`} 
        className="w-full h-48 object-cover"
      />
    </div>
  );
}
