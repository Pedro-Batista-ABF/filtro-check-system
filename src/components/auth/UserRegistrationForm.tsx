
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserRegistrationData {
  fullName: string;
  email: string;
}

export default function UserRegistrationForm() {
  const [formData, setFormData] = useState<UserRegistrationData>({
    fullName: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.fullName || !formData.email) {
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
      await registerUser(formData.email);
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Você receberá um email com o link de acesso.",
      });
      // Reset form data
      setFormData({
        fullName: "",
        email: "",
      });
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Digite seu nome completo"
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
          placeholder="Digite seu e-mail"
          disabled={isLoading}
          required
        />
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
            Cadastrando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Cadastrar
          </span>
        )}
      </Button>
    </form>
  );
}
