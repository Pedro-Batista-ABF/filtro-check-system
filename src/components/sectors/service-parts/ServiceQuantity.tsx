
import React, { useState, useEffect } from 'react';
import { Service } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

export interface ServiceQuantityProps {
  service: Service;
  onUpdate: (quantity: number) => void;
}

const ServiceQuantity: React.FC<ServiceQuantityProps> = ({
  service,
  onUpdate
}) => {
  const [quantity, setQuantity] = useState(service.quantity || 1);
  
  useEffect(() => {
    // When service changes, update local quantity
    setQuantity(service.quantity || 1);
  }, [service]);
  
  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onUpdate(newQuantity);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onUpdate(newQuantity);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    
    if (!isNaN(val) && val > 0) {
      setQuantity(val);
      onUpdate(val);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={`quantity-${service.id}`} className="text-sm">
        Quantidade
      </Label>
      
      <div className="flex">
        <Button
          type="button"
          variant="outline"
          className="rounded-r-none"
          onClick={handleDecrement}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          id={`quantity-${service.id}`}
          type="number"
          value={quantity}
          onChange={handleChange}
          min="1"
          className="rounded-none text-center w-16"
        />
        
        <Button
          type="button"
          variant="outline"
          className="rounded-l-none"
          onClick={handleIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ServiceQuantity;
