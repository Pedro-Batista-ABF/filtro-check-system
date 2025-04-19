
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Bug, RotateCcw } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se já estiver autenticado, redirecionar para a página inicial
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log("LoginPage: Tentando login com", email);
      
      // Verificar se signIn está disponível
      if (typeof signIn !== 'function') {
        console.error("LoginPage: signIn não é uma função válida", signIn);
        throw new Error('Erro interno: método de login não disponível');
      }
      
      await signIn(email, password);
      console.log("LoginPage: Login bem-sucedido");
      navigate('/');
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setError(error.message || "Falha ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const goToDiagnostic = () => {
    navigate('/auth-diagnostic');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Entre com seu email e senha para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{error}</p>
                <div className="flex mt-2 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setError('')}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={goToDiagnostic}
                  >
                    <Bug className="h-4 w-4 mr-1" />
                    Diagnóstico
                  </Button>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Entrando...</span>
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Entrar
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-center text-gray-500">
              Sistema de Controle de Filtros
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="text-gray-500"
              onClick={goToDiagnostic}
            >
              <Bug className="h-4 w-4 mr-1" />
              Problemas de login? Executar diagnóstico
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
