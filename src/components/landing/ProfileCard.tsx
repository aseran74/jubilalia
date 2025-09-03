import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  MessageCircle, 
  Calendar, 
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../lib/supabase';

interface ProfileCardProps {
  isTransparent?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ isTransparent = false }) => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    console.log('🔄 ProfileCard: useEffect ejecutándose, user:', user ? user.id : 'null');
    
    const fetchUserProfile = async () => {
      if (user) {
        console.log('🔍 ProfileCard: Buscando perfil para usuario:', user.id);
        try {
          const profile = await getUserProfile(user.id);
          console.log('✅ ProfileCard: Perfil encontrado:', profile);
          setUserProfile(profile);
        } catch (error) {
          console.error('❌ ProfileCard: Error buscando perfil:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('🚪 ProfileCard: No hay usuario, limpiando estado');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      console.log('🚪 ProfileCard: Iniciando logout...');
      await logout();
      setIsDropdownOpen(false);
      // La redirección se maneja en el hook useAuth
    } catch (error) {
      console.error('❌ ProfileCard: Error en logout:', error);
    }
  };

  // Log del estado actual
  console.log('🔄 ProfileCard renderizando - user:', user ? user.id : 'null', 'loading:', loading, 'userProfile:', userProfile);

  if (loading) {
    return (
      <div className={`rounded-xl p-4 shadow-lg ${isTransparent ? 'bg-white/10 backdrop-blur-md' : 'bg-white'}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚪 ProfileCard: No hay usuario, no renderizando');
    return null;
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center space-x-3 rounded-full px-4 py-2 transition-all duration-200 ${
          isTransparent 
            ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20' 
            : 'bg-white shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${
          isTransparent ? 'border-white/30' : 'border-gray-200'
        }`}>
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <span className="font-medium">
          {userProfile?.full_name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Usuario'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {userProfile?.full_name || user?.displayName || 'Usuario Jubilalia'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-2">
            <Link
              to="/dashboard"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/rooms"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Compartir Habitación</span>
            </Link>
            
            <Link
              to="/properties/sale"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Building className="w-4 h-4" />
              <span>Alojamientos</span>
            </Link>
            
            <Link
              to="/messages"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Red Social</span>
            </Link>
            
            <Link
              to="/activities"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Actividades</span>
            </Link>
          </div>

          {/* Settings & Logout */}
          <div className="py-2 border-t border-gray-100">
            <Link
              to="/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Mi Perfil</span>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileCard;
