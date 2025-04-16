
import React from 'react';
import { Sector } from '@/types';
import SectorForm from './SectorForm';

interface SectorFormWrapperProps {
  initialSector: Sector;
  onSubmit: (data: Partial<Sector>) => Promise<void>;
  mode: string;
  photoRequired: boolean;
  isLoading: boolean;
  disableEntryFields: boolean;
}

/**
 * Wrapper para o componente SectorForm 
 * Esta camada resolve problemas de tipagem na passagem de props
 */
const SectorFormWrapper: React.FC<SectorFormWrapperProps> = (props) => {
  return <SectorForm {...props} />;
};

export default SectorFormWrapper;
