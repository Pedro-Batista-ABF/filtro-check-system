
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  FileText,
  Home,
  Settings
} from 'lucide-react';

const SideNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    {
      name: 'Início',
      icon: <Home className="h-5 w-5" />,
      path: '/',
      exact: true
    },
    {
      name: 'Peritagem',
      icon: <ClipboardList className="h-5 w-5" />,
      path: '/peritagem'
    },
    {
      name: 'Execução',
      icon: <Settings className="h-5 w-5" />,
      path: '/execucao'
    },
    {
      name: 'Checagem Final',
      icon: <CheckCircle className="h-5 w-5" />,
      path: '/checagem'
    },
    {
      name: 'Sucateamento',
      icon: <AlertTriangle className="h-5 w-5" />,
      path: '/sucateamento'
    },
    {
      name: 'Concluídos',
      icon: <FileText className="h-5 w-5" />,
      path: '/concluidos'
    }
  ];
  
  return (
    <div className="py-4 space-y-2 h-full bg-background">
      <div className="px-4 py-2 text-lg font-semibold mb-4">
        Controle de Recuperação
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start px-4',
                (item.exact ? location.pathname === item.path : isActive(item.path))
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default SideNav;
