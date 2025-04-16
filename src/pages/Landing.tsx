
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Sistema de Recuperação de Filtros</h1>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
            >
              Entrar
            </Button>
            <Button 
              onClick={() => navigate('/register')}
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Controle de Recuperação de Setores de Filtros</h2>
          <p className="text-xl text-gray-600">
            Gerencie o fluxo completo de recuperação, desde a peritagem até a checagem final
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Peritagem</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Registre os setores, suas condições iniciais e os serviços necessários para recuperação.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Acompanhe a execução dos serviços e registre a conclusão do trabalho.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Checagem Final</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Verifique os serviços executados e registre a finalização de todo o processo.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/login')}>
            Comece Agora
          </Button>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-6">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Sistema de Recuperação de Filtros</p>
        </div>
      </footer>
    </div>
  );
}
