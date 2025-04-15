
import React, { useState } from 'react';
import { Photo } from '@/types';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface SectorPhotosProps {
  photos: Photo[];
  title?: string;
  emptyMessage?: string;
}

export default function SectorPhotos({ 
  photos, 
  title = "Fotos", 
  emptyMessage = "Nenhuma foto disponível." 
}: SectorPhotosProps) {
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Agrupar fotos por serviceId
  const photosByService = photos.reduce<Record<string, Photo[]>>((acc, photo) => {
    const key = photo.serviceId || 'general';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(photo);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg">{title}</h3>
      
      {/* Foto Modal */}
      <Dialog>
        <DialogContent className="max-w-2xl">
          {selectedPhotoUrl && (
            <div className="flex justify-center">
              <img 
                src={selectedPhotoUrl} 
                alt="Foto ampliada" 
                className="max-h-[80vh] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                  target.className = "max-h-[80vh] object-contain bg-gray-100";
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Fotos gerais (sem serviceId) */}
      {photosByService['general'] && photosByService['general'].length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Fotos Gerais</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {photosByService['general'].map(photo => (
              <Dialog key={photo.id}>
                <DialogTrigger asChild>
                  <div 
                    className="border rounded-md overflow-hidden h-24 cursor-pointer hover:opacity-90"
                    onClick={() => setSelectedPhotoUrl(photo.url)}
                  >
                    <img 
                      src={photo.url} 
                      alt="Foto" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                        target.className = "w-full h-full object-contain bg-gray-100";
                      }}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <div className="flex justify-center">
                    <img 
                      src={photo.url} 
                      alt="Foto ampliada" 
                      className="max-h-[80vh] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                        target.className = "max-h-[80vh] object-contain bg-gray-100";
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      )}
      
      {/* Fotos por serviço */}
      {Object.entries(photosByService)
        .filter(([key]) => key !== 'general')
        .map(([serviceId, servicePhotos]) => (
          <div key={serviceId} className="space-y-2">
            <h4 className="font-medium">Fotos do Serviço {serviceId}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {servicePhotos.map(photo => (
                <Dialog key={photo.id}>
                  <DialogTrigger asChild>
                    <div 
                      className="border rounded-md overflow-hidden h-24 cursor-pointer hover:opacity-90"
                      onClick={() => setSelectedPhotoUrl(photo.url)}
                    >
                      <img 
                        src={photo.url} 
                        alt="Foto" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                          target.className = "w-full h-full object-contain bg-gray-100";
                        }}
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <div className="flex justify-center">
                      <img 
                        src={photo.url} 
                        alt="Foto ampliada" 
                        className="max-h-[80vh] object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                          target.className = "max-h-[80vh] object-contain bg-gray-100";
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
