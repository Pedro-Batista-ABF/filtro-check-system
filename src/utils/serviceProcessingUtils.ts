
import { Service } from "@/types";
import { toast } from "sonner";

export const createProcessedService = (service: Service): Service => ({
  id: service.id,
  name: service.name,
  selected: false,
  type: service.type || service.id as any,
  photos: [],
  quantity: 1
});

export const handleServiceError = (error: unknown): Service[] => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("ServiceProcessingUtils: Erro ao processar serviços:", error);
  
  if (errorMessage.includes("fetch failed") || errorMessage.includes("NetworkError")) {
    toast.error("Erro de conexão com o servidor", {
      description: "Não foi possível estabelecer conexão com o servidor. Verifique sua conexão de internet e tente novamente."
    });
  } else if (errorMessage.includes("JSON")) {
    toast.error("Erro ao processar resposta do servidor", {
      description: "Os dados recebidos do servidor estão corrompidos. Tente novamente mais tarde."
    });
  } else if (errorMessage.includes("undefined") || errorMessage.includes("null")) {
    toast.error("Erro de dados", {
      description: "Os dados necessários não foram encontrados. Tente novamente mais tarde."
    });
  } else {
    toast.error("Erro ao carregar serviços", {
      description: "Ocorreu um erro inesperado. Tente novamente em alguns instantes."
    });
  }
  
  return [];
};

export const logServiceLoadTime = (startTime: number) => {
  const elapsedTime = Date.now() - startTime;
  console.log(`ServiceProcessingUtils: 🔥 Carregamento de serviços finalizado em ${elapsedTime}ms`);
};
