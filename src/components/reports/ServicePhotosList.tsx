
import React from 'react';
import { Service, Photo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServicePhotosListProps {
  service: Service;
  beforePhotos: Photo[];
  afterPhotos: Photo[];
}

export default function ServicePhotosList({ 
  service, 
  beforePhotos, 
  afterPhotos 
}: ServicePhotosListProps) {
  // Filter photos for this specific service
  const serviceBeforePhotos = beforePhotos.filter(
    photo => photo.serviceId === service.id
  );
  
  const serviceAfterPhotos = afterPhotos.filter(
    photo => photo.serviceId === service.id
  );
  
  if (serviceBeforePhotos.length === 0 && serviceAfterPhotos.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{service.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ANTES - Fotos da peritagem */}
          <div>
            <h3 className="font-medium mb-2">Antes</h3>
            {serviceBeforePhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {serviceBeforePhotos.map(photo => (
                  <div key={photo.id} className="aspect-square relative overflow-hidden rounded-md border">
                    <img 
                      src={photo.url} 
                      alt={`Antes - ${service.name}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma foto antes disponível</p>
            )}
          </div>
          
          {/* DEPOIS - Fotos da checagem */}
          <div>
            <h3 className="font-medium mb-2">Depois</h3>
            {serviceAfterPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {serviceAfterPhotos.map(photo => (
                  <div key={photo.id} className="aspect-square relative overflow-hidden rounded-md border">
                    <img 
                      src={photo.url} 
                      alt={`Depois - ${service.name}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma foto depois disponível</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
