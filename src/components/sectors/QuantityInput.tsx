
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuantityInputProps {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  min?: string;
  className?: string;
}

export default function QuantityInput({ 
  id, 
  label, 
  value, 
  onChange, 
  unit = "",
  min = "1",
  className = ""
}: QuantityInputProps) {
  return (
    <div className={`mt-2 ${className}`}>
      <Label htmlFor={id} className="text-xs">
        {label}{unit ? ` (${unit})` : ""}:
      </Label>
      <Input
        id={id}
        type="number"
        min={min}
        value={value || ''}
        onChange={onChange}
        className="h-8 text-sm"
      />
    </div>
  );
}
