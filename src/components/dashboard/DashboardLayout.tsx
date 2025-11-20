import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  Search, 
  MessageCircle, 
  LogOut 
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Cerrar sidebar en pantallas grandes por defecto
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    // Establecer estado inicial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <div className="flex h-screen relative" style={{ background: 'linear-gradient(to bottom, #2672BF, #5571AB)' }}>
        {/* Sidebar */}
        <DashboardSidebar />
        
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <DashboardHeader onToggleSidebar={toggleSidebar} />
          
          {/* Área de contenido con fondo degradado visible */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6" style={{ background: 'linear-gradient(to bottom, #2672BF, #5571AB)' }}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile/Tablet Bottom Navbar - Fuera del contenedor principal */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-[100] lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Inicio */}
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Inicio</span>
          </button>

          {/* Buscar */}
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Buscar</span>
          </button>

          {/* Mis Mensajes */}
          <button
            onClick={() => navigate('/dashboard/messages')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-medium">Mensajes</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs font-medium">Salir</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default DashboardLayout;
