
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  const navigate = useNavigate();
  
  if (!message) return null;
  
  // Criar mensagens mais amigáveis para erros comuns
  let displayMessage = message;
  let hint = "Se o erro persistir, entre em contato com o suporte técnico.";
  let showLoginButton = false;
  
  if (message.includes("auth/invalid-email")) {
    displayMessage = "E-mail inválido. Verifique o formato do e-mail informado.";
    hint = "Utilize um endereço de e-mail válido para autenticação.";
  } else if (message.includes("auth/user-not-found") || message.includes("auth/wrong-password")) {
    displayMessage = "Credenciais inválidas. E-mail ou senha incorretos.";
    hint = "Verifique seus dados de acesso ou use a opção 'Esqueci minha senha'.";
  } else if (message.includes("auth/email-already-in-use")) {
    displayMessage = "Este e-mail já está sendo utilizado por outra conta.";
    hint = "Tente usar outro e-mail ou faça login com este e-mail.";
  } else if (message.includes("auth/weak-password")) {
    displayMessage = "A senha escolhida é muito fraca.";
    hint = "Use uma senha mais forte, com pelo menos 6 caracteres.";
  } else if (message.includes("auth/requires-recent-login")) {
    displayMessage = "Esta operação requer login recente por motivos de segurança.";
    hint = "Faça logout e login novamente para continuar.";
  } else if (message.includes("infinite recursion")) {
    displayMessage = "Erro de configuração do banco de dados. Entre em contato com o suporte.";
    hint = "Este erro está relacionado às políticas de segurança do banco de dados.";
  } else if (message.includes("auth/network-request-failed") || message.includes("NetworkError")) {
    displayMessage = "Erro de conexão com o servidor.";
    hint = "Verifique sua conexão com a internet e tente novamente.";
  } else if (message.includes("row level security")) {
    displayMessage = "Erro de permissão: você não tem autorização para realizar esta operação.";
    hint = "Verifique se você está logado corretamente ou se possui as permissões necessárias.";
  } else if (message.includes("not authenticated") || message.includes("Não autenticado")) {
    displayMessage = "Você precisa estar logado para realizar esta operação.";
    hint = "Faça login para continuar.";
    showLoginButton = true;
  }
  
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro encontrado</AlertTitle>
      <AlertDescription>
        <p>{displayMessage}</p>
        <p className="text-sm mt-2">{hint}</p>
        {showLoginButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => navigate('/login')}
          >
            Ir para o login
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
