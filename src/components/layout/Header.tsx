
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Filter, ClipboardCheck, CheckSquare, Home, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  HeaderExtra?: React.ReactNode;
}

export default function Header({ HeaderExtra }: HeaderProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? "bg-primary/20" : "";
  };

  return (
    <header className="sticky top-0 z-10 bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Filter className="h-6 w-6" />
          <span className="text-xl font-bold">Controle de Setores - ABF</span>
        </Link>
        
        {/* Mobile menu button */}
        <div className="flex items-center gap-2">
          {HeaderExtra && (
            <div className="hidden md:block">{HeaderExtra}</div>
          )}
          <button 
            className="md:hidden bg-primary-foreground/10 rounded p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu de navegação"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex space-x-2">
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/')}`}
            asChild
          >
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Início</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/peritagem')}`}
            asChild
          >
            <Link to="/peritagem" className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4" />
              <span>Peritagem</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/execucao')}`}
            asChild
          >
            <Link to="/execucao" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Execução</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/checagem')}`}
            asChild
          >
            <Link to="/checagem" className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4" />
              <span>Qualidade</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/sucateamento')}`}
            asChild
          >
            <Link to="/sucateamento" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Sucateamento</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:bg-primary/30 ${isActive('/relatorio')}`}
            asChild
          >
            <Link to="/relatorio" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Relatórios</span>
            </Link>
          </Button>
        </nav>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-primary-foreground/10 p-4">
          <div className="flex flex-col space-y-2">
            {HeaderExtra && <div className="pb-2 border-b border-white/20 mb-2">{HeaderExtra}</div>}
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
              <Filter className="h-5 w-5" />
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
