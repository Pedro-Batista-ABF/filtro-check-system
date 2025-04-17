
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Service } from "@/types";
import ServicesTabContent from "./quality/ServicesTabContent";
import ExitTabContent from "./quality/ExitTabContent";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface QualityFormProps {
  services: Service[];
  selectedTab: string;
  setSelectedTab: (value: string) => void;
  exitDate: Date | undefined;
  setExitDate: (date: Date | undefined) => void;
  exitInvoice: string;
  setExitInvoice: (value: string) => void;
  exitObservations: string;
  setExitObservations: (value: string) => void;
  qualityCompleted: boolean;
  setQualityCompleted: (value: boolean) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  formErrors: {
    photos?: boolean;
    exitDate?: boolean;
    exitInvoice?: boolean;
    exitObservations?: boolean;
  };
  hasAfterPhotosForAllServices: boolean;
}

export default function QualityForm({
  services,
  selectedTab,
  setSelectedTab,
  exitDate,
  setExitDate,
  exitInvoice,
  setExitInvoice,
  exitObservations,
  setExitObservations,
  qualityCompleted,
  setQualityCompleted,
  handlePhotoUpload,
  formErrors,
  hasAfterPhotosForAllServices
}: QualityFormProps) {
  const hasErrors = Object.values(formErrors).some(Boolean) || !hasAfterPhotosForAllServices;

  return (
    <div className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            <p>Por favor, verifique os seguintes requisitos para concluir a checagem:</p>
            <ul className="list-disc ml-5 mt-2">
              {formErrors.exitInvoice && <li>Nota Fiscal de Saída é obrigatória</li>}
              {formErrors.exitDate && <li>Data de Saída é obrigatória</li>}
              {(formErrors.photos || !hasAfterPhotosForAllServices) && <li>Todos os serviços precisam de pelo menos uma foto "DEPOIS"</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="exit">Saída do Setor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <ServicesTabContent 
            services={services}
            formErrors={formErrors}
            handlePhotoUpload={handlePhotoUpload}
          />
        </TabsContent>
        
        <TabsContent value="exit">
          <ExitTabContent 
            exitDate={exitDate}
            setExitDate={setExitDate}
            exitInvoice={exitInvoice}
            setExitInvoice={setExitInvoice}
            exitObservations={exitObservations}
            setExitObservations={setExitObservations}
            qualityCompleted={qualityCompleted}
            setQualityCompleted={setQualityCompleted}
            formErrors={formErrors}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
