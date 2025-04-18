
import React from 'react';
import { Service } from "@/types";
import SectorInfoSection from './review/SectorInfoSection';
import ServicesSection from './review/ServicesSection';

interface ReviewFormProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  entryDate: Date | undefined;
  setEntryDate: (date: Date | undefined) => void;
  tagPhotoUrl: string | undefined;
  handleTagPhotoUpload: (files: FileList) => Promise<string | undefined>;
  entryObservations: string;
  setEntryObservations: (value: string) => void;
  services: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  formErrors: {
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
    services?: boolean;
    photos?: boolean;
  };
  photoRequired: boolean;
  handleCameraCapture: (e: React.MouseEvent, serviceId?: string) => void;
}

export default function ReviewForm({
  tagNumber,
  setTagNumber,
  entryInvoice,
  setEntryInvoice,
  entryDate,
  setEntryDate,
  tagPhotoUrl,
  handleTagPhotoUpload,
  entryObservations,
  setEntryObservations,
  services,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  formErrors,
  photoRequired,
  handleCameraCapture
}: ReviewFormProps) {
  // Verificar que services está definido antes de usar
  const safeServices = Array.isArray(services) ? services : [];
  
  // Encontrar serviços sem fotos
  const servicesWithoutPhotos = safeServices
    .filter(service => service.selected && (!service.photos || service.photos.length === 0))
    .map(service => service.name);

  return (
    <div className="space-y-6">
      <SectorInfoSection
        tagNumber={tagNumber}
        setTagNumber={setTagNumber}
        entryInvoice={entryInvoice}
        setEntryInvoice={setEntryInvoice}
        entryDate={entryDate}
        setEntryDate={setEntryDate}
        tagPhotoUrl={tagPhotoUrl}
        handleTagPhotoUpload={handleTagPhotoUpload}
        entryObservations={entryObservations}
        setEntryObservations={setEntryObservations}
        onCameraCapture={(e) => handleCameraCapture(e)}
        formErrors={formErrors}
      />

      <ServicesSection
        services={safeServices}
        handleServiceChange={handleServiceChange}
        handleQuantityChange={handleQuantityChange}
        handleObservationChange={handleObservationChange}
        handlePhotoUpload={handlePhotoUpload}
        onCameraCapture={handleCameraCapture}
        formErrors={formErrors}
        photoRequired={photoRequired}
        servicesWithoutPhotos={servicesWithoutPhotos}
      />
    </div>
  );
}
