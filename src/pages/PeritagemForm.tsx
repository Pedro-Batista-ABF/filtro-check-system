import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/peritagem')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Peritagem' : 'Nova Peritagem'}
            </h1>
          </div>
        </div>
        
        <Card className="p-6">
          <p>Formulário de peritagem será exibido aqui.</p>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/peritagem')}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button>
              Salvar
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}

export default PeritagemForm;
