
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Autenticação automática - simplesmente redireciona para a página principal
    toast.success("Login automático realizado com sucesso");
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Redirecionando...</h1>
          <p className="mt-2 text-sm text-gray-600">
            Você será redirecionado para a página principal automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
