
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PeritagemEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = "Editar Peritagem - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Peritagem</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edição de Peritagem</CardTitle>
            <CardDescription>
              Edite os dados de peritagem do setor ID: {id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-4 text-center">
              <p>Formulário de edição de peritagem em implementação</p>
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

export default PeritagemEdit;
