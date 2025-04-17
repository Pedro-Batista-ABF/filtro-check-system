
import React, { useEffect } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function PeritagemEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    document.title = "Editar Peritagem - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editar Peritagem - ID: {id}</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/peritagem')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Conteúdo do formulário seria aqui */}
        <div className="bg-card p-6 rounded-md border">
          <p className="text-muted-foreground">
            Este é um componente placeholder para a página de edição de peritagem.
            O formulário real seria implementado aqui.
          </p>
        </div>
      </div>
    </PageLayoutWrapper>
  );
}
