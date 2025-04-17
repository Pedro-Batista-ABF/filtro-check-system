
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface ScrapToggleProps {
  isScrap: boolean;
  setIsScrap: (value: boolean) => void;
  scrapObservations: string;
  setScrapObservations: (value: string) => void;
  error?: {
    observations?: boolean;
    photos?: boolean;
  };
  disabled?: boolean;
}

const ScrapToggle: React.FC<ScrapToggleProps> = ({
  isScrap,
  setIsScrap,
  scrapObservations,
  setScrapObservations,
  error = {},
  disabled = false,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          Opção de Sucateamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="scrap-toggle" 
              checked={isScrap} 
              onCheckedChange={setIsScrap}
              disabled={disabled}
            />
            <Label htmlFor="scrap-toggle" className="font-medium">
              Marcar este setor como sucateado
            </Label>
          </div>
          
          {isScrap && (
            <div className="space-y-4 pl-6 pt-2">
              <div className="space-y-2">
                <Label 
                  htmlFor="scrap-observations" 
                  className={`text-sm ${error.observations ? 'text-red-500' : ''}`}
                >
                  Motivo do sucateamento*
                </Label>
                <Textarea
                  id="scrap-observations"
                  value={scrapObservations}
                  onChange={(e) => setScrapObservations(e.target.value)}
                  placeholder="Descreva o motivo pelo qual este setor não pode ser recuperado..."
                  className={`resize-none ${error.observations ? 'border-red-500' : ''}`}
                  disabled={disabled}
                />
                {error.observations && (
                  <p className="text-xs text-red-500">O motivo do sucateamento é obrigatório</p>
                )}
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mt-2">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Ao marcar um setor como sucateado, ele será enviado para validação
                  da equipe responsável e não poderá ser processado para recuperação.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapToggle;
