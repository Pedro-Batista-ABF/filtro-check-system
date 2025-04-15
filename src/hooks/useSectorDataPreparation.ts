
import { Sector, Photo, SectorStatus } from "@/types";

export function useSectorDataPreparation() {
  const prepareSectorData = (
    data: Partial<Sector>,
    isEditing: boolean,
    sectorId: string | undefined,
    status: SectorStatus,
    processedPhotos: Photo[],
    cycleCount: number
  ): Partial<Sector> => {
    const scrapPhotos = data.scrapPhotos || [];
    const beforePhotos = processedPhotos.filter(p => p.type === 'before');
    const afterPhotos = processedPhotos.filter(p => p.type === 'after');
    const scrapProcessedPhotos = processedPhotos.filter(p => p.type === 'scrap');
    const combinedScrapPhotos = [...scrapPhotos, ...scrapProcessedPhotos];
    
    return {
      ...data,
      id: isEditing ? sectorId : undefined,
      status,
      outcome: data.outcome || 'EmAndamento',
      cycleCount,
      productionCompleted: data.productionCompleted || false,
      beforePhotos,
      afterPhotos,
      scrapPhotos: combinedScrapPhotos,
      services: data.services?.map(service => ({
        ...service,
        photos: service.photos || []
      })) || [],
      updated_at: new Date().toISOString()
    };
  };

  return { prepareSectorData };
}
