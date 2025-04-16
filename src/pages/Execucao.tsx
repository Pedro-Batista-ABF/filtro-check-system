
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ConnectionStatus from '@/components/peritagem/ConnectionStatus';
import { useConnectionAuth } from '@/hooks/useConnectionAuth';

export default function Execucao() {
  const { connectionStatus, handleRetryConnection } = useConnectionAuth();
  
  const HeaderExtra = (
    <ConnectionStatus 
      status={connectionStatus} 
      onRetryConnection={handleRetryConnection} 
      showDetails={true}
    />
  );
  
  return (
    <PageLayout HeaderExtra={HeaderExtra}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Execução</h1>
        </div>
        
        <div className="p-4 border rounded-md bg-gray-50">
          <p>Nenhum setor em execução</p>
        </div>
      </div>
    </PageLayout>
  );
}
