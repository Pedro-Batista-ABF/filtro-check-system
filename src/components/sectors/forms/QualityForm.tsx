
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Service } from "@/types";
import ServicesTabContent from "./quality/ServicesTabContent";
import ExitTabContent from "./quality/ExitTabContent";

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
  formErrors
}: QualityFormProps) {
  return (
    <div className="space-y-6">
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
