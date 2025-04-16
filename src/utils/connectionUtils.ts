
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const startTime = Date.now();
    console.log("ConnectionUtils: Verificando conexão com Supabase...");
    
    const timeoutMs = 8000;
    
    // Primeiro, tentar uma conexão mais leve
    try {
      const response = await fetch(
        `https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/`,
        {
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4'
          },
          signal: AbortSignal.timeout(timeoutMs),
        }
      );
      
      if (!response.ok) {
        console.error(`ConnectionUtils: Falha na conexão HTTP simples: ${response.status}`);
        return false;
      }
      
      console.log(`ConnectionUtils: Conexão HTTP simples OK após ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error("ConnectionUtils: Erro na verificação HTTP simples:", error);
      return false;
    }
    
    // Se a verificação HTTP passou, tentar uma query real
    try {
      // Tentamos apenas uma query HEAD para checar permissão de acesso
      // Sem precisar de uma sessão autenticada
      const response = await fetch(
        `https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/service_types?select=count`,
        {
          method: 'HEAD',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(timeoutMs),
        }
      );
      
      const elapsedTime = Date.now() - startTime;
      
      if (!response.ok) {
        console.error(`ConnectionUtils: Erro de conexão com Supabase após ${elapsedTime}ms:`, response.status);
        toast.error("Erro de conexão", {
          description: `Não foi possível conectar ao banco de dados. Status: ${response.status}`
        });
        return false;
      }
      
      console.log(`ConnectionUtils: Conexão com Supabase OK em ${elapsedTime}ms`);
      return true;
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(`ConnectionUtils: Falha na query do Supabase após ${elapsedTime}ms:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("timeout") || errorMessage.includes("abort")) {
        toast.error("Tempo limite excedido", {
          description: "O servidor está demorando muito para responder. Tente novamente mais tarde."
        });
      } else {
        toast.error("Erro de conexão", {
          description: `Falha ao comunicar com o servidor: ${errorMessage}`
        });
      }
      
      return false;
    }
  } catch (error) {
    console.error("ConnectionUtils: Erro crítico ao verificar conexão:", error);
    toast.error("Erro crítico de conexão", {
      description: "Ocorreu um erro interno ao verificar a conexão com o servidor."
    });
    return false;
  }
};

// Função adicional para verificar conexão com internet (sem depender do Supabase)
export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    // Usar um serviço confiável e rápido para verificar conexão
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000)
    });
    
    return true; // Se não lançou exceção, temos conexão
  } catch (error) {
    console.error("Erro ao verificar conexão com internet:", error);
    return false;
  }
};
