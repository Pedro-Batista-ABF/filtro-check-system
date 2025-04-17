import { useState } from 'react';
import { useApi } from '@/contexts/ApiContextExtended';
import { ServiceType, Service } from '@/types';

export function usePhotosManagement() {
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const { uploadPhoto } = useApi();

  const handleBeforePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sectorId: string,
    serviceId: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      const photoUrl = await uploadPhoto(file, `sectors/${sectorId}/services/${serviceId}/before`);
      setBeforePhotos((prevPhotos) => [...prevPhotos, photoUrl]);
    } catch (error) {
      console.error("Error uploading before photo:", error);
    }
  };

  const handleAfterPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sectorId: string,
    serviceId: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      const photoUrl = await uploadPhoto(file, `sectors/${sectorId}/services/${serviceId}/after`);
      setAfterPhotos((prevPhotos) => [...prevPhotos, photoUrl]);
    } catch (error) {
      console.error("Error uploading after photo:", error);
    }
  };

  return {
    beforePhotos,
    afterPhotos,
    handleBeforePhotoUpload,
    handleAfterPhotoUpload,
  };
}

