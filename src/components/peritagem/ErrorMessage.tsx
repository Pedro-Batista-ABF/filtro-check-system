
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Camera, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  let showTagPhotoHelp = false;
  let showReloadButton = false;
  
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
  } else if (message.includes("not authenticated") || message.includes("Não autenticado") || message.includes("precisa estar logado")) {
    displayMessage = "Você precisa estar logado para realizar esta operação.";
    hint = "Faça login novamente para continuar.";
    showLoginButton = true;
  } else if (message.includes("foto da TAG") || message.includes("TAG é obrigatória") || message.includes("TAG não encontrada") || message.includes("TAG inválida") || message.includes("Foto do TAG")) {
    displayMessage = "Foto do TAG não encontrada ou inválida.";
    hint = "Certifique-se de fazer o upload da foto do TAG antes de prosseguir. A foto é obrigatória para registro do setor.";
    showTagPhotoHelp = true;
    showReloadButton = true;
  } else if (message.includes("blob:") || message.includes("processada")) {
    displayMessage = "Erro no processamento da foto do TAG.";
    hint = "A foto do TAG precisa ser processada corretamente. Tente fazer o upload novamente.";
    showTagPhotoHelp = true;
    showReloadButton = true;
  }
  
  const handleLoginClick = async () => {
    // Fazer logout antes de redirecionar para o login
    await supabase.auth.signOut();
    toast.info("Redirecionando para a página de login", {
      description: "Por favor, faça login para continuar."
    });
    navigate('/login');
  };
  
  const handleReloadClick = () => {
    // Recarregar a página para limpar qualquer estado problemático
    window.location.reload();
  };
  
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro encontrado</AlertTitle>
      <AlertDescription>
        <p>{displayMessage}</p>
        <p className="text-sm mt-2">{hint}</p>
        
        {showTagPhotoHelp && (
          <div className="mt-3 p-3 bg-red-100 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-4 w-4" />
              <span className="font-medium">Dicas para foto do TAG:</span>
            </div>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Certifique-se de fazer o upload de uma foto válida do TAG</li>
              <li>A imagem deve estar nos formatos JPG, PNG ou GIF</li>
              <li>Aguarde o upload completo da foto antes de continuar</li>
              <li>Se mesmo após fazer o upload corretamente o erro persistir, recarregue a página e tente novamente</li>
              <li>Verifique se a foto mostra claramente o TAG do setor</li>
            </ul>
          </div>
        )}
        
        <div className="flex space-x-2 mt-3">
          {showLoginButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLoginClick}
            >
              Ir para o login
            </Button>
          )}
          
          {showReloadButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReloadClick}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Recarregar página
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
