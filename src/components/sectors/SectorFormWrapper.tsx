
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
      mode={mode as "peritagem" | "sucateamento" | "scrap" | "quality"}
      isLoading={isLoading}
    />
  );
};

export default SectorFormWrapper;
