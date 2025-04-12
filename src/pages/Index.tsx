
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ClipboardCheck, Filter, CheckSquare, FileText, Calendar, ArrowRight, SendHorizontal, AlertTriangle } from "lucide-react";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportList from "@/components/reports/ReportList";
import UserInfo from "@/components/auth/UserInfo";

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
    <PageLayout HeaderExtra={<UserInfo />}>
      <div className="space-y-10">
        <section className="text-center py-6">
          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            Controle de Recuperação de Setores
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Sistema de gerenciamento de peritagem, execução e checagem de qualidade para setores de filtros recuperados.
          </p>
        </section>

        {/* Status Cards with fixed alignment */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 py-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Peritagem Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700 tabular-nums">
                {statusCounts.peritagemPendente || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Em Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700 tabular-nums">
                {statusCounts.emExecucao || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Checagem Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-700 tabular-nums">
                {statusCounts.checagemFinalPendente || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sucateamento Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-700 tabular-nums">
                {statusCounts.sucateadoPendente || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700 tabular-nums">
                {(statusCounts.concluido || 0) + (statusCounts.sucateado || 0)}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Rest of the existing content remains the same */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="module-card hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="pb-2 flex-grow-0">
              <CardTitle className="text-xl flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
                Peritagem
              </CardTitle>
              <CardDescription>
                Cadastro e avaliação inicial dos setores
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 flex-grow">
              <p>Registre novos setores, inclua fotos dos defeitos e selecione os serviços necessários.</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button 
                asChild 
                variant="default" 
                className="w-full group hover:bg-primary/90 transition-colors flex items-center justify-between"
              >
                <Link 
                  to="/peritagem" 
                  className="flex items-center justify-between w-full"
                >
                  Acessar Peritagem
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="module-card hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="pb-2 flex-grow-0">
              <CardTitle className="text-xl flex items-center">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                Execução
              </CardTitle>
              <CardDescription>
                Acompanhamento da produção
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 flex-grow">
              <p>Visualize os setores em execução e os serviços a serem realizados em cada um deles.</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button 
                asChild 
                variant="default" 
                className="w-full group hover:bg-primary/90 transition-colors flex items-center justify-between"
              >
                <Link 
                  to="/execucao" 
                  className="flex items-center justify-between w-full"
                >
                  Acessar Execução
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="module-card hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="pb-2 flex-grow-0">
              <CardTitle className="text-xl flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                Qualidade
              </CardTitle>
              <CardDescription>
                Checagem final dos serviços
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 flex-grow">
              <p>Realize a verificação final dos setores, confirme os serviços executados e finalize o processo.</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button 
                asChild 
                variant="default" 
                className="w-full group hover:bg-primary/90 transition-colors flex items-center justify-between"
              >
                <Link 
                  to="/checagem" 
                  className="flex items-center justify-between w-full"
                >
                  Acessar Qualidade
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="module-card hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="pb-2 flex-grow-0">
              <CardTitle className="text-xl flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Sucateamento
              </CardTitle>
              <CardDescription>
                Validação e registro de devolução
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 flex-grow">
              <p>Valide os setores marcados como sucateados e registre sua devolução ao cliente.</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button 
                asChild 
                variant="default" 
                className="w-full group bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-between"
              >
                <Link 
                  to="/sucateamento" 
                  className="flex items-center justify-between w-full"
                >
                  Acessar Sucateamento
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
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
