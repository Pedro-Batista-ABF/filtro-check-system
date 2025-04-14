
import React from "react";
import { Sector } from "@/types";
import SectorCard from "./SectorCard";

interface SectorGridProps {
  sectors: Sector[];
  onSelect?: (sector: Sector) => void;
}

export default function SectorGrid({ sectors, onSelect }: SectorGridProps) {
  if (!sectors || sectors.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum setor encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sectors.map((sector) => (
        <div 
          key={`sector-grid-${sector.id}`} 
          onClick={() => onSelect?.(sector)} 
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <SectorCard sector={sector} />
        </div>
      ))}
    </div>
  );
}
