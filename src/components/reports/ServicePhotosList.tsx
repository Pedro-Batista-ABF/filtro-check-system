
import React from 'react';
import { Sector, Photo } from '@/types';

interface ServicePhotosListProps {
  sector: Sector;
}

export default function ServicePhotosList({ sector }: ServicePhotosListProps) {
  const beforePhotos = sector.beforePhotos || [];
  const afterPhotos = sector.afterPhotos || [];
  
  // Group photos by service ID
  const serviceIds = new Set<string>();
  
  // Find all service IDs that have photos
  beforePhotos.forEach(photo => {
    if (photo.serviceId) serviceIds.add(photo.serviceId);
  });
  
  afterPhotos.forEach(photo => {
    if (photo.serviceId) serviceIds.add(photo.serviceId);
  });
  
  // Get services with photos
  const servicesWithPhotos = Array.from(serviceIds).map(serviceId => {
    const service = sector.services?.find(s => s.id === serviceId);
    const serviceBefore = beforePhotos.filter(p => p.serviceId === serviceId);
    const serviceAfter = afterPhotos.filter(p => p.serviceId === serviceId);
    
    return {
      id: serviceId,
      name: service?.name || `Serviço ${serviceId}`,
      beforePhotos: serviceBefore,
      afterPhotos: serviceAfter
    };
  });
  
  if (servicesWithPhotos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Não há fotos de serviços disponíveis.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Fotos de Serviços</h2>
      
      {servicesWithPhotos.map(service => (
        <div key={service.id} className="border-t pt-4">
          <h3 className="font-medium text-lg mb-3">{service.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Antes</h4>
              {service.beforePhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {service.beforePhotos.map(photo => (
                    <PhotoThumbnail key={`before-${photo.id}`} photo={photo} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sem fotos de antes</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Depois</h4>
              {service.afterPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {service.afterPhotos.map(photo => (
                    <PhotoThumbnail key={`after-${photo.id}`} photo={photo} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sem fotos de depois</p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* General Photos */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-lg mb-3">Fotos Gerais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Antes</h4>
            {beforePhotos.filter(p => !p.serviceId).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {beforePhotos.filter(p => !p.serviceId).map(photo => (
                  <PhotoThumbnail key={`general-before-${photo.id}`} photo={photo} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sem fotos gerais de antes</p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Depois</h4>
            {afterPhotos.filter(p => !p.serviceId).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {afterPhotos.filter(p => !p.serviceId).map(photo => (
                  <PhotoThumbnail key={`general-after-${photo.id}`} photo={photo} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sem fotos gerais de depois</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PhotoThumbnailProps {
  photo: Photo;
}

function PhotoThumbnail({ photo }: PhotoThumbnailProps) {
  return (
    <div className="border rounded overflow-hidden">
      <img 
        src={photo.url} 
        alt="Foto de serviço" 
        className="w-full h-32 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
          target.className = "w-full h-32 object-contain bg-gray-100";
        }}
      />
    </div>
  );
}
