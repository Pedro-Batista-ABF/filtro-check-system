
import { Sector } from "@/types";
import { Image } from "@/components/ui/image";

interface TagPhotoProps {
  sector: Sector;
}

export default function TagPhoto({ sector }: TagPhotoProps) {
  return (
    <div className="rounded-md overflow-hidden border">
      {sector.tagPhotoUrl ? (
        <Image
          src={sector.tagPhotoUrl}
          alt={`Foto da TAG ${sector.tagNumber}`}
          className="w-full h-auto max-h-40 object-contain bg-gray-50"
        />
      ) : (
        <div className="bg-gray-100 border rounded-md flex flex-col items-center justify-center h-40">
          <p className="text-gray-500 text-sm">Sem foto da TAG</p>
        </div>
      )}
    </div>
  );
}
