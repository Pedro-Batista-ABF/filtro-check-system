
import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, FileText, Settings, Package } from 'lucide-react';

export default function Home() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Recuperação de Filtros</h1>
          <p className="text-muted-foreground mt-2">
            Controle todo o fluxo de recuperação desde a peritagem até a checagem final
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/peritagem">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Peritagem</CardTitle>
                <Filter className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cadastre setores de filtros e registre os serviços a serem executados
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/producao">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Produção</CardTitle>
                <Package className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualize os setores a serem recuperados e marque-os como concluídos
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/checagem">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Checagem</CardTitle>
                <Settings className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verifique e confirme os serviços executados nos setores
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/relatorios">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Relatórios</CardTitle>
                <FileText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Gere relatórios com fotos comparativas dos setores recuperados
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
