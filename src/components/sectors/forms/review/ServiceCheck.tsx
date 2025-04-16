
import React, { useState } from "react";
import { Service, Photo } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";

interface ServiceCheckProps {
  service: Service;
  onChange: (service: Service) => void;
  beforePhotos?: Photo[];
  readOnly?: boolean;
  onPhotoUpload?: (serviceId: string, files: FileList, type: "before" | "after") => void;
}

export default function ServiceCheck({ 
  service, 
  onChange, 
  beforePhotos = [],
  readOnly = false,
  onPhotoUpload
}: ServiceCheckProps) {
  const [quantity, setQuantity] = useState(service.quantity || 1);
  const [observations, setObservations] = useState(service.observations || "");
  const [uploading, setUploading] = useState(false);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 1;
    setQuantity(newQuantity);
    onChange({ ...service, quantity: newQuantity });
  };

  const handleObservationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservations(e.target.value);
    onChange({ ...service, observations: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onPhotoUpload || !e.target.files || e.target.files.length === 0) {
      return;
    }
    
    setUploading(true);
    try {
      onPhotoUpload(service.id, e.target.files, "before");
      toast.success("Foto adicionada com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-lg">{service.name}</h3>
        {service.description && (
          <p className="text-sm text-gray-600">{service.description}</p>
        )}
      </div>

      <div>
        <Label htmlFor={`quantity-${service.id}`}>Quantidade</Label>
        <Input
          id={`quantity-${service.id}`}
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="w-32"
          readOnly={readOnly}
        />
      </div>

      <div>
        <Label htmlFor={`observations-${service.id}`}>Observações</Label>
        <Textarea
          id={`observations-${service.id}`}
          value={observations}
          onChange={handleObservationsChange}
          placeholder="Descreva detalhes importantes sobre este serviço"
          readOnly={readOnly}
        />
      </div>

      <div>
        <Label className="block mb-2">Fotos do Defeito</Label>
        {beforePhotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {beforePhotos.map((photo, idx) => (
              <div key={idx} className="relative border rounded overflow-hidden">
                <img
                  src={photo.url}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-32 object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma foto adicionada</p>
        )}

        {!readOnly && (
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              component="label"
              className="flex items-center cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-1" />
              Carregar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                multiple
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
