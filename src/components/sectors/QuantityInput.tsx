
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuantityInputProps {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
}

export default function QuantityInput({ 
  id, 
  label, 
  value, 
  onChange, 
  unit = "" 
}: QuantityInputProps) {
  return (
    <div className="mt-2">
      <Label htmlFor={id} className="text-xs">
        {label}{unit ? ` (${unit})` : ""}:
      </Label>
      <Input
        id={id}
        type="number"
        min="1"
        value={value || ''}
        onChange={onChange}
        className="h-8 text-sm"
      />
    </div>
  );
}
