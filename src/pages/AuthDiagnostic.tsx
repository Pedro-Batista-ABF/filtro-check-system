
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AuthDiagnostic = () => {
  const { user, session, isAuthenticated, refreshSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

  const runDiagnostics = async () => {
    setLoading(true);
    setTestStatus('running');
    setResults([]);
    
    try {
      // Teste 1: Verificar conexão com Supabase
      try {
        const start = Date.now();
        const { data, error } = await supabase.from('service_types').select('id').limit(1).maybeSingle();
        const end = Date.now();
        
        setResults(prev => [...prev, {
          name: 'Conexão com Supabase',
          status: error ? 'failed' : 'success',
          message: error ? `Erro: ${error.message}` : `Conectado (${end - start}ms)`,
          details: error || data
        }]);
      } catch (e: any) {
        setResults(prev => [...prev, {
          name: 'Conexão com Supabase',
          status: 'failed',
          message: `Erro: ${e.message}`,
          details: e
        }]);
      }
      
      // Teste 2: Verificar sessão atual
      try {
        const { data, error } = await supabase.auth.getSession();
        
        setResults(prev => [...prev, {
          name: 'Sessão atual',
          status: data.session ? 'success' : 'warning',
          message: data.session ? `Sessão válida (expira em ${new Date(data.session.expires_at * 1000).toLocaleString()})` : 'Nenhuma sessão ativa',
          details: data.session || error
        }]);
      } catch (e: any) {
        setResults(prev => [...prev, {
          name: 'Sessão atual',
          status: 'failed',
          message: `Erro: ${e.message}`,
          details: e
        }]);
      }
      
      // Teste 3: Verificar usuário atual
      try {
        const { data, error } = await supabase.auth.getUser();
        
        setResults(prev => [...prev, {
          name: 'Usuário atual',
          status: data.user ? 'success' : 'warning',
          message: data.user ? `Usuário: ${data.user.email}` : 'Nenhum usuário autenticado',
          details: data.user || error
        }]);
      } catch (e: any) {
        setResults(prev => [...prev, {
          name: 'Usuário atual',
          status: 'failed',
          message: `Erro: ${e.message}`,
          details: e
        }]);
      }

      // Teste 4: Estado do contexto de autenticação
      setResults(prev => [...prev, {
        name: 'Contexto AuthContext',
        status: isAuthenticated ? 'success' : 'warning',
        message: isAuthenticated 
          ? `Autenticado como ${user?.email}` 
          : 'Não autenticado no contexto',
        details: { user, session, isAuthenticated }
      }]);

      setTestStatus('completed');
    } catch (error: any) {
      console.error('Erro nos diagnósticos:', error);
      setTestStatus('failed');
      toast.error('Erro ao executar diagnósticos', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Executar diagnóstico automaticamente na montagem do componente
    runDiagnostics();
  }, []);

  const handleTryRefresh = async () => {
    setLoading(true);
    try {
      const refreshed = await refreshSession();
      toast.info(`Atualização de sessão: ${refreshed ? 'Sucesso' : 'Falha'}`);
      // Executar diagnóstico novamente após tentativa de refresh
      runDiagnostics();
    } catch (error: any) {
      toast.error('Erro ao atualizar sessão', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (status === 'failed') return <XCircle className="h-5 w-5 text-red-500" />;
    return null;
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Autenticação</CardTitle>
          <CardDescription>
            Verificação de problemas de autenticação e conexão com Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Executando diagnósticos...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(result.status)}
                      <h3 className="font-medium">{result.name}</h3>
                    </div>
                    <p className={`text-sm ${result.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-500 cursor-pointer">Detalhes técnicos</summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button 
            variant="outline" 
            onClick={runDiagnostics} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              'Executar diagnóstico novamente'
            )}
          </Button>
          <Button 
            onClick={handleTryRefresh} 
            disabled={loading}
          >
            Tentar atualizar sessão
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthDiagnostic;
