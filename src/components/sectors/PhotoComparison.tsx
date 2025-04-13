
import React from 'react';
import { Service, Sector } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface PhotoComparisonProps {
  sector: Sector;
  service: Service;
  sectorId?: string; // Opcional para compatibilidade com ReportPreview
}

const PhotoComparison: React.FC<PhotoComparisonProps> = ({ sector, service }) => {
  // Filtrar fotos relacionadas a este serviço específico
  // Melhorado: filtragem precisa por serviceId garantindo a associação correta
  const beforePhotos = sector.beforePhotos?.filter(photo => 
    photo.serviceId === service.id
  ) || [];
  
  const afterPhotos = sector.afterPhotos?.filter(photo => 
    photo.serviceId === service.id
  ) || [];

  if (beforePhotos.length === 0 && afterPhotos.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="py-4">
          <p className="text-sm text-gray-500 italic">
            Nenhuma foto disponível para este serviço.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="py-4">
        <h4 className="font-medium mb-2">{service.name}</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium mb-2 text-gray-700">Antes</h5>
            {beforePhotos.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {beforePhotos.map(photo => (
                  <div key={photo.id} className="border rounded-md overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt={`Foto antes do serviço: ${service.name}`} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Nenhuma foto de antes disponível</p>
            )}
          </div>
          
          <div>
            <h5 className="text-sm font-medium mb-2 text-gray-700">Depois</h5>
            {afterPhotos.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {afterPhotos.map(photo => (
                  <div key={photo.id} className="border rounded-md overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt={`Foto depois do serviço: ${service.name}`} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Nenhuma foto de depois disponível</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoComparison;
