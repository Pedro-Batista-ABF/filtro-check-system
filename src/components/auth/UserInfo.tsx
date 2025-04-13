
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserInfo() {
  const { user, logout, getUserMetadata } = useAuth();
  const navigate = useNavigate();
  const userMetadata = getUserMetadata();

  if (!user) {
    // Se não houver usuário, renderiza um botão de login
    return (
      <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
        <User className="h-4 w-4 mr-2" />
        <span>Login</span>
      </Button>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = userMetadata.fullName || userMetadata.email || 'Usuário';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-foreground">
          <User className="h-4 w-4" />
          <span className="md:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <User className="h-4 w-4" />
          <span>{userMetadata.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
