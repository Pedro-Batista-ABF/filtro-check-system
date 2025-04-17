
import React from 'react';
import { Service } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface QualityFormProps {
  exitInvoice: string;
  setExitInvoice: (value: string) => void;
  exitDate: Date | undefined;
  setExitDate: (date: Date | undefined) => void;
  exitObservations: string;
  setExitObservations: (value: string) => void;
  qualityCompleted: boolean;
  setQualityCompleted: (value: boolean) => void;
  services: Service[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  handleCameraCapture: (e: React.MouseEvent, serviceId?: string) => void;
}

export default function QualityForm({
  exitInvoice,
  setExitInvoice,
  exitDate,
  setExitDate,
  exitObservations,
  setExitObservations,
  qualityCompleted,
  setQualityCompleted,
  services,
  selectedTab,
  setSelectedTab,
  handlePhotoUpload,
  handleCameraCapture
}: QualityFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Checagem Final</CardTitle>
          <CardDescription>
            Registre as informações de saída e verifique a qualidade dos serviços executados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
            <p className="text-sm">
              <strong>Importante:</strong> Para cada serviço executado, registre pelo menos uma foto do
              resultado final. Isso permitirá a comparação com as fotos da peritagem.
            </p>
          </div>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="services-check">Serviços</TabsTrigger>
              <TabsTrigger value="exit-info">Dados de Saída</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services-check">
              <p>Serviços a serem verificados</p>
            </TabsContent>
            
            <TabsContent value="exit-info">
              <p>Informações de saída do setor</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
