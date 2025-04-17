
import { useEffect } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PeritagemNew = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Nova Peritagem - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Nova Peritagem</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Peritagem</CardTitle>
            <CardDescription>
              Registre um novo setor para peritagem, incluindo dados básicos e fotos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-4 text-center">
              <p>Formulário de peritagem em implementação</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate("/peritagem")}
              >
                Voltar para lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
};

export default PeritagemNew;
