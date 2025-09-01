import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon
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
}

const DashboardSidebar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['habitaciones', 'alquiler', 'venta', 'actividades', 'posts', 'usuarios', 'mensajeria']);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationGroups: NavigationGroup[] = [
    {
      name: 'Habitaciones',
      icon: BuildingOfficeIcon,
      items: [
        { name: 'Buscar habitaciones', href: '/rooms', icon: MagnifyingGlassIcon },
        { name: 'Publicar habitación', href: '/rooms/create', icon: PlusIcon },
      ]
    },
    {
      name: 'Alquiler',
      icon: BuildingOfficeIcon,
      items: [
        { name: 'Buscar alquiler', href: '/dashboard/properties/rental', icon: MagnifyingGlassIcon },
        { name: 'Publicar alquiler', href: '/dashboard/properties/rental/create', icon: PlusIcon },
      ]
    },
    {
      name: 'Venta',
      icon: BuildingOfficeIcon,
      items: [
        { name: 'Buscar venta', href: '/dashboard/properties/sale', icon: MagnifyingGlassIcon },
        { name: 'Publicar venta', href: '/dashboard/properties/sale/create', icon: PlusIcon },
      ]
    },
    {
      name: 'Actividades',
      icon: CalendarIcon,
      items: [
        { name: 'Buscar actividades', href: '/dashboard/activities', icon: MagnifyingGlassIcon },
        { name: 'Crear actividad', href: '/dashboard/activities/create', icon: PlusIcon },
      ]
    },
    {
      name: 'Posts',
      icon: DocumentTextIcon,
      items: [
        { name: 'Buscar posts', href: '/dashboard/posts', icon: MagnifyingGlassIcon },
        { name: 'Crear post', href: '/dashboard/posts/create', icon: PlusIcon },
      ]
    },
    {
      name: 'Usuarios',
      icon: UserIcon,
      items: [
        { name: 'Buscar gente', href: '/dashboard/users', icon: MagnifyingGlassIcon },
      ]
    },
    {
      name: 'Mensajería',
      icon: ChatBubbleLeftRightIcon,
      items: [
        { name: 'Chat', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
      ]
    }
  ];

  const standaloneItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Mi Perfil', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Configuración', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const isGroupActive = (group: NavigationGroup) => {
    return group.items.some(item => isActive(item.href));
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-900">Jubilalia</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-2">
            {/* Landing Page Link */}
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-blue-200"
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {!isCollapsed && 'Ir a Jubilalia'}
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Standalone Items */}
            {standaloneItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {!isCollapsed && item.name}
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Grouped Navigation */}
            {!isCollapsed && navigationGroups.map((group) => (
              <div key={group.name} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isGroupActive(group)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <group.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {group.name}
                  </div>
                  {openGroups.includes(group.name) ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
                
                {openGroups.includes(group.name) && (
                  <div className="ml-6 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Collapsed view for groups */}
            {isCollapsed && (
              <>
                {/* Landing Page Link (Collapsed) */}
                <Link
                  to="/"
                  className="w-full flex items-center justify-center p-3 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-blue-200"
                  title="Ir a Jubilalia"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>
              </>
            )}
            
            {isCollapsed && navigationGroups.map((group) => (
              <div key={group.name} className="relative group">
                <button
                  className="w-full flex items-center justify-center p-3 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title={group.name}
                >
                  <group.icon className="w-5 h-5" />
                </button>
                
                {/* Tooltip for collapsed groups */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {group.name}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            className={`mt-3 w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            {!isCollapsed && 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
