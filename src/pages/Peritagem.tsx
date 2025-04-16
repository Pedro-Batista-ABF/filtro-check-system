
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Peritagem() {
  const navigate = useNavigate();
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Peritagem</h1>
          <Button onClick={() => navigate('/peritagem/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Peritagem
          </Button>
        </div>
        
        <div className="p-4 border rounded-md bg-gray-50">
          <p>Lista de perítagems será exibida aqui.</p>
        </div>
      </div>
    </PageLayout>
  );
}

export default Peritagem;
