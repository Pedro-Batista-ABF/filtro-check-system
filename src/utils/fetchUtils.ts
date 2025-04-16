import { supabase, refreshAuthSession } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function fetchWithSession<T>(
  table: string, 
  query: (supabaseQuery: any) => any
): Promise<T[] | null> {
  try {
    // Primeiro verificar se há sessão
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session) {
      console.error("FetchUtils: Sem sessão ativa");
      toast.error("Erro de autenticação", {
        description: "Por favor, faça login novamente"
      });
      return null;
    }
    
    // Executar a consulta
    const { data, error } = await query(supabase.from(table as any));
    
    if (error) {
      console.error(`FetchUtils: Erro na consulta:`, error);
      throw error;
    }
    
    return data as T[];
  } catch (error: any) {
    console.error(`FetchUtils: Erro ao buscar dados:`, error);
    throw error;
  }
}

// Função para buscar um item por ID
export async function fetchById<T>(table: string, id: string): Promise<T | null> {
  try {
    const data = await fetchWithSession<T>(table, (query) => 
      query.select("*").eq("id", id).single()
    );
    
    return Array.isArray(data) ? data[0] as T : data as T;
  } catch (error) {
    console.error(`FetchUtils: Erro ao buscar item por ID (${id}) na tabela ${table}:`, error);
    return null;
  }
}

// Função para salvar dados com sessão válida
export async function saveWithSession<T>(
  table: string,
  data: any,
  id?: string
): Promise<T | null> {
  try {
    // Verificar e atualizar a sessão
    await refreshAuthSession();
    
    if (id) {
      // Atualizar registro existente
      const { data: updatedData, error } = await supabase
        .from(table as any)
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData as T;
    } else {
      // Inserir novo registro
      const { data: insertedData, error } = await supabase
        .from(table as any)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return insertedData as T;
    }
  } catch (error: any) {
    console.error(`FetchUtils: Erro ao salvar dados na tabela ${table}:`, error);
    
    // Se for erro de autenticação, tentar refresh e nova tentativa
    if (error.code === "PGRST301" || error.code === 401) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        // Tentar salvar novamente após refresh
        return saveWithSession(table, data, id);
      }
    }
    
    throw error;
  }
}

// Função para adicionar log de resultado para monitorar resultados
export function logResultados(
  operacao: string, 
  tabela: string, 
  resultado: any, 
  tempoInicio: number
) {
  const tempoDecorrido = Date.now() - tempoInicio;
  const tamanhoResultado = Array.isArray(resultado) ? resultado.length : 1;
  
  console.log(`[${new Date().toISOString()}] ${operacao} em ${tabela} - Tempo: ${tempoDecorrido}ms, Registros: ${tamanhoResultado}`);
  
  return resultado;
}
