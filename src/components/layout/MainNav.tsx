import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, Plus, Settings, CheckCircle2, PackageCheck, Trash2 } from 'lucide-react';

export default function MainNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex flex-col space-y-1">
      <ul>
        <li>
          <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>
            <Home className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/peritagem" className={isActive('/peritagem') ? 'nav-link active' : 'nav-link'}>
            <ListChecks className="h-5 w-5 mr-2" />
            Peritagem
          </Link>
        </li>
        <li>
          <Link to="/execucao" className={isActive('/execucao') ? 'nav-link active' : 'nav-link'}>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Execução
          </Link>
        </li>
        <li>
          <Link to="/checagem" className={isActive('/checagem') ? 'nav-link active' : 'nav-link'}>
            <PackageCheck className="h-5 w-5 mr-2" />
            Checagem Final
          </Link>
        </li>
        <li>
          <Link to="/sucateamento" className={isActive('/sucateamento') ? 'nav-link active' : 'nav-link'}>
            <Trash2 className="h-5 w-5 mr-2" />
            Sucateamento
          </Link>
        </li>
        <li>
          <Link to="/setores" className={isActive('/setores') ? 'nav-link active' : 'nav-link'}>
            <Settings className="h-5 w-5 mr-2" />
            Gerenciamento de Setores
          </Link>
        </li>
      </ul>
    </nav>
  );
}
