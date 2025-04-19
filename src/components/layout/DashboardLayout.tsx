
import React, { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  ClipboardCheck,
  Wrench,
  CheckSquare,
  CheckCircle,
  FileText,
  Trash2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Falha ao fazer logout");
    }
  };

  const navItems = [
    { path: "/", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { path: "/peritagem", icon: <ClipboardCheck className="h-5 w-5" />, label: "Peritagem" },
    { path: "/execucao", icon: <Wrench className="h-5 w-5" />, label: "Execução" },
    { path: "/checagem", icon: <CheckSquare className="h-5 w-5" />, label: "Checagem" },
    { path: "/concluidos", icon: <CheckCircle className="h-5 w-5" />, label: "Concluídos" },
    { path: "/relatorios", icon: <FileText className="h-5 w-5" />, label: "Relatórios" },
    { path: "/sucateamento", icon: <Trash2 className="h-5 w-5" />, label: "Sucateamento" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link to="/" className="font-bold text-lg">
            Sistema de Controle de Filtros
          </Link>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline-block">
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sair</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`
            fixed md:static top-16 left-0 h-[calc(100vh-4rem)] md:h-auto w-64 bg-white border-r z-10 transform
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            transition-transform duration-200 ease-in-out
          `}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-2 rounded-md transition-colors
                  ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') 
                    ? 'bg-gray-100 text-primary' 
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
