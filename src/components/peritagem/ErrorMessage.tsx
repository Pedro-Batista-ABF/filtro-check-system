
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro encontrado</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <p className="text-sm mt-2">
          Se o erro persistir, entre em contato com o suporte técnico.
        </p>
      </AlertDescription>
    </Alert>
  );
}
