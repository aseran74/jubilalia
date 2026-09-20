import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  UserIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  MapIcon,
  HomeModernIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
  description?: string;
}

const navigationGroups: NavigationGroup[] = [
  {
    name: 'Actividades',
    icon: CalendarIcon,
    items: [
      { name: 'Buscar actividades', href: '/dashboard/activities', icon: MagnifyingGlassIcon },
      { name: 'Ver en mapa', href: '/dashboard/activities/map', icon: MapIcon },
      { name: 'Crear actividad', href: '/dashboard/activities/create', icon: PlusIcon },
    ],
  },
  {
    name: 'Posts',
    icon: DocumentTextIcon,
    items: [
      { name: 'Buscar posts', href: '/dashboard/posts', icon: MagnifyingGlassIcon },
      { name: 'Crear post', href: '/dashboard/posts/create', icon: PlusIcon },
    ],
  },
  {
    name: 'Socios',
    icon: UserIcon,
    items: [
      { name: 'Buscar gente', href: '/dashboard/users', icon: MagnifyingGlassIcon },
      { name: 'Ver en mapa', href: '/dashboard/users/map', icon: MapIcon },
    ],
  },
  {
    name: 'Grupos',
    icon: UsersIcon,
    items: [
      { name: 'Buscar grupos', href: '/dashboard/groups', icon: MagnifyingGlassIcon },
      { name: 'Ver en mapa', href: '/dashboard/groups/map', icon: MapIcon },
    ],
  },
  {
    name: 'Coliving',
    icon: HomeModernIcon,
    description: 'Habitaciones, alquiler y venta para vivir en comunidad',
    items: [
      { name: '¿Qué es Coliving?', href: '/coliving', icon: InformationCircleIcon },
      { name: 'Habitaciones - Buscar', href: '/dashboard/rooms', icon: MagnifyingGlassIcon },
      { name: 'Habitaciones - Publicar', href: '/dashboard/rooms/create', icon: PlusIcon },
      { name: 'Post habitaciones', href: '/dashboard/rooms/posts', icon: DocumentTextIcon },
      { name: 'Alquiler - Buscar', href: '/dashboard/properties/rental', icon: MagnifyingGlassIcon },
      { name: 'Alquiler - Publicar', href: '/dashboard/properties/rental/create', icon: PlusIcon },
      { name: 'Post alquiler', href: '/dashboard/properties/rental/posts', icon: DocumentTextIcon },
      { name: 'Venta - Buscar', href: '/dashboard/properties/sale', icon: MagnifyingGlassIcon },
      { name: 'Venta - Publicar', href: '/dashboard/properties/sale/create', icon: PlusIcon },
      { name: 'Post venta', href: '/dashboard/properties/sale/posts', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'Mensajería',
    icon: ChatBubbleLeftRightIcon,
    items: [
      { name: 'Chat', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
    ],
  },
];

const adminGroup: NavigationGroup = {
  name: 'Administración',
  icon: ShieldCheckIcon,
  items: [
    { name: 'Gestionar Compartir', href: '/dashboard/admin/rooms', icon: HomeModernIcon },
    { name: 'Gestionar Propiedades', href: '/dashboard/admin/properties', icon: BuildingOfficeIcon },
    { name: 'Gestionar Actividades', href: '/dashboard/admin/activities', icon: CalendarIcon },
    { name: 'Gestionar Grupos', href: '/dashboard/admin/groups', icon: UserGroupIcon },
  ],
};

const DashboardSidebar: React.FC = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const groups = isAdmin ? [...navigationGroups, adminGroup] : navigationGroups;
    const activeGroup = groups.find((group) =>
      group.items.some((item) => location.pathname === item.href)
    );
    setOpenGroups(activeGroup ? [activeGroup.name] : []);
  }, [location.pathname, isAdmin]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeMobile = () => {
    if (isMobile) setIsMobileOpen(false);
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupName) ? prev.filter((name) => name !== groupName) : [groupName]
    );
  };

  const isActive = (href: string) => location.pathname === href;

  const isGroupActive = (group: NavigationGroup) =>
    group.items.some((item) => location.pathname === item.href);

  const expanded = !isCollapsed || isMobile;
  const itemClass = (active: boolean) =>
    `flex min-h-11 items-center rounded-xl text-[15px] font-medium transition-[background-color,color,transform] duration-150 ease-out ${
      active
        ? 'bg-emerald-700 text-white shadow-sm'
        : 'text-slate-600 hover:bg-white hover:text-slate-900'
    } ${expanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'}`;

  const renderGroup = (group: NavigationGroup, accent = 'emerald') => {
    const open = openGroups.includes(group.name);
    const groupActive = isGroupActive(group);
    const activeGroupClass =
      accent === 'admin'
        ? groupActive
          ? 'bg-red-50 text-red-800'
          : 'text-slate-600 hover:bg-white hover:text-slate-900'
        : groupActive
          ? 'bg-emerald-50 text-emerald-900'
          : 'text-slate-600 hover:bg-white hover:text-slate-900';

    if (!expanded) {
      return (
        <Link
          key={group.name}
          to={group.items[0].href}
          title={group.name}
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            groupActive ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:bg-white hover:text-slate-900'
          }`}
        >
          <group.icon className="h-5 w-5" />
        </Link>
      );
    }

    return (
      <div key={group.name}>
        <button
          type="button"
          onClick={() => toggleGroup(group.name)}
          className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-semibold ${activeGroupClass}`}
          aria-expanded={open}
        >
          <span className="flex items-center gap-3">
            <group.icon className="h-5 w-5 shrink-0" />
            {group.name}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="mt-1 space-y-1 border-l border-slate-200 ml-5 pl-3">
            {group.description && (
              <p className="px-2 pb-1 text-xs leading-relaxed text-slate-500">{group.description}</p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeMobile}
                className={itemClass(isActive(item.href))}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobile && (
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-md md:hidden"
          aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileOpen ? (
            <XMarkIcon className="h-6 w-6 text-slate-700" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-slate-700" />
          )}
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`flex h-screen shrink-0 flex-col border-r border-slate-200 bg-[#F4F1EA] transition-[width,transform] duration-200 ease-out ${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-72 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `sticky top-0 ${isCollapsed ? 'w-[4.75rem]' : 'w-72'}`
        }`}
      >
        <div className={`flex items-center border-b border-slate-200/80 ${expanded ? 'px-4 py-4' : 'flex-col gap-3 px-2 py-4'}`}>
          <Link to="/" onClick={closeMobile} className="flex min-w-0 items-center">
            {expanded ? (
              <img src="/images/jubilogo.svg" alt="Jubilalia" className="h-8 w-auto" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-sm font-bold text-white">
                J
              </span>
            )}
          </Link>

          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              className={`rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800 ${expanded ? 'ml-auto' : ''}`}
              aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              <svg
                className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {expanded && (
          <Link
            to="/"
            onClick={closeMobile}
            className="mx-3 mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-white hover:text-emerald-800"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Ir a la web
          </Link>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menú del dashboard">
          <div className={`flex flex-col ${expanded ? 'gap-1' : 'items-center gap-2'}`}>
            <Link
              to="/dashboard"
              onClick={closeMobile}
              title="Inicio"
              className={itemClass(isActive('/dashboard'))}
            >
              <HomeIcon className="h-5 w-5 shrink-0" />
              {expanded && 'Inicio'}
            </Link>

            <div className={`my-2 w-full border-t border-slate-200 ${expanded ? '' : 'mx-auto w-8'}`} />

            {navigationGroups.map((group) => renderGroup(group))}

            {isAdmin && (
              <>
                <div className={`my-2 w-full border-t border-slate-200 ${expanded ? '' : 'mx-auto w-8'}`} />
                {renderGroup(adminGroup, 'admin')}
              </>
            )}
          </div>
        </nav>

        <div className={`border-t border-slate-200/80 ${expanded ? 'p-3' : 'p-2'}`}>
          {expanded ? (
            <div className="mb-2 rounded-2xl bg-white/70 px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {profile?.full_name || 'Usuario'}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-2 flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            </div>
          )}

          <div className={`flex flex-col ${expanded ? 'gap-1' : 'items-center gap-1'}`}>
            <Link
              to="/dashboard/profile"
              onClick={closeMobile}
              title="Mi perfil"
              className={itemClass(isActive('/dashboard/profile'))}
            >
              <UserIcon className="h-5 w-5 shrink-0" />
              {expanded && 'Mi perfil'}
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={closeMobile}
              title="Configuración"
              className={itemClass(isActive('/dashboard/settings'))}
            >
              <Cog6ToothIcon className="h-5 w-5 shrink-0" />
              {expanded && 'Configuración'}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              title="Cerrar sesión"
              className={`flex min-h-11 items-center rounded-xl text-[15px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-red-700 ${
                expanded ? 'w-full gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'
              }`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
              {expanded && 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
