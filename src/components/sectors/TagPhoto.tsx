
import { Sector } from "@/types";
import { Image } from "@/components/ui/image";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

interface TagPhotoProps {
  sector: Sector;
}

export default function TagPhoto({ sector }: TagPhotoProps) {
  // Ensure we have a valid tag photo URL
  const hasPhotoUrl = !!sector.tagPhotoUrl && sector.tagPhotoUrl.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <Label className="text-sm font-medium">TAG: {sector.tagNumber}</Label>
          <div className="rounded-md overflow-hidden border">
            {hasPhotoUrl ? (
              <Image
                src={sector.tagPhotoUrl}
                alt={`Foto da TAG ${sector.tagNumber}`}
                className="w-full h-auto max-h-40 object-contain bg-gray-50"
                fallbackSrc="/placeholder-image.png"
                showRefresh={true}
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
