
import React from 'react';
import { Sector, Photo } from '@/types';
import PhotoViewer from '@/components/photos/PhotoViewer';

interface SectorPhotosProps {
  sector: Sector;
  title?: string;
}

export default function SectorPhotos({ sector, title = "Fotos do Setor" }: SectorPhotosProps) {
  // Combine all photos for display
  const allPhotos = [
    ...(sector.tagPhotoUrl ? [{ id: 'tag-photo', url: sector.tagPhotoUrl, type: 'tag' as const }] : []),
    ...(sector.beforePhotos || []),
    ...(sector.afterPhotos || [])
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">{title}</h3>
      {allPhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <PhotoViewer photos={allPhotos} />
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">Nenhuma foto disponível</p>
      )}
    </div>
  );
}
