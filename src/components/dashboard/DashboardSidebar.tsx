import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  HomeIcon, 
  UserIcon, 
  CogIcon, 
  LogOutIcon,
  SearchIcon,
  PlusIcon,
  FileTextIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingIcon
} from '@heroicons/react/24/outline';

const DashboardSidebar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Buscar propiedades', href: '/dashboard/properties', icon: SearchIcon },
    { name: 'Crear propiedad', href: '/dashboard/properties/create', icon: PlusIcon },
    { name: 'Buscar actividades', href: '/dashboard/activities', icon: CalendarIcon },
    { name: 'Crear actividad', href: '/dashboard/activities/create', icon: PlusIcon },
    { name: 'Posts', href: '/dashboard/posts', icon: FileTextIcon },
    { name: 'Crear post', href: '/dashboard/posts/create', icon: PlusIcon },
    { name: 'Perfil', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Configuración', href: '/dashboard/settings', icon: CogIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
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

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Usuario'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-white" />
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile?.full_name || user.email || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item.href)
                      ? 'text-blue-700'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOutIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 flex-shrink-0" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
