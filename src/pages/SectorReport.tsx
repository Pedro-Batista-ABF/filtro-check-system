
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Mail, FileText, History } from "lucide-react";
import SectorDetails from "@/components/sectors/SectorDetails";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SectorReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [activeTab, setActiveTab] = useState<string>("current");
  
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

  const hasPreviousCycles = sector.previousCycles && sector.previousCycles.length > 0;

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
              onClick={() => navigate('/relatorios')}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatório Consolidado
            </Button>
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
        
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            TAG: {sector.tagNumber}
          </h2>
          {sector.cycleCount > 1 && (
            <Badge variant="outline" className="text-sm bg-blue-50">
              <History className="h-3 w-3 mr-1" />
              Ciclo {sector.cycleCount} de {sector.cycleCount}
            </Badge>
          )}
          
          {sector.outcome && (
            <Badge className={`${
              sector.outcome === 'Recuperado' ? 'bg-green-100 text-green-800 border-green-200' :
              sector.outcome === 'Sucateado' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              {sector.outcome}
            </Badge>
          )}
        </div>
        
        {hasPreviousCycles ? (
          <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="current">Ciclo Atual</TabsTrigger>
              <TabsTrigger value="history">Histórico de Ciclos ({sector.previousCycles?.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              <SectorDetails sector={sector} />
            </TabsContent>
            
            <TabsContent value="history">
              <div className="space-y-6">
                {sector.previousCycles?.map((cycle, index) => (
                  <Card key={cycle.id} className="overflow-hidden">
                    <CardHeader className={`pb-2 ${
                      cycle.outcome === 'Recuperado' ? 'bg-green-50' : 
                      cycle.outcome === 'Sucateado' ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          Ciclo {index + 1} 
                          <Badge className="ml-3 text-xs" variant={
                            cycle.outcome === 'Recuperado' ? 'default' : 
                            cycle.outcome === 'Sucateado' ? 'destructive' : 'secondary'
                          }>
                            {cycle.outcome}
                          </Badge>
                        </CardTitle>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {format(new Date(cycle.entryDate), "dd/MM/yyyy", { locale: ptBR })}
                            {cycle.exitDate && ` → ${format(new Date(cycle.exitDate), "dd/MM/yyyy", { locale: ptBR })}`}
                            {cycle.scrapReturnDate && ` → ${format(new Date(cycle.scrapReturnDate), "dd/MM/yyyy", { locale: ptBR })}`}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 text-sm space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Informações do Ciclo</h4>
                          <p>NF Entrada: {cycle.entryInvoice}</p>
                          {cycle.exitInvoice && <p>NF Saída: {cycle.exitInvoice}</p>}
                          {cycle.scrapReturnInvoice && <p>NF Devolução: {cycle.scrapReturnInvoice}</p>}
                        </div>
                        
                        <div>
                          {cycle.outcome === 'Recuperado' && cycle.completedServices && cycle.completedServices.length > 0 && (
                            <>
                              <h4 className="font-medium">Serviços Executados</h4>
                              <ul className="list-disc list-inside pl-2">
                                {cycle.services
                                  .filter(s => s.selected && cycle.completedServices?.includes(s.id))
                                  .map(service => (
                                    <li key={service.id}>
                                      {service.name} {service.quantity ? `(${service.quantity})` : ''}
                                    </li>
                                  ))
                                }
                              </ul>
                            </>
                          )}
                          
                          {cycle.outcome === 'Sucateado' && cycle.scrapObservations && (
                            <>
                              <h4 className="font-medium">Motivo do Sucateamento</h4>
                              <p>{cycle.scrapObservations}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <SectorDetails sector={sector} />
        )}
      </div>
    </PageLayout>
  );
}
