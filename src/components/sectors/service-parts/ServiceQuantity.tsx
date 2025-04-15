
import React from 'react';
import { Service } from '@/types';
import { Label } from '@/components/ui/label';
import QuantityInput from '../QuantityInput';

interface ServiceQuantityProps {
  service: Service;
  onQuantityChange: (id: string, quantity: number) => void;
}

export default function ServiceQuantity({ service, onQuantityChange }: ServiceQuantityProps) {
  const handleQuantityChange = (quantity: number) => {
    onQuantityChange(service.id, quantity);
  };

  return (
    <div className="space-y-1">
      <Label htmlFor={`quantity-${service.id}`} className="text-sm">
        Quantidade
      </Label>
      <QuantityInput
        value={service.quantity || 1}
        onChange={handleQuantityChange}
        min={1}
        max={100}
        id={`quantity-${service.id}`}
      />
    </div>
  );
}
