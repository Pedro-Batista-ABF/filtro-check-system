
import { supabase, refreshAuthSession } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Função genérica para fetch seguro com Supabase
export async function fetchWithSession<T>(
  table: string, 
  query: (supabaseQuery: any) => any
): Promise<T[] | null> {
  try {
    // Primeiro, verificar e atualizar a sessão se necessário
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session?.user) {
      console.error("FetchUtils: Nenhuma sessão ativa para buscar dados");
      
      // Tentar atualizar a sessão automaticamente
      const refreshed = await refreshAuthSession();
      if (!refreshed) {
        toast.error("Erro de autenticação", {
          description: "Sem sessão ativa. Por favor, faça login novamente."
        });
        return null;
      }
    }
    
    // Executar a consulta personalizada
    const { data, error } = await query(supabase.from(table));
    
    if (error) {
      // Se for erro 401, tentar refresh do token
      if (error.code === "PGRST301" || error.code === 401) {
        const refreshed = await refreshAuthSession();
        if (refreshed) {
          // Tentar novamente após refresh
          const { data: refreshedData, error: refreshedError } = await query(supabase.from(table));
          
          if (refreshedError) {
            throw refreshedError;
          }
          
          return refreshedData;
        } else {
          throw new Error("Erro de autenticação persistente. Por favor, faça login novamente.");
        }
      } else {
        throw error;
      }
    }
    
    return data;
  } catch (error: any) {
    console.error(`FetchUtils: Erro ao buscar dados da tabela ${table}:`, error);
    throw error;
  }
}

// Função para buscar um item por ID
export async function fetchById<T>(table: string, id: string): Promise<T | null> {
  try {
    const data = await fetchWithSession<T>(table, (query) => 
      query.select("*").eq("id", id).single()
    );
    
    return Array.isArray(data) ? data[0] : data;
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
        .from(table)
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
    } else {
      // Inserir novo registro
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return insertedData;
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
