
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserCircle, Key, LogIn } from "lucide-react";
import { useApi } from "@/contexts/ApiContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UserRegistrationForm from "@/components/auth/UserRegistrationForm";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApi();
  const { toast } = useToast();
  
  // If user is already authenticated, redirect to home page
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Erro de validação",
        description: "Usuário e senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema.",
        });
        navigate("/");
      } else {
        toast({
          title: "Erro de autenticação",
          description: "Usuário ou senha incorretos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao realizar login",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-primary">Sistema de Recuperação de Filtros</CardTitle>
          <CardDescription>
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  autoComplete="username"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
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
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Entrar
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-sm text-blue-600 hover:text-blue-800">
                Cadastrar novo usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastro de Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para cadastrar um novo usuário no sistema.
                </DialogDescription>
              </DialogHeader>
              <UserRegistrationForm />
            </DialogContent>
          </Dialog>
          <p className="text-xs text-gray-500 mt-4 text-center">
            © {new Date().getFullYear()} Sistema de Recuperação de Filtros
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
