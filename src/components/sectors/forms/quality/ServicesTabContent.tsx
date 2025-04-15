
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Service } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input"; // Added missing import

interface ServicesTabContentProps {
  services: Service[];
  formErrors: {
    photos?: boolean;
  };
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
}

export default function ServicesTabContent({
  services,
  formErrors,
  handlePhotoUpload
}: ServicesTabContentProps) {
  const isMobile = useIsMobile();
  const selectedServices = services.filter(service => service.selected);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificação dos Serviços</CardTitle>
        {formErrors.photos && (
          <p className="text-sm text-red-500">É necessário adicionar pelo menos uma foto para cada serviço</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedServices.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhum serviço foi selecionado para este setor.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {selectedServices.map((service) => (
              <AccordionItem key={service.id} value={service.id}>
                <AccordionTrigger className="hover:bg-gray-50 px-3 py-3 rounded-md">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-sm text-gray-500">
                      Quantidade: {service.quantity || 1}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pt-3 pb-1">
                  <div className="space-y-4">
                    <div>
                      <Label>Fotos do Serviço Executado</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="w-full"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handlePhotoUpload(service.id, e.target.files, "after");
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    {service.observations && (
                      <div>
                        <Label>Observações</Label>
                        <p className="mt-1 text-sm">{service.observations}</p>
                      </div>
                    )}
                    
                    <div className="mb-2">
                      <Label className="mb-2 block">Fotos da Peritagem</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {service.photos?.filter(p => p.type === "before").map((photo) => (
                          <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden">
                            <img 
                              src={photo.url} 
                              alt="Foto da peritagem" 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                        {service.photos?.filter(p => p.type === "before").length === 0 && (
                          <p className="text-sm text-gray-500 col-span-full">Nenhuma foto registrada na peritagem</p>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
