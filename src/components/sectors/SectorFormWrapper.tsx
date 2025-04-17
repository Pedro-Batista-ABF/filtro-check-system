
import React from 'react';
import { Sector } from '@/types';
import SectorForm from './SectorForm';

interface SectorFormWrapperProps {
  initialSector: Sector;
  onSubmit: (data: Partial<Sector>) => Promise<void>;
  mode: 'peritagem' | 'production' | 'quality' | 'scrap';
  photoRequired: boolean;
  isLoading: boolean;
  disableEntryFields: boolean;
}

/**
 * Wrapper para o componente SectorForm 
 * Esta camada resolve problemas de tipagem na passagem de props
 */
const SectorFormWrapper: React.FC<SectorFormWrapperProps> = ({
  initialSector,
  onSubmit,
  mode,
  photoRequired,
  isLoading,
  disableEntryFields
}) => {
  return (
    <SectorForm
      initialSector={initialSector}
      onSubmit={onSubmit}
      mode={mode}
      photoRequired={photoRequired}
      isLoading={isLoading}
      disableEntryFields={disableEntryFields}
    />
  );
};

export default SectorFormWrapper;
