
import { Service, ServiceType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const validateSession = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session?.user?.id) {
    console.error("ServiceUtils: UID ausente na validação de sessão");
    throw new Error("Usuário não autenticado");
  }
  return sessionData.session.user.id;
};

export const createProcessedService = (service: Service): Service => ({
  id: service.id,
  name: service.name,
  selected: false,
  type: service.id as ServiceType,
  photos: [],
  quantity: 1
});

export const handleServiceError = (error: unknown): Service[] => {
  console.error("ServiceUtils: Erro ao processar serviços:", error);
  toast.error("Erro ao carregar serviços", {
    description: "Tente novamente em alguns instantes."
  });
  return [];
};

export const logServiceLoadTime = (startTime: number) => {
  const elapsedTime = Date.now() - startTime;
  console.log(`ServiceUtils: 🔥 Carregamento de serviços finalizado em ${elapsedTime}ms`);
};
