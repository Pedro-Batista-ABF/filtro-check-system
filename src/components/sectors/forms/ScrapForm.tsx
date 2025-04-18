
import React, { useRef, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ImageIcon, Camera, AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PhotoWithFile } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScrapFormProps {
  tagNumber: string;
  setTagNumber: (value: string) => void;
  entryInvoice: string;
  setEntryInvoice: (value: string) => void;
  entryDate?: Date;
  setEntryDate: (date: Date | undefined) => void;
  tagPhotoUrl?: string;
  handleTagPhotoUpload: (files: FileList) => void;
  scrapObservations: string;
  setScrapObservations: (value: string) => void;
  scrapDate?: Date;
  setScrapDate: (date: Date | undefined) => void;
  scrapInvoice: string;
  setScrapInvoice: (value: string) => void;
  scrapPhotos: PhotoWithFile[];
  handleScrapPhotoUpload: (files: FileList) => void;
  formErrors: {
    tagNumber?: boolean;
    tagPhoto?: boolean;
    entryInvoice?: boolean;
    entryDate?: boolean;
    scrapObservations?: boolean;
    scrapDate?: boolean;
    scrapInvoice?: boolean;
    scrapPhotos?: boolean;
  };
  onCameraCapture: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const ScrapForm: React.FC<ScrapFormProps> = ({
  tagNumber,
  setTagNumber,
  entryInvoice,
  setEntryInvoice,
  entryDate,
  setEntryDate,
  tagPhotoUrl,
  handleTagPhotoUpload,
  scrapObservations,
  setScrapObservations,
  scrapDate,
  setScrapDate,
  scrapInvoice,
  setScrapInvoice,
  scrapPhotos,
  handleScrapPhotoUpload,
  formErrors,
  onCameraCapture,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleClick = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoError(null);
      try {
        handleScrapPhotoUpload(e.target.files);
      } catch (error) {
        console.error("Erro ao processar fotos:", error);
        setPhotoError("Erro ao processar as fotos. Tente novamente.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validação para Sucateamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Informações do Setor</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>TAG:</strong> {tagNumber || "N/A"}</div>
                <div><strong>NF Entrada:</strong> {entryInvoice || "N/A"}</div>
                <div><strong>Data Entrada:</strong> {entryDate ? format(entryDate, "dd/MM/yyyy") : "N/A"}</div>
              </div>
              {tagPhotoUrl && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Foto da TAG:</p>
                  <img 
                    src={tagPhotoUrl} 
                    alt="Foto da TAG" 
                    className="h-20 w-auto object-cover rounded-md border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Motivo do Sucateamento*</h3>
              <Textarea
                id="scrapObservations"
                value={scrapObservations}
                onChange={(e) => setScrapObservations(e.target.value)}
                placeholder="Adicione o motivo pelo qual este setor deve ser sucateado..."
                className={cn(formErrors.scrapObservations ? "border-red-500" : "", "min-h-[100px]")}
                disabled={disabled}
              />
              {formErrors.scrapObservations && (
                <p className="text-xs text-red-500 mt-1">Motivo do sucateamento é obrigatório</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Fotos do Estado de Sucateamento*</h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {scrapPhotos.map((photo, index) => (
                  <div key={photo.id || `temp-${index}`} className="relative">
                    <img
                      src={photo.url || (photo.file ? URL.createObjectURL(photo.file) : '')}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                        console.error(`Erro ao carregar imagem ${photo.url || 'file'}`);
                      }}
                    />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-24 border-dashed flex flex-col items-center justify-center"
                  onClick={handleClick}
                  disabled={disabled}
                >
                  <ImageIcon className="h-6 w-6 mb-1" />
                  <span className="text-xs">Adicionar foto</span>
                </Button>
              </div>
              
              <div className="flex space-x-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCameraCapture}
                  disabled={disabled}
                  className="text-xs"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Usar câmera
                </Button>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                multiple
                disabled={disabled}
              />
              
              {formErrors.scrapPhotos && (
                <p className="text-xs text-red-500 mt-1">
                  É necessário adicionar pelo menos uma foto do estado de sucateamento
                </p>
              )}
              
              {photoError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {photoError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="scrapInvoice" className={formErrors.scrapInvoice ? "text-red-500" : ""}>
                  Nota Fiscal de Devolução*
                </Label>
                <Input
                  id="scrapInvoice"
                  value={scrapInvoice}
                  onChange={(e) => setScrapInvoice(e.target.value)}
                  placeholder="Ex: NF-54321"
                  className={formErrors.scrapInvoice ? "border-red-500" : ""}
                  disabled={disabled}
                />
                {formErrors.scrapInvoice && (
                  <p className="text-xs text-red-500">Nota fiscal é obrigatória</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scrapDate" className={formErrors.scrapDate ? "text-red-500" : ""}>
                  Data de Devolução*
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="scrapDate"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scrapDate && "text-muted-foreground",
                        formErrors.scrapDate && "border-red-500"
                      )}
                      disabled={disabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scrapDate ? format(scrapDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scrapDate}
                      onSelect={setScrapDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.scrapDate && (
                  <p className="text-xs text-red-500">Data é obrigatória</p>
                )}
              </div>
            </div>
          </div>
          
          <Alert className="mt-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-800" />
            <AlertDescription className="text-yellow-800">
              Ao validar o sucateamento, o setor será <strong>permanentemente</strong> marcado como sucateado no sistema.
            </AlertDescription>
          </Alert>
          
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <FileText className="h-4 w-4 text-blue-800" />
            <AlertDescription className="text-blue-800">
              Certifique-se de que todos os dados estão corretos antes de validar. Esta ação não pode ser desfeita.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default ScrapForm;
