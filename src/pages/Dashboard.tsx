
import { useEffect } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useApi } from "@/contexts/ApiContextExtended";

const Dashboard = () => {
  const navigate = useNavigate();
  const { sectors } = useApi();

  useEffect(() => {
    document.title = "Dashboard - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Button onClick={() => navigate("/peritagem/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Peritagem
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-medium text-gray-500">Total de Setores</h2>
            <p className="text-3xl font-bold">{sectors.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-medium text-gray-500">Pendentes</h2>
            <p className="text-3xl font-bold">
              {sectors.filter(s => s.status === 'peritagemPendente').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-medium text-gray-500">Em Execução</h2>
            <p className="text-3xl font-bold">
              {sectors.filter(s => s.status === 'emExecucao').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-medium text-gray-500">Concluídos</h2>
            <p className="text-3xl font-bold">
              {sectors.filter(s => s.status === 'concluido').length}
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Gerenciar Peritagens</h3>
            <p className="mb-4 text-sm text-gray-500">Controle e acompanhe as peritagens de setores de filtros</p>
            <Button variant="outline" className="mt-auto" onClick={() => navigate("/peritagem")}>
              Acessar Peritagens
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Produção</h3>
            <p className="mb-4 text-sm text-gray-500">Acompanhe a execução dos serviços nos setores</p>
            <Button variant="outline" className="mt-auto" onClick={() => navigate("/execucao")}>
              Acessar Produção
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Checagem Final</h3>
            <p className="mb-4 text-sm text-gray-500">Realize a checagem final dos setores concluídos</p>
            <Button variant="outline" className="mt-auto" onClick={() => navigate("/checagem")}>
              Acessar Checagem
            </Button>
          </div>
        </div>
      </div>
    </PageLayoutWrapper>
  );
};

export default Dashboard;
