
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Service } from "@/types";

interface ServicesTabContentProps {
  services: Service[];
  formErrors: {
    photos?: boolean;
  };
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
}

export default function ServicesTabContent({ 
  services, 
  formErrors, 
  handlePhotoUpload 
}: ServicesTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="py-2 space-y-1">
        <h3 className="font-medium">Checagem de Qualidade</h3>
        <p className="text-sm text-gray-500">
          Verifique os serviços realizados e faça o upload das fotos do serviço concluído.
        </p>
      </div>
      
      {formErrors.photos && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          Cada serviço deve ter pelo menos uma foto após a execução.
        </div>
      )}
      
      {services.filter(service => service.selected).map((service) => (
        <ServiceCard 
          key={service.id} 
          service={service} 
          handlePhotoUpload={handlePhotoUpload}
        />
      ))}
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
}

function ServiceCard({ service, handlePhotoUpload }: ServiceCardProps) {
  return (
    <Card key={service.id} className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-2">
        <CardTitle className="text-base">{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ServicePhotos 
            title="Fotos Antes" 
            photos={service.photos?.filter(photo => photo.type === 'before')} 
          />
          <ServiceUpload 
            serviceId={service.id}
            handlePhotoUpload={handlePhotoUpload}
            existingPhotos={service.photos?.filter(photo => photo.type === 'after')}
          />
        </div>
        
        {service.observations && (
          <div className="mt-2">
            <h4 className="text-sm font-medium">Observações da Peritagem:</h4>
            <p className="text-sm bg-gray-50 p-2 rounded mt-1">
              {service.observations}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ServicePhotosProps {
  title: string;
  photos?: any[];
}

function ServicePhotos({ title, photos = [] }: ServicePhotosProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {photos.length > 0 ? (
          photos.map((photo) => (
            typeof photo === 'object' && photo.url && (
              <img 
                key={photo.id} 
                src={photo.url} 
                alt={title} 
                className="w-20 h-20 object-cover rounded border"
              />
            )
          ))
        ) : (
          <p className="text-sm text-gray-500">Nenhuma foto disponível</p>
        )}
      </div>
    </div>
  );
}

interface ServiceUploadProps {
  serviceId: string;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  existingPhotos?: any[];
}

function ServiceUpload({ serviceId, handlePhotoUpload, existingPhotos = [] }: ServiceUploadProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Fotos Depois</h4>
      <Input
        id={`photo-after-${serviceId}`}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handlePhotoUpload(serviceId, e.target.files, "after")}
        className="w-full"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {existingPhotos.map(photo => (
          typeof photo === 'object' && photo.url && (
            <img 
              key={photo.id} 
              src={photo.url} 
              alt="Foto após execução" 
              className="w-20 h-20 object-cover rounded border"
            />
          )
        ))}
      </div>
    </div>
  );
}
