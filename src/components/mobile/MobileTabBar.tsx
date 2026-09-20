import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, LayoutDashboard, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const tabs = [
  { id: 'home', label: 'Inicio', icon: Home, path: '/' },
  { id: 'search', label: 'Buscar', icon: Search, path: '/search' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'publish', label: 'Publicar', icon: Plus, path: '/activities/create' },
] as const;

const MobileTabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/mobile';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="app-tabbar lg:hidden"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-between gap-1 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          const needsAuth = tab.id === 'dashboard' || tab.id === 'publish';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (needsAuth && !user) {
                  navigate('/login');
                  return;
                }
                navigate(tab.path);
              }}
              className={`flex min-h-12 min-w-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 transition-colors duration-150 active:scale-95 ${
                active ? 'bg-emerald-700 text-white' : 'text-stone-500'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={tab.label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
