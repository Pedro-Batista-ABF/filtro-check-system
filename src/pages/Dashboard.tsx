
import React, { useEffect } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SummaryCards from "@/components/dashboard/SummaryCards";
import FeatureCard from "@/components/dashboard/FeatureCard";
import { ClipboardCheck, Settings, CheckSquare, FileText, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  useEffect(() => {
    document.title = "Dashboard - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        
        <SummaryCards />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            title="Peritagem"
            description="Registro inicial de setores e identificação de serviços necessários"
            icon={<ClipboardCheck className="h-8 w-8 text-primary" />}
            href="/peritagem"
          />
          <FeatureCard
            title="Execução"
            description="Acompanhamento de setores em produção"
            icon={<Settings className="h-8 w-8 text-primary" />}
            href="/execucao"
          />
          <FeatureCard
            title="Checagem"
            description="Verificação final e liberação dos setores recuperados"
            icon={<CheckSquare className="h-8 w-8 text-primary" />}
            href="/checagem"
          />
          <FeatureCard
            title="Sucateamento"
            description="Gerenciamento de setores enviados para sucateamento"
            icon={<AlertTriangle className="h-8 w-8 text-primary" />}
            href="/sucateamento"
          />
          <FeatureCard
            title="Relatórios"
            description="Geração de relatórios e análise de dados"
            icon={<FileText className="h-8 w-8 text-primary" />}
            href="/relatorio"
          />
        </div>
      </div>
    </PageLayoutWrapper>
  );
};

export default Dashboard;
