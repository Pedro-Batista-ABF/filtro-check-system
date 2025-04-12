
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@/components/ui/dialog";
import { Eye, EyeOff, UserPlus } from "lucide-react";

interface UserRegistrationData {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

export default function UserRegistrationForm() {
  const [formData, setFormData] = useState<UserRegistrationData>({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, forneça um endereço de email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await registerUser(formData);
      if (success) {
        toast({
          title: "Usuário cadastrado com sucesso",
          description: `O usuário ${formData.username} foi cadastrado.`,
        });
        // Reset form data
        setFormData({
          fullName: "",
          email: "",
          username: "",
          password: "",
        });
        // Close dialog
        document.querySelector<HTMLButtonElement>("[data-dialog-close]")?.click();
      } else {
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível cadastrar o usuário. Verifique se o nome de usuário já existe.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Digite o nome completo"
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Digite o e-mail"
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">Nome de usuário (login)</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Digite o nome de usuário"
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Digite a senha"
            className="pr-10"
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
      
      <div className="flex justify-end gap-3 mt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancelar
          </Button>
        </DialogClose>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cadastrando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Cadastrar
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
