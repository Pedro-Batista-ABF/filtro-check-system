
import { Sector } from "@/types";
import SectorCard from "./SectorCard";

interface SectorGridProps {
  sectors: Sector[];
}

export default function SectorGrid({ sectors }: SectorGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sectors.map((sector) => (
        <SectorCard key={sector.id} sector={sector} />
      ))}
    </div>
  );
}
