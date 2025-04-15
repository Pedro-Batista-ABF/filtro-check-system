
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from '@/components/layout/PageLayout';

const Home = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard de Recuperação de Filtros</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>Peritagem</CardTitle>
              <CardDescription>Registro e avaliação inicial</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm mb-4">Registre novos setores e faça a avaliação inicial dos serviços necessários.</p>
              <Link to="/peritagem" className="text-blue-600 hover:text-blue-800 font-medium">
                Acessar Peritagem →
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle>Execução</CardTitle>
              <CardDescription>Acompanhamento da produção</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm mb-4">Acompanhe e registre a conclusão dos serviços em execução.</p>
              <Link to="/execucao" className="text-green-600 hover:text-green-800 font-medium">
                Acessar Execução →
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle>Checagem Final</CardTitle>
              <CardDescription>Validação de qualidade</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm mb-4">Realize a checagem final e registro de fotos após execução.</p>
              <Link to="/checagem" className="text-purple-600 hover:text-purple-800 font-medium">
                Acessar Checagem →
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle>Sucateamento</CardTitle>
              <CardDescription>Validação de sucateamento</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm mb-4">Valide os setores marcados para sucateamento.</p>
              <Link to="/sucateamento" className="text-red-600 hover:text-red-800 font-medium">
                Acessar Sucateamento →
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle>Gerenciamento</CardTitle>
              <CardDescription>Controle de setores</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm mb-4">Gerencie todos os setores cadastrados no sistema.</p>
              <Link to="/setores" className="text-gray-600 hover:text-gray-800 font-medium">
                Acessar Gerenciamento →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;
