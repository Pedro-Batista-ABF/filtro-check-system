
import React, { useState } from 'react';
import { Sector, Photo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Image, ZoomIn } from 'lucide-react';

interface SectorPhotosProps {
  sector: Sector;
}

export default function SectorPhotos({ sector }: SectorPhotosProps) {
  const [activeTab, setActiveTab] = useState('before');
  
  const beforePhotos = sector.beforePhotos || [];
  const afterPhotos = sector.afterPhotos || [];
  const scrapPhotos = sector.scrapPhotos || [];
  
  // Group photos by service
  const beforePhotosByService = groupPhotosByService(beforePhotos, sector.services || []);
  const afterPhotosByService = groupPhotosByService(afterPhotos, sector.services || []);
  
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Fotos do Setor</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="before" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="before">Fotos da Entrada ({beforePhotos.length})</TabsTrigger>
            <TabsTrigger value="after">Fotos da Saída ({afterPhotos.length})</TabsTrigger>
            {scrapPhotos.length > 0 && (
              <TabsTrigger value="scrap">Fotos de Sucata ({scrapPhotos.length})</TabsTrigger>
            )}
            {sector.tagPhotoUrl && (
              <TabsTrigger value="tag">Foto da TAG</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="before" className="mt-4">
            <ServicePhotosGrid 
              photosByService={beforePhotosByService} 
              generalPhotos={beforePhotos.filter(p => !p.serviceId)} 
              title="Fotos da Entrada" 
            />
          </TabsContent>
          
          <TabsContent value="after" className="mt-4">
            <ServicePhotosGrid 
              photosByService={afterPhotosByService} 
              generalPhotos={afterPhotos.filter(p => !p.serviceId)} 
              title="Fotos da Saída" 
            />
          </TabsContent>
          
          {scrapPhotos.length > 0 && (
            <TabsContent value="scrap" className="mt-4">
              <PhotoGrid photos={scrapPhotos} title="Fotos de Sucata" />
            </TabsContent>
          )}
          
          {sector.tagPhotoUrl && (
            <TabsContent value="tag" className="mt-4">
              <div className="flex justify-center">
                <Dialog>
                  <DialogTrigger>
                    <div className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <AspectRatio ratio={1 / 1} className="w-64 h-64">
                        <img
                          src={sector.tagPhotoUrl}
                          alt={`Foto da TAG ${sector.tagNumber}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                            target.className = "h-full w-full object-contain bg-gray-100";
                          }}
                        />
                      </AspectRatio>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img 
                      src={sector.tagPhotoUrl} 
                      alt={`Foto da TAG ${sector.tagNumber}`} 
                      className="max-h-[80vh] mx-auto"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface PhotoGridProps {
  photos: Photo[];
  title: string;
}

function PhotoGrid({ photos, title }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma foto disponível.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="sr-only">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Dialog key={photo.id}>
            <DialogTrigger>
              <div className="overflow-hidden rounded-lg border border-gray-200 cursor-pointer group">
                <AspectRatio ratio={1 / 1}>
                  <img
                    src={photo.url}
                    alt={`Foto ${photo.id}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                      target.className = "h-full w-full object-contain bg-gray-100";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="text-white h-8 w-8" />
                  </div>
                </AspectRatio>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <img 
                src={photo.url} 
                alt={`Foto ${photo.id}`} 
                className="max-h-[80vh] mx-auto"
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}

interface PhotosByServiceMap {
  [serviceId: string]: {
    serviceName: string;
    photos: Photo[];
  }
}

function groupPhotosByService(photos: Photo[], services: any[]): PhotosByServiceMap {
  const result: PhotosByServiceMap = {};
  
  photos.forEach(photo => {
    if (photo.serviceId) {
      if (!result[photo.serviceId]) {
        const service = services.find(s => s.id === photo.serviceId);
        result[photo.serviceId] = {
          serviceName: service ? service.name : `Serviço ${photo.serviceId}`,
          photos: []
        };
      }
      result[photo.serviceId].photos.push(photo);
    }
  });
  
  return result;
}

interface ServicePhotosGridProps {
  photosByService: PhotosByServiceMap;
  generalPhotos: Photo[];
  title: string;
}

function ServicePhotosGrid({ photosByService, generalPhotos, title }: ServicePhotosGridProps) {
  const serviceIds = Object.keys(photosByService);
  
  if (serviceIds.length === 0 && generalPhotos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma foto disponível.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Service-specific photos */}
      {serviceIds.map(serviceId => (
        <div key={serviceId} className="space-y-2">
          <h3 className="font-medium text-lg">{photosByService[serviceId].serviceName}</h3>
          <PhotoGrid photos={photosByService[serviceId].photos} title={photosByService[serviceId].serviceName} />
        </div>
      ))}
      
      {/* General photos */}
      {generalPhotos.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Fotos Gerais</h3>
          <PhotoGrid photos={generalPhotos} title="Fotos Gerais" />
        </div>
      )}
    </div>
  );
}
