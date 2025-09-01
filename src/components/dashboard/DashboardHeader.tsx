import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, Settings, LogOut, User, Menu, Home, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleSidebar }) => {
  const { user, profile, logout } = useAuth();
  const { unreadCount } = useUnreadMessages();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo - Botón de toggle y breadcrumb */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          {/* Botón de toggle del sidebar (solo visible en móvil/tablet) */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs lg:text-sm">J</span>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Dashboard Jubilalia</h2>
              <p className="text-xs lg:text-sm text-gray-500">Bienvenido de vuelta</p>
            </div>
            <div className="sm:hidden">
              <h2 className="text-base font-semibold text-gray-900">Dashboard</h2>
            </div>
          </div>
        </div>

        {/* Lado derecho - Acciones del usuario */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Botón para ir a la landing page */}
          <Link
            to="/landing"
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Ir a la página principal"
          >
            <Home className="w-4 h-4 lg:w-5 lg:h-5" />
          </Link>



          {/* Botón de debug del perfil */}
          <button
            onClick={() => {
              console.log('🔍 DEBUG - Estado del perfil:');
              console.log('👤 Profile:', profile);
              console.log('👤 Supabase User:', user);
              console.log('📧 Email:', user?.email);
              console.log('🆔 Profile ID:', profile?.id);
              alert(`Debug del perfil:\nID: ${profile?.id}\nEmail: ${profile?.email}`);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Debug del perfil"
          >
            <span className="text-xs font-bold">🐛</span>
          </button>

          {/* Mensajes */}
          <Link
            to="/dashboard/messages"
            className="relative p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Mensajes"
          >
            <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Notificaciones */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>

          {/* Configuración */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>

          {/* Separador */}
          <div className="hidden lg:block w-px h-6 bg-gray-300"></div>

          {/* Información del usuario */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Información del usuario (oculta en móvil muy pequeño) */}
            <div className="hidden sm:block text-right">
              <p className="text-xs lg:text-sm font-medium text-gray-900 truncate max-w-24 lg:max-w-32">
                {profile?.full_name || user?.email || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-24 lg:max-w-32">
                {profile?.city || 'Sin ubicación'}
              </p>
            </div>
            
            {/* Avatar del usuario */}
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              )}
            </div>
          </div>

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
