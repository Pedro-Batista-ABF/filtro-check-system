
import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Photo } from '@/types';

interface PhotoViewerProps {
  photos: Photo[];
}

export default function PhotoViewer({ photos }: PhotoViewerProps) {
  if (!photos || photos.length === 0) {
    return <p className="text-gray-500">Nenhuma foto disponível</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {photos.map((photo) => (
        <Dialog key={photo.id}>
          <DialogTrigger asChild>
            <div className="cursor-pointer hover:opacity-90 transition-opacity">
              <div className="relative aspect-square overflow-hidden rounded-md border">
                <img
                  src={photo.url}
                  alt={`Foto ${photo.type}`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                    target.classList.add('bg-gray-100');
                  }}
                />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <img
              src={photo.url}
              alt={`Foto ${photo.type}`}
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
                target.classList.add('bg-gray-100');
              }}
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
