
import React from 'react';
import { Service, Photo } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ServicePhotosListProps {
  services: Service[];
  photos: Photo[];
}

export default function ServicePhotosList({ services, photos }: ServicePhotosListProps) {
  // Filtrar apenas serviços selecionados
  const selectedServices = services.filter(service => service.selected);
  
  if (selectedServices.length === 0 || photos.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Nenhuma foto disponível para comparação.</p>
      </div>
    );
  }
  
  // Agrupar fotos por serviço
  const servicePhotos: Record<string, { before: Photo[], after: Photo[] }> = {};
  
  selectedServices.forEach(service => {
    servicePhotos[service.id] = { before: [], after: [] };
  });
  
  // Classificar fotos por serviço e tipo
  photos.forEach(photo => {
    if (photo.serviceId && servicePhotos[photo.serviceId]) {
      if (photo.type === 'before') {
        servicePhotos[photo.serviceId].before.push(photo);
      } else if (photo.type === 'after') {
        servicePhotos[photo.serviceId].after.push(photo);
      }
    }
  });
  
  return (
    <div className="space-y-8">
      {selectedServices.map(service => {
        const serviceName = service.name;
        const beforePhotos = servicePhotos[service.id]?.before || [];
        const afterPhotos = servicePhotos[service.id]?.after || [];
        
        if (beforePhotos.length === 0 && afterPhotos.length === 0) {
          return null;
        }
        
        return (
          <div key={service.id} className="border-b pb-8">
            <h3 className="font-medium text-lg mb-4">{serviceName}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PhotoSection title="Antes" photos={beforePhotos} />
              <PhotoSection title="Depois" photos={afterPhotos} />
            </div>
          </div>
        );
      })}
      
      {/* Fotos gerais que não estão associadas a serviços específicos */}
      <GeneralPhotos photos={photos.filter(photo => !photo.serviceId)} />
    </div>
  );
}

interface PhotoSectionProps {
  title: string;
  photos: Photo[];
}

function PhotoSection({ title, photos }: PhotoSectionProps) {
  if (photos.length === 0) {
    return (
      <div>
        <h4 className="font-medium mb-2">{title}</h4>
        <p className="text-gray-400 text-sm">Nenhuma foto disponível</p>
      </div>
    );
  }
  
  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="overflow-hidden rounded border border-gray-200">
            <AspectRatio ratio={4 / 3}>
              <img
                src={photo.url}
                alt={`Foto ${title.toLowerCase()}`}
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GeneralPhotosProps {
  photos: Photo[];
}

function GeneralPhotos({ photos }: GeneralPhotosProps) {
  if (photos.length === 0) {
    return null;
  }
  
  // Separar fotos por tipo
  const beforePhotos = photos.filter(photo => photo.type === 'before');
  const afterPhotos = photos.filter(photo => photo.type === 'after');
  const tagPhotos = photos.filter(photo => photo.type === 'tag');
  
  if (beforePhotos.length === 0 && afterPhotos.length === 0 && tagPhotos.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h3 className="font-medium text-lg mb-4">Fotos Gerais</h3>
      
      {tagPhotos.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Fotos da TAG</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tagPhotos.map(photo => (
              <div key={photo.id} className="overflow-hidden rounded border border-gray-200">
                <AspectRatio ratio={4 / 3}>
                  <img
                    src={photo.url}
                    alt="Foto da TAG"
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {beforePhotos.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Fotos Antes (Geral)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {beforePhotos.map(photo => (
                <div key={photo.id} className="overflow-hidden rounded border border-gray-200">
                  <AspectRatio ratio={4 / 3}>
                    <img
                      src={photo.url}
                      alt="Foto antes"
                      className="h-full w-full object-cover"
                    />
                  </AspectRatio>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {afterPhotos.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Fotos Depois (Geral)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {afterPhotos.map(photo => (
                <div key={photo.id} className="overflow-hidden rounded border border-gray-200">
                  <AspectRatio ratio={4 / 3}>
                    <img
                      src={photo.url}
                      alt="Foto depois"
                      className="h-full w-full object-cover"
                    />
                  </AspectRatio>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
