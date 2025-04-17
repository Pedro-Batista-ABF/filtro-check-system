
import React, { useEffect } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Relatorio() {
  useEffect(() => {
    document.title = "Relatórios - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Relatórios</h1>
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
              Nesta página você pode gerar relatórios consolidados para múltiplos setores.
              Selecione os setores finalizados e o sistema irá gerar um único PDF com todas as informações.
            </p>
            
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto h-16 w-16 mb-4 opacity-30" />
              <p>Funcionalidade em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
