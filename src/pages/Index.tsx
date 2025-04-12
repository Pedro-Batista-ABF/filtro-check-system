import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ClipboardCheck, Filter, CheckSquare, FileText, Calendar, ArrowRight, SendHorizontal } from "lucide-react";
import { useApi } from "@/contexts/ApiContext";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportList from "@/components/reports/ReportList";

export default function Index() {
  const { sectors, loading } = useApi();
  
  // Get the most recent sectors (limited to 4)
  const recentSectors = [...sectors].sort((a, b) => 
    new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  ).slice(0, 4);

  // Count sectors by status
  const statusCounts = sectors.reduce((acc, sector) => {
    acc[sector.status] = (acc[sector.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PageLayout>
      <div className="space-y-10">
        <section className="text-center py-6">
          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            Controle de Recuperação de Setores
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Sistema de gerenciamento de peritagem, execução e checagem de qualidade para setores de filtros recuperados.
          </p>
        </section>

        {/* Status Cards moved to the top */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Peritagem Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">
                {statusCounts.peritagemPendente || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Em Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700">
                {statusCounts.emExecucao || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Checagem Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-700">
                {statusCounts.checagemFinalPendente || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">
                {statusCounts.concluido || 0}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Rest of the existing content remains the same */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="module-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
                Peritagem
              </CardTitle>
              <CardDescription>
                Cadastro e avaliação inicial dos setores
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <p>Registre novos setores, inclua fotos dos defeitos e selecione os serviços necessários.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="default" className="w-full">
                <Link to="/peritagem">Acessar Peritagem</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="module-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                Execução
              </CardTitle>
              <CardDescription>
                Acompanhamento da produção
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <p>Visualize os setores em execução e os serviços a serem realizados em cada um deles.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="default" className="w-full">
                <Link to="/execucao">Acessar Execução</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="module-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                Qualidade
              </CardTitle>
              <CardDescription>
                Checagem final dos serviços
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <p>Realize a verificação final dos setores, confirme os serviços executados e finalize o processo.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="default" className="w-full">
                <Link to="/checagem">Acessar Qualidade</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        <Tabs defaultValue="sectors" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sectors">Setores Recentes</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sectors">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Setores Recentes</h2>
                <Button asChild variant="outline">
                  <Link to="/relatorios">
                    <FileText className="h-4 w-4 mr-2" /> 
                    Ver Relatórios
                  </Link>
                </Button>
              </div>
              
              {loading ? (
                <p className="text-center py-6 text-gray-500">Carregando setores...</p>
              ) : recentSectors.length > 0 ? (
                <SectorGrid sectors={recentSectors} />
              ) : (
                <p className="text-center py-6 text-gray-500">Nenhum setor cadastrado ainda</p>
              )}
            </section>
          </TabsContent>
          
          <TabsContent value="reports">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Relatórios Salvos</h2>
                <Button asChild variant="outline">
                  <Link to="/relatorios">
                    <FileText className="h-4 w-4 mr-2" /> 
                    Gerar Novo Relatório
                  </Link>
                </Button>
              </div>
              
              <ReportList />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
