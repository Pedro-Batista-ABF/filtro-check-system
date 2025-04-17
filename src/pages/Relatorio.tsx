
import React, { useEffect } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Relatorio() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Relatórios - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Geração de Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Selecione os setores para gerar um relatório consolidado com fotos comparativas.
            </p>
            
            {/* Aqui entraria a lista de setores ou formulário de geração de relatório */}
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <p className="text-gray-500">Componente de relatório será implementado aqui.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
