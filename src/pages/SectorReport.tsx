
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Mail } from "lucide-react";
import SectorDetails from "@/components/sectors/SectorDetails";
import { toast } from "sonner";

export default function SectorReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  
  const sector = id ? getSectorById(id) : undefined;

  if (!sector) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">Setor não encontrado</h1>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4"
            variant="outline"
          >
            Voltar para Início
          </Button>
        </div>
      </PageLayout>
    );
  }

  const handlePrint = () => {
    toast.success('Relatório enviado para impressão');
    window.print();
  };

  const handleEmail = () => {
    toast.success('Relatório enviado por e-mail');
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">Relatório do Setor</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleEmail}
              className="flex items-center"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar por E-mail
            </Button>
            <Button 
              onClick={handlePrint}
              className="flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
        
        <SectorDetails sector={sector} />
      </div>
    </PageLayout>
  );
}
