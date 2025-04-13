
/**
 * Handles common database errors and returns a more user-friendly error message
 */
export const handleDatabaseError = (error: any, defaultMessage: string): Error => {
  console.error(defaultMessage, error);
  
  // Handle specific error types
  if (error instanceof Error) {
    // Verificar por erros específicos
    const errorMessage = error.message.toLowerCase();
    
    // Erro de recursão infinita nas políticas RLS
    if (errorMessage.includes("infinite recursion")) {
      return new Error("Erro de configuração do banco de dados: problema de recursão infinita nas políticas de acesso. Por favor, tente novamente em alguns instantes.");
    }
    
    // Erro de violação de política RLS
    if (errorMessage.includes("violates row-level security policy")) {
      return new Error("Erro de permissão: você não tem autorização para realizar esta operação. Verifique se você está logado corretamente.");
    }
    
    // Erro de conexão
    if (errorMessage.includes("network") || errorMessage.includes("connection")) {
      return new Error("Erro de conexão com o servidor. Verifique sua conexão com a internet e tente novamente.");
    }
    
    // Erro de validação
    if (errorMessage.includes("validation") || errorMessage.includes("constraint")) {
      return new Error("Erro de validação: verifique se todos os campos foram preenchidos corretamente.");
    }
    
    // Se não for nenhum dos casos acima, retorna a mensagem original
    return error;
  }
  
  // Para erros desconhecidos
  return new Error(defaultMessage);
};
