
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SucateamentoDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = "Detalhes de Sucateamento - Gestão de Recuperação";
  }, []);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes de Sucateamento</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Sucateamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-4">
              <h2 className="text-lg font-medium mb-2">Setor ID: {id}</h2>
              <p className="text-muted-foreground mb-4">
                Detalhes do processo de sucateamento
              </p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/sucateamento")}
                >
                  Voltar para lista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
};

export default SucateamentoDetails;
