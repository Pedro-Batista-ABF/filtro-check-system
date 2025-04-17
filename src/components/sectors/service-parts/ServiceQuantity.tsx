
import React from 'react';
import { Service } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

export interface ServiceQuantityProps {
  service: Service;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

const ServiceQuantity: React.FC<ServiceQuantityProps> = ({ 
  service, 
  onQuantityChange,
  disabled = false 
}) => {
  const quantity = service.quantity || 1;
  
  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue > 0) {
      onQuantityChange(newValue);
    }
  };
  
  return (
    <div className="space-y-1">
      <Label htmlFor={`quantity-${service.id}`} className="text-sm">
        Quantidade
      </Label>
      <div className="flex items-center space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          onClick={handleDecrement} 
          disabled={quantity <= 1 || disabled}
          aria-label="Diminuir quantidade"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          id={`quantity-${service.id}`}
          type="number"
          min="1"
          className="w-20 text-center"
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
        />
        
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          onClick={handleIncrement}
          disabled={disabled}
          aria-label="Aumentar quantidade"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ServiceQuantity;
