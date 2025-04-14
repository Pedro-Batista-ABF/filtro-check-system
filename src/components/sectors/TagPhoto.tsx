
import { Sector } from "@/types";
import { useEffect, useState } from "react";

interface TagPhotoProps {
  sector: Sector;
}

export default function TagPhoto({ sector }: TagPhotoProps) {
  const [imgError, setImgError] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  
  useEffect(() => {
    // Reset error state when sector changes
    setImgError(false);
    setImgUrl(sector.tagPhotoUrl || "");
  }, [sector]);

  const handleImageError = () => {
    console.log("Error loading tag photo:", sector.tagPhotoUrl);
    setImgError(true);
  };

  if (!sector.tagPhotoUrl || imgError) {
    return (
      <div className="bg-gray-100 border rounded-md flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">Sem foto da TAG</p>
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden border">
      <img
        src={imgUrl}
        alt={`Foto da TAG ${sector.tagNumber}`}
        className="w-full h-auto max-h-40 object-contain bg-gray-50"
        onError={handleImageError}
      />
    </div>
  );
}
