
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
  return (
    <Card 
      className="hover:bg-gray-50 cursor-pointer transition-colors" 
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
