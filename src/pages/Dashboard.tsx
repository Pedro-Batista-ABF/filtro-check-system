
import React, { useEffect } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Filter, Package, Settings, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  
  useEffect(() => {
    document.title = "Dashboard - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Controle</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo, {user?.email?.split('@')[0] || 'Usuário'}! Gerencie todo o fluxo de recuperação de filtros.
          </p>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/peritagem">
            <Card className="h-full hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Perítagias</CardTitle>
                <Filter className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cadastre setores de filtros e registre os serviços a serem executados
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/execucao">
            <Card className="h-full hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Produção</CardTitle>
                <Package className="h-5 w-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualize os setores a serem recuperados e marque-os como concluídos
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/checagem">
            <Card className="h-full hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Checagem</CardTitle>
                <Settings className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verifique e confirme os serviços executados nos setores
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/sucateamento">
            <Card className="h-full hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Sucateamento</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Gerencie setores que precisam ser sucateados
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/relatorio">
            <Card className="h-full hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Relatórios</CardTitle>
                <FileText className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Gere relatórios com fotos comparativas dos setores recuperados
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/checagem-final">
            <Card className="h-full hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Checagem Final</CardTitle>
                <Settings className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Realize a checagem final dos setores concluídos pela produção
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </PageLayoutWrapper>
  );
}
