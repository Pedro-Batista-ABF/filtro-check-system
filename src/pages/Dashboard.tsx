
import React, { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SummaryCards from "@/components/dashboard/SummaryCards";
import FeatureCard from "@/components/dashboard/FeatureCard";
import { useApi } from "@/contexts/ApiContextExtended";

export default function Dashboard() {
  const { refreshData } = useApi();

  useEffect(() => {
    document.title = "Dashboard - Gestão de Recuperação";
    refreshData();
  }, [refreshData]);

  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <SummaryCards />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <FeatureCard 
            title="Peritagem" 
            description="Registre e gerencie setores para recuperação"
            icon="Clipboard"
            linkTo="/peritagem"
          />
          <FeatureCard 
            title="Produção" 
            description="Acompanhe setores em execução"
            icon="Tool"
            linkTo="/execucao"
          />
          <FeatureCard 
            title="Checagem Final" 
            description="Realize a checagem de qualidade dos setores recuperados"
            icon="CheckSquare"
            linkTo="/checagem"
          />
          <FeatureCard 
            title="Relatórios" 
            description="Gere relatórios e visualize dados consolidados"
            icon="FileText"
            linkTo="/relatorio"
          />
          <FeatureCard 
            title="Sucateamento" 
            description="Processo de sucateamento de setores"
            icon="Trash2"
            linkTo="/sucateamento"
          />
        </div>
      </div>
    </PageLayout>
  );
}
