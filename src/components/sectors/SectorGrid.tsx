
import { Sector } from "@/types";
import SectorCard from "./SectorCard";

interface SectorGridProps {
  sectors: Sector[];
  onSelect?: (sector: Sector) => void;
}

export default function SectorGrid({ sectors, onSelect }: SectorGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sectors.map((sector) => (
        <div key={sector.id} onClick={() => onSelect?.(sector)} className="cursor-pointer">
          <SectorCard sector={sector} />
        </div>
      ))}
    </div>
  );
}
