
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function RelatorioPreview() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Prévia do Relatório</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Relatório Consolidado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Esta página exibirá a prévia do relatório consolidado antes da geração do PDF final.
            </p>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => navigate('/relatorios')}
                variant="outline"
              >
                Voltar para Relatórios
              </Button>
              <Button>
                Gerar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
