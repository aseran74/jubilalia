import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  UserIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  HomeModernIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
  HeartIcon,
  BellIcon,
  KeyIcon,
  SparklesIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (pathname: string, search: string) => boolean;
}

const planLinks: NavigationItem[] = [
  {
    name: 'Actividades',
    href: '/dashboard/activities',
    icon: CalendarIcon,
    match: (pathname, search) =>
      pathname.startsWith('/dashboard/activities') && !search.includes('mine'),
  },
  {
    name: 'Conecta con grupos',
    href: '/dashboard/groups?explore',
    icon: UserGroupIcon,
    match: (pathname, search) =>
      pathname.startsWith('/dashboard/groups') && search.includes('explore'),
  },
  {
    name: 'Conoce gente',
    href: '/dashboard/users',
    icon: UsersIcon,
    match: (pathname) => pathname.startsWith('/dashboard/users'),
  },
];

const colivingLinks: NavigationItem[] = [
  { name: 'Explicación', href: '/coliving', icon: InformationCircleIcon },
  { name: 'Habitaciones', href: '/dashboard/rooms', icon: KeyIcon },
  { name: 'Alquiler', href: '/dashboard/properties/rental', icon: HomeModernIcon },
  { name: 'Venta', href: '/dashboard/properties/sale', icon: BuildingOfficeIcon },
];

const myThingsLinks: NavigationItem[] = [
  {
    name: 'Mis amigos',
    href: '/dashboard/friends',
    icon: HeartIcon,
  },
  {
    name: 'Mis grupos',
    href: '/dashboard/groups',
    icon: UserGroupIcon,
    match: (pathname, search) =>
      pathname.startsWith('/dashboard/groups') && !search.includes('explore'),
  },
  {
    name: 'Mis actividades',
    href: '/dashboard/activities?mine',
    icon: CalendarIcon,
    match: (pathname, search) =>
      pathname.startsWith('/dashboard/activities') && search.includes('mine'),
  },
  {
    name: 'Mis mensajes',
    href: '/dashboard/messages',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Mis notificaciones',
    href: '/dashboard/notifications',
    icon: BellIcon,
  },
];

const adminLinks: NavigationItem[] = [
  { name: 'Compartir', href: '/dashboard/admin/rooms', icon: HomeModernIcon },
  { name: 'Propiedades', href: '/dashboard/admin/properties', icon: BuildingOfficeIcon },
  { name: 'Actividades', href: '/dashboard/admin/activities', icon: CalendarIcon },
  { name: 'Grupos', href: '/dashboard/admin/groups', icon: UserGroupIcon },
];

type OpenSection = 'plans' | 'coliving' | 'mine' | 'admin' | null;

const isPlansPath = (pathname: string, search: string) =>
  pathname.startsWith('/dashboard/users') ||
  (pathname.startsWith('/dashboard/activities') && !search.includes('mine')) ||
  (pathname.startsWith('/dashboard/groups') && search.includes('explore'));

const isColivingPath = (pathname: string) =>
  pathname === '/coliving' ||
  pathname.startsWith('/dashboard/rooms') ||
  pathname.startsWith('/dashboard/properties');

const isMyThingsPath = (pathname: string, search: string) =>
  pathname.startsWith('/dashboard/friends') ||
  pathname.startsWith('/dashboard/messages') ||
  pathname.startsWith('/dashboard/notifications') ||
  (pathname.startsWith('/dashboard/groups') && !search.includes('explore')) ||
  (pathname.startsWith('/dashboard/activities') && search.includes('mine'));

const DashboardSidebar: React.FC = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openSection, setOpenSection] = useState<OpenSection>(null);

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
    if (isPlansPath(location.pathname, location.search)) setOpenSection('plans');
    else if (isColivingPath(location.pathname)) setOpenSection('coliving');
    else if (isMyThingsPath(location.pathname, location.search)) setOpenSection('mine');
    else if (location.pathname.startsWith('/dashboard/admin')) setOpenSection('admin');
    else setOpenSection(null);
  }, [location.pathname, location.search]);

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

  const toggleSection = (section: OpenSection) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const expanded = !isCollapsed || isMobile;
  const itemClass = (active: boolean) =>
    `flex min-h-10 items-center rounded-xl text-sm font-medium transition-colors duration-150 ${
      active
        ? 'bg-emerald-700 text-white shadow-sm'
        : 'text-slate-600 hover:bg-white hover:text-slate-900'
    } ${expanded ? 'gap-3 px-3 py-2' : 'justify-center px-2 py-2'}`;

  const isItemActive = (item: NavigationItem) =>
    item.match?.(location.pathname, location.search) ??
    location.pathname.startsWith(item.href.split('?')[0]);

  const renderAccordion = (
    id: Exclude<OpenSection, null>,
    title: string,
    Icon: React.ComponentType<{ className?: string }>,
    items: NavigationItem[],
    active: boolean,
    accent: 'emerald' | 'admin' = 'emerald'
  ) => {
    const open = openSection === id;
    const activeClass =
      accent === 'admin'
        ? active
          ? 'bg-red-50 text-red-800'
          : 'text-slate-600 hover:bg-white hover:text-slate-900'
        : active
          ? 'bg-emerald-50 text-emerald-900'
          : 'text-slate-600 hover:bg-white hover:text-slate-900';

    if (!expanded) {
      return (
        <Link
          to={items[0].href}
          title={title}
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active
              ? accent === 'admin'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-700 text-white'
              : 'text-slate-500 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Icon className="h-5 w-5" />
        </Link>
      );
    }

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold ${activeClass}`}
          aria-expanded={open}
        >
          <span className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0" />
            {title}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-5 pl-3">
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeMobile}
                className={itemClass(isItemActive(item) || location.pathname.startsWith(item.href))}
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
        className={`flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-[#F4F1EA] transition-[width,transform] duration-200 ease-out ${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-72 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `sticky top-0 ${isCollapsed ? 'w-[4.75rem]' : 'w-64'}`
        }`}
      >
        <div className={`flex items-center border-b border-slate-200/80 ${expanded ? 'px-4 py-3' : 'flex-col gap-3 px-2 py-3'}`}>
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
            className="mx-3 mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-white hover:text-emerald-800"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Ir a la web
          </Link>
        )}

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Menú del dashboard">
          <div className={`flex flex-col ${expanded ? 'gap-0.5' : 'items-center gap-1.5'}`}>
            <Link
              to="/dashboard"
              onClick={closeMobile}
              title="Inicio"
              className={itemClass(
                location.pathname === '/dashboard' || location.pathname === '/dashboard/'
              )}
            >
              <HomeIcon className="h-5 w-5 shrink-0" />
              {expanded && 'Inicio'}
            </Link>

            {renderAccordion(
              'plans',
              'Planes',
              SparklesIcon,
              planLinks,
              isPlansPath(location.pathname, location.search)
            )}
            {renderAccordion(
              'coliving',
              'Coliving',
              HomeModernIcon,
              colivingLinks,
              isColivingPath(location.pathname)
            )}
            {renderAccordion(
              'mine',
              'Mis cosas',
              Squares2X2Icon,
              myThingsLinks,
              isMyThingsPath(location.pathname, location.search)
            )}

            {isAdmin && (
              <>
                <div className={`my-1.5 w-full border-t border-slate-200 ${expanded ? '' : 'mx-auto w-8'}`} />
                {renderAccordion(
                  'admin',
                  'Admin',
                  ShieldCheckIcon,
                  adminLinks,
                  location.pathname.startsWith('/dashboard/admin'),
                  'admin'
                )}
              </>
            )}
          </div>
        </nav>

        <div className={`shrink-0 border-t border-slate-200/80 ${expanded ? 'p-3' : 'p-2'}`}>
          {expanded ? (
            <div className="mb-2 rounded-2xl bg-white/70 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
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

          <div className={`flex flex-col ${expanded ? 'gap-0.5' : 'items-center gap-1'}`}>
            <Link
              to="/dashboard/profile"
              onClick={closeMobile}
              title="Mi perfil"
              className={itemClass(location.pathname.startsWith('/dashboard/profile'))}
            >
              <UserIcon className="h-5 w-5 shrink-0" />
              {expanded && 'Mi perfil'}
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={closeMobile}
              title="Configuración"
              className={itemClass(location.pathname.startsWith('/dashboard/settings'))}
            >
              <Cog6ToothIcon className="h-5 w-5 shrink-0" />
              {expanded && 'Configuración'}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              title="Cerrar sesión"
              className={`flex min-h-10 items-center rounded-xl text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-red-700 ${
                expanded ? 'w-full gap-3 px-3 py-2' : 'justify-center px-2 py-2'
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
