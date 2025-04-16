
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useConnectionAuth } from './useConnectionAuth';

interface PendingOperation {
  id: string;
  operation: 'update' | 'create' | 'delete';
  entityType: 'sector' | 'cycle' | 'service';
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const { connectionStatus } = useConnectionAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  
  // Carregar operações pendentes do localStorage
  useEffect(() => {
    const loadPendingOperations = () => {
      try {
        const stored = localStorage.getItem('pendingOperations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setPendingOperations(parsed);
            console.log(`Carregadas ${parsed.length} operações pendentes`);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar operações pendentes:", error);
      }
    };
    
    loadPendingOperations();
  }, []);
  
  // Salvar operações pendentes no localStorage quando houver mudanças
  useEffect(() => {
    if (pendingOperations.length > 0) {
      localStorage.setItem('pendingOperations', JSON.stringify(pendingOperations));
    } else {
      localStorage.removeItem('pendingOperations');
    }
  }, [pendingOperations]);
  
  // Tentar sincronizar quando a conexão for restaurada
  useEffect(() => {
    if (connectionStatus === 'online' && pendingOperations.length > 0 && !isSyncing) {
      syncPendingOperations();
    }
  }, [connectionStatus, pendingOperations, isSyncing]);
  
  // Função para adicionar uma operação pendente
  const addPendingOperation = (operation: Omit<PendingOperation, 'timestamp'>) => {
    const newOperation = {
      ...operation,
      timestamp: Date.now()
    };
    
    setPendingOperations(prev => {
      // Verificar se já existe uma operação para o mesmo item
      const existingIndex = prev.findIndex(op => 
        op.id === operation.id && op.entityType === operation.entityType
      );
      
      if (existingIndex >= 0) {
        // Substituir a operação existente (mais recente)
        const updated = [...prev];
        updated[existingIndex] = newOperation;
        return updated;
      } else {
        // Adicionar nova operação
        return [...prev, newOperation];
      }
    });
    
    toast.info("Operação armazenada para sincronização", {
      description: "Será processada quando a conexão for restabelecida"
    });
    
    return true;
  };
  
  // Função para sincronizar operações pendentes
  const syncPendingOperations = async () => {
    if (pendingOperations.length === 0 || isSyncing) return;
    
    setIsSyncing(true);
    toast.info(`Sincronizando ${pendingOperations.length} operações pendentes...`);
    
    // Ordenar operações por timestamp (mais antigas primeiro)
    const sortedOperations = [...pendingOperations].sort((a, b) => a.timestamp - b.timestamp);
    
    const successfulOps: string[] = [];
    const failedOps: string[] = [];
    
    for (const operation of sortedOperations) {
      try {
        // Aqui seria implementada a lógica para cada tipo de operação
        // Por exemplo, usar supabase para fazer update, create, delete
        
        // Simulação de sucesso para este exemplo
        console.log(`Processando operação: ${operation.operation} ${operation.entityType} ${operation.id}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular tempo de processamento
        
        // Se chegou até aqui, operação foi bem-sucedida
        successfulOps.push(operation.id);
      } catch (error) {
        console.error(`Erro ao sincronizar operação ${operation.id}:`, error);
        failedOps.push(operation.id);
      }
    }
    
    // Remover operações bem-sucedidas
    if (successfulOps.length > 0) {
      setPendingOperations(prev => 
        prev.filter(op => !successfulOps.includes(op.id))
      );
    }
    
    // Feedback para o usuário
    if (successfulOps.length > 0 && failedOps.length === 0) {
      toast.success(`${successfulOps.length} operações sincronizadas com sucesso`);
    } else if (successfulOps.length > 0 && failedOps.length > 0) {
      toast.warning(`${successfulOps.length} operações sincronizadas, ${failedOps.length} falharam`);
    } else if (failedOps.length > 0) {
      toast.error(`Falha ao sincronizar ${failedOps.length} operações`);
    }
    
    setIsSyncing(false);
  };
  
  return {
    pendingOperations,
    addPendingOperation,
    syncPendingOperations,
    isSyncing,
    hasPendingOperations: pendingOperations.length > 0
  };
}
