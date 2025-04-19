import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import TagPhotoField from "../form-fields/TagPhotoField";
import PhotoUpload from "@/components/sectors/PhotoUpload";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { PhotoWithFile } from "@/types";

interface EntryFormSectionProps {
  data: any;
  onChange: (field: string, value: any) => void;
  onPhotoChange: (field: string, file: File) => void;
  onPhotosChange: (field: string, files: FileList) => void;
  disabled?: boolean;
}

const EntryFormSection: React.FC<EntryFormSectionProps> = ({
  data,
  onChange,
  onPhotoChange,
  onPhotosChange,
  disabled = false
}) => {
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleTagPhotoChange = (field: string, url: string) => {
    onChange(field, url);
  };

  const handleTagPhotoFileChange = (field: string, file: File) => {
    onPhotoChange(field, file);
  };

  const handlePhotosChange = (field: string, files: FileList) => {
    onPhotosChange(field, files);
  };

  return (
    <Card className="col-span-2">
      <CardContent className="grid gap-4">
        <div>
          <Label htmlFor="tag">TAG</Label>
          <Input
            id="tag"
            name="tag"
            value={data.tag || ''}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>

        <TagPhotoField
          value={data.tagPhoto}
          onChange={(url) => handleTagPhotoChange('tagPhoto', url)}
          onFileChange={(file) => handleTagPhotoFileChange('tagPhotoFile', file)}
          disabled={disabled}
        />

        <PhotoUpload
          title="Fotos da Entrada"
          onChange={(files) => handlePhotosChange('entryPhotosFiles', files)}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};

export default EntryFormSection;
