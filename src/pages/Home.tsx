
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <SummaryCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Bem-vindo ao Sistema de Recuperação de Filtros. Use o menu superior para navegar entre as diferentes funcionalidades.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
