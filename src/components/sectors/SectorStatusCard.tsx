
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectorStatus } from '@/types';

interface SectorStatusCardProps {
  title: string;
  status: SectorStatus;
  count: number;
  onClick?: () => void;
}

const SectorStatusCard: React.FC<SectorStatusCardProps> = ({ 
  title, 
  status, 
  count, 
  onClick 
}) => {
  // Define colors based on status
  const getStatusColor = () => {
    switch (status) {
      case 'peritagemPendente':
        return 'border-l-4 border-l-yellow-500';
      case 'emExecucao':
        return 'border-l-4 border-l-blue-500';
      case 'checagemFinalPendente':
        return 'border-l-4 border-l-purple-500';
      case 'concluido':
        return 'border-l-4 border-l-green-500';
      case 'sucateado':
        return 'border-l-4 border-l-red-500';
      case 'sucateadoPendente':
        return 'border-l-4 border-l-orange-500';
      default:
        return 'border-l-4 border-l-gray-500';
    }
  };

  return (
    <Card 
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${getStatusColor()}`} 
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-sm text-muted-foreground">Setores</p>
      </CardContent>
    </Card>
  );
};

export default SectorStatusCard;
