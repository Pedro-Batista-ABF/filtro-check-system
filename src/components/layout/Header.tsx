
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Filter, ClipboardCheck, CheckSquare, Home, FileText, AlertTriangle, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  HeaderExtra?: React.ReactNode;
}

export default function Header({ HeaderExtra }: HeaderProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) ? "bg-primary/20" : "";
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Filter className="h-6 w-6" />
          <span className="text-xl font-bold">Controle de Setores - ABF</span>
        </Link>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-1">
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/')}`}
            asChild
          >
            <Link to="/" className="flex items-center space-x-1">
              <Home className="h-4 w-4" />
              <span>Início</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/peritagem')}`}
            asChild
          >
            <Link to="/peritagem" className="flex items-center space-x-1">
              <ClipboardCheck className="h-4 w-4" />
              <span>Peritagem</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/execucao')}`}
            asChild
          >
            <Link to="/execucao" className="flex items-center space-x-1">
              <Settings className="h-4 w-4" />
              <span>Execução</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/checagem')}`}
            asChild
          >
            <Link to="/checagem" className="flex items-center space-x-1">
              <CheckSquare className="h-4 w-4" />
              <span>Qualidade</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/sucateamento')}`}
            asChild
          >
            <Link to="/sucateamento" className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4" />
              <span>Sucateamento</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/relatorio')}`}
            asChild
          >
            <Link to="/relatorio" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Relatórios</span>
            </Link>
          </Button>
        </nav>
        
        {/* User Menu */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 flex items-center gap-2 text-white">
                <Avatar className="h-8 w-8 bg-white text-primary">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email?.split('@')[0] || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden ml-4 bg-primary-foreground/10 rounded p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu de navegação"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-primary-foreground/10 p-4">
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 py-2 px-4 rounded ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>Início</span>
            </Link>
            <Link 
              to="/peritagem" 
              className={`flex items-center space-x-2 py-2 px-4 rounded ${isActive('/peritagem')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <ClipboardCheck className="h-5 w-5" />
              <span>Peritagem</span>
            </Link>
            <Link 
              to="/execucao" 
              className={`flex items-center space-x-2 py-2 px-4 rounded ${isActive('/execucao')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>Execução</span>
            </Link>
            <Link 
              to="/checagem" 
              className={`flex items-center space-x-2 py-2 px-4 rounded ${isActive('/checagem')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <CheckSquare className="h-5 w-5" />
              <span>Qualidade</span>
            </Link>
            <Link 
              to="/sucateamento" 
              className={`flex items-center space-x-2 py-2 px-4 rounded ${isActive('/sucateamento')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <AlertTriangle className="h-5 w-5" />
              <span>Sucateamento</span>
            </Link>
            <Link 
              to="/relatorio" 
              className={`flex items-center space-x-2 py-2 px-4 rounded ${isActive('/relatorio')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText className="h-5 w-5" />
              <span>Relatórios</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
