
import React, { useState } from 'react';
import { Sector, Photo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface SectorPhotosProps {
  sector: Sector;
}

export default function SectorPhotos({ sector }: SectorPhotosProps) {
  const [activeTab, setActiveTab] = useState('before');
  
  const beforePhotos = sector.beforePhotos || [];
  const afterPhotos = sector.afterPhotos || [];
  const scrapPhotos = sector.scrapPhotos || [];
  
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
          </TabsList>
          
          <TabsContent value="before" className="mt-4">
            <PhotoGrid photos={beforePhotos} title="Fotos da Entrada" />
          </TabsContent>
          
          <TabsContent value="after" className="mt-4">
            <PhotoGrid photos={afterPhotos} title="Fotos da Saída" />
          </TabsContent>
          
          {scrapPhotos.length > 0 && (
            <TabsContent value="scrap" className="mt-4">
              <PhotoGrid photos={scrapPhotos} title="Fotos de Sucata" />
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
          <div key={photo.id} className="overflow-hidden rounded-lg border border-gray-200">
            <AspectRatio ratio={1 / 1}>
              <img
                src={photo.url}
                alt={`Foto ${photo.id}`}
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
        ))}
      </div>
    </div>
  );
}
