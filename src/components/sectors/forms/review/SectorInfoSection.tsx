import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TagPhotoField from "../../form-fields/TagPhotoField";

interface SectorInfoSectionProps {
  sectorName: string;
  tagCode: string;
  tagPhotoUrl?: string;
  onTagPhotoChange: (url: string) => void;
  onTagPhotoFileChange?: (file: File) => void;
  disabled?: boolean;
}

const SectorInfoSection: React.FC<SectorInfoSectionProps> = ({
  sectorName,
  tagCode,
  tagPhotoUrl,
  onTagPhotoChange,
  onTagPhotoFileChange,
  disabled = false,
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Informações do Setor</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="sectorName">Nome do Setor</Label>
            <Input
              type="text"
              id="sectorName"
              value={sectorName}
              disabled={disabled}
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="tagCode">Código da TAG</Label>
            <Input
              type="text"
              id="tagCode"
              value={tagCode}
              disabled={disabled}
              readOnly
            />
          </div>
          <TagPhotoField
            value={tagPhotoUrl}
            onChange={onTagPhotoChange}
            onFileChange={onTagPhotoFileChange}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorInfoSection;
