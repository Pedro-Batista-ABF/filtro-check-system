
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MinusIcon, PlusIcon } from "lucide-react";

interface ServiceQuantityProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function ServiceQuantity({
  value,
  onChange,
  min = 1,
  max = 100
}: ServiceQuantityProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Quantidade</Label>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
