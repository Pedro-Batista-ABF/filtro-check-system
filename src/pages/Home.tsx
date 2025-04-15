
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, ClipboardCheck, Tool, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApi } from '@/contexts/ApiContextExtended';
import PageLayout from '@/components/layout/PageLayout';

export default function Home() {
  const navigate = useNavigate();
  const { pendingSectors, inProgressSectors, qualityCheckSectors, completedSectors, isLoading } = useApi();
  
  useEffect(() => {
    document.title = "Página Inicial - Gestão de Recuperação";
  }, []);
  
  const cardData = [
    {
      title: "Peritagem",
      description: "Cadastrar e visualizar setores em peritagem",
      count: pendingSectors?.length || 0,
      icon: Clipboard,
      color: "bg-blue-100 text-blue-700",
      action: () => navigate('/peritagem')
    },
    {
      title: "Execução",
      description: "Visualizar e gerenciar setores em execução",
      count: inProgressSectors?.length || 0,
      icon: Tool,
      color: "bg-orange-100 text-orange-700",
      action: () => navigate('/execucao')
    },
    {
      title: "Checagem Final",
      description: "Gerenciar setores pendentes de checagem",
      count: qualityCheckSectors?.length || 0,
      icon: ClipboardCheck,
      color: "bg-purple-100 text-purple-700",
      action: () => navigate('/checagem')
    },
    {
      title: "Concluídos",
      description: "Visualizar setores finalizados",
      count: completedSectors?.length || 0,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
      action: () => navigate('/concluidos')
    },
    {
      title: "Sucateamento",
      description: "Gerenciar setores para sucateamento",
      count: 0, // We'd need a way to count scrapped sectors
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700",
      action: () => navigate('/sucateamento')
    }
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo ao Sistema de Gestão de Recuperação</h1>
          <p className="text-gray-500">Selecione uma das opções abaixo para começar</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-gray-200 rounded-t-lg"></CardHeader>
                <CardContent className="h-28 mt-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
                <CardFooter className="h-10 bg-gray-200 rounded-b-lg"></CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardData.map((card, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                  <div className={`p-2 rounded-full ${card.color}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.count}</div>
                  <p className="text-sm text-gray-500">
                    {card.count === 1 ? "item pendente" : "itens pendentes"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={card.action} className="w-full">
                    Acessar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
