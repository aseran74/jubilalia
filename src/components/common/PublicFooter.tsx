import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon as Home,
  BuildingOfficeIcon as Building,
  MagnifyingGlassIcon as Search,
  Squares2X2Icon as LayoutDashboard,
  UserIcon as User
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const PublicFooter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* --- FOOTER --- */}
      <footer className="bg-white pt-20 pb-32 lg:pb-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src="/images/jubilogo.svg" alt="Jubilalia" loading="lazy" className="h-10 mx-auto mb-8 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
          <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm font-bold text-gray-600">
            <a href="#" className="hover:text-green-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-green-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-green-600 transition-colors">Cookies</a>
          </div>
          <p className="text-sm text-gray-400 font-medium">&copy; {new Date().getFullYear()} Jubilalia. Hecho con <span className="text-red-500">❤️</span> para nuestros mayores.</p>
        </div>
      </footer>

      {/* Mobile/Tablet Bottom Navbar (Refinado) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 lg:hidden pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { label: 'Inicio', icon: Home, action: () => navigate('/') },
            { label: 'Coliving', icon: Building, action: () => navigate('/properties/search') },
            { label: 'Buscar', icon: Search, action: () => navigate('/search') },
            { label: 'Mi Panel', icon: LayoutDashboard, action: () => navigate(user ? '/dashboard' : '/login') },
            { label: 'Perfil', icon: User, action: () => navigate(user ? '/dashboard/profile' : '/login') }
          ].map((item, idx) => (
            <button
                key={idx}
                onClick={item.action}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-400 hover:text-green-600 active:text-green-700 transition-colors group"
            >
                <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Spacer para Mobile */}
      <div className="h-safe-bottom lg:hidden"></div>
    </>
  );
};

export default PublicFooter;

