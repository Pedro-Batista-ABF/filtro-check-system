
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { Service } from '@/types';

export interface ServiceQuantityProps {
  service: Service;
  onQuantityChange: (id: string, quantity: number) => void;
  disabled?: boolean;
}

const ServiceQuantity: React.FC<ServiceQuantityProps> = ({
  service,
  onQuantityChange,
  disabled = false
}) => {
  const handleDecrement = () => {
    if (!service.selected || disabled) return;
    const newQuantity = Math.max(1, (service.quantity || 1) - 1);
    onQuantityChange(service.id, newQuantity);
  };

  const handleIncrement = () => {
    if (!service.selected || disabled) return;
    const newQuantity = (service.quantity || 1) + 1;
    onQuantityChange(service.id, newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!service.selected || disabled) return;
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onQuantityChange(service.id, value);
    }
  };

  return (
    <div className="flex items-center">
      <span className="text-sm mr-2 whitespace-nowrap">Quantidade:</span>
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleDecrement}
          disabled={!service.selected || disabled}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          min="1"
          value={service.quantity || 1}
          onChange={handleInputChange}
          className="h-8 w-14 mx-1 text-center p-1"
          disabled={!service.selected || disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleIncrement}
          disabled={!service.selected || disabled}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default ServiceQuantity;
