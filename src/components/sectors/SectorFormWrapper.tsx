
import React from "react";
import { Sector } from "@/types";
import SectorForm from "./SectorForm";
import { FormMode } from "@/types";

interface SectorFormWrapperProps {
  initialSector: Sector;
  onSubmit: (data: Sector) => void;
  mode?: FormMode;
  photoRequired?: boolean;
  isLoading?: boolean;
  disableEntryFields?: boolean;
}

const SectorFormWrapper: React.FC<SectorFormWrapperProps> = ({
  initialSector,
  onSubmit,
  mode = "peritagem",
  photoRequired = true,
  isLoading = false,
  disableEntryFields = false
}) => {
  return (
    <SectorForm
      initialSector={initialSector}
      onSubmit={onSubmit}
      mode={mode}
      isLoading={isLoading}
      photoRequired={photoRequired}
      disableEntryFields={disableEntryFields}
    />
  );
};

export default SectorFormWrapper;
