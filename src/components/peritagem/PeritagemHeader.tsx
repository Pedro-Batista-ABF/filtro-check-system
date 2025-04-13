
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PeritagemHeaderProps {
  isEditing: boolean;
}

export default function PeritagemHeader({ isEditing }: PeritagemHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center space-x-3 pb-2 border-b">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/peritagem')}
        className="hover:bg-primary/10"
      >
        <ArrowLeft className="h-5 w-5 text-primary" />
      </Button>
      <h1 className="text-2xl font-bold text-primary">
        {isEditing ? 'Editar Peritagem' : 'Nova Peritagem'}
      </h1>
    </div>
  );
}
