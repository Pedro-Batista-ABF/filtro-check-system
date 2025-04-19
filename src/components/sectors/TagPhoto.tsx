
import { Sector } from "@/types";
import { Image } from "@/components/ui/image";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { fixDuplicatedStoragePath } from "@/utils/photoUtils";
import { useEffect, useState } from "react";

interface TagPhotoProps {
  sector: Sector;
}

export default function TagPhoto({ sector }: TagPhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  
  useEffect(() => {
    if (sector?.tagPhotoUrl) {
      // Corrigir possíveis problemas na URL da foto da TAG
      const fixedUrl = fixDuplicatedStoragePath(sector.tagPhotoUrl);
      setPhotoUrl(fixedUrl);
      console.log("TagPhoto: URL processada:", fixedUrl);
    } else {
      setPhotoUrl('');
    }
  }, [sector?.tagPhotoUrl]);
  
  // Verificar se temos uma URL válida
  const hasPhotoUrl = !!photoUrl && photoUrl.length > 0;

  console.log("TagPhoto rendering with URL:", photoUrl);

  const handleImageLoadSuccess = () => {
    console.log("TagPhoto: imagem carregada com sucesso");
  };

  const handleImageLoadError = (error: any) => {
    console.error("TagPhoto: erro ao carregar imagem:", error);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <Label className="text-sm font-medium">TAG: {sector.tagNumber}</Label>
          <div className="rounded-md overflow-hidden border">
            {hasPhotoUrl ? (
              <Image
                src={photoUrl}
                alt={`Foto da TAG ${sector.tagNumber}`}
                className="w-full h-auto max-h-40 object-contain bg-gray-50"
                fallbackSrc="/placeholder-image.png"
                showRefresh={true}
                onLoadSuccess={handleImageLoadSuccess}
                onLoadError={handleImageLoadError}
              />
            ) : (
              <div className="bg-gray-100 border rounded-md flex flex-col items-center justify-center h-40">
                <Camera className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Foto da TAG não cadastrada</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
