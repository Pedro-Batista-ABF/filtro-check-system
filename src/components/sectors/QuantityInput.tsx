
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  id?: string;
}

export default function QuantityInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  id = 'quantity'
}: QuantityInputProps) {
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={decrement}
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        id={id}
        type="number"
        className="h-8 w-20 mx-2 text-center"
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={increment}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
