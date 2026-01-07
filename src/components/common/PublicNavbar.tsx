import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon as Home,
  BuildingOfficeIcon as Building,
  MagnifyingGlassIcon as Search,
  SparklesIcon as Sparkles,
  QuestionMarkCircleIcon as QuestionMark,
  XMarkIcon,
  Bars3Icon,
  Squares2X2Icon as LayoutDashboard,
  UserIcon as User
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import ProfileCard from '../landing/ProfileCard';

interface PublicNavbarProps {
  isTransparent?: boolean;
  onScrollToSection?: (section: string) => void;
}

const PublicNavbar: React.FC<PublicNavbarProps> = ({ 
  isTransparent = false,
  onScrollToSection 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(!isTransparent);

  useEffect(() => {
    if (isTransparent) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isTransparent]);

  const handleMenuClick = (action?: () => void, sectionId?: string) => {
    setIsMenuOpen(false);
    if (action) {
      action();
    } else if (sectionId && onScrollToSection) {
      onScrollToSection(sectionId);
    }
  };

  return (
    <>
      {/* --- NAVBAR MEJORADO --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        isScrolled || isMenuOpen || !isTransparent
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 py-3' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex-shrink-0 group relative z-50 transition-transform hover:scale-105 duration-300">
              <img 
                src="/images/jubilogo.svg" 
                alt="Jubilalia" 
                loading="eager"
                fetchPriority="high"
                className={`h-10 w-auto transition-all duration-300 ${
                  isScrolled || isMenuOpen || !isTransparent ? 'brightness-100' : 'brightness-0 invert drop-shadow-md'
                }`}
              />
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
               <div className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-500 ${isScrolled || !isTransparent ? 'bg-gray-100/50' : 'bg-black/10 backdrop-blur-sm border border-white/10'}`}>
                {[
                    { label: 'Inicio', id: 'home', icon: Home, action: () => navigate('/') },
                    { label: 'Coliving', id: 'coliving', icon: Building, action: () => navigate('/properties/search') },
                    { label: 'Buscar', id: 'search', icon: Search, action: () => navigate('/search') },
                    { label: 'Cómo Funciona', id: 'how-it-works', icon: Sparkles, action: () => navigate('/#how-it-works') },
                    { label: 'FAQ', id: 'faq', icon: QuestionMark, action: () => navigate('/#faq') }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else if (onScrollToSection) {
                            onScrollToSection(item.id);
                          }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        isScrolled || !isTransparent
                            ? 'text-gray-600 hover:bg-white hover:text-green-600 hover:shadow-sm' 
                            : 'text-white hover:bg-white/20'
                        }`}
                    >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </button>
                ))}
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <ProfileCard isTransparent={!(isScrolled || !isTransparent)} />
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all ${
                    isScrolled || !isTransparent ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                  }`}>
                    Entrar
                  </button>
                  <button onClick={() => navigate('/register')} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/50 ring-2 ring-transparent hover:ring-green-300/50">
                    Registrarse
                  </button>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-full z-50 transition-all ${
                isScrolled || isMenuOpen || !isTransparent ? 'text-gray-900 bg-gray-100' : 'text-white bg-white/20 backdrop-blur-md'
              }`}
            >
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[110] transform transition-transform duration-500 ease-in-out lg:hidden ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}>
        {/* Backdrop sólido */}
        <div className="absolute inset-0 bg-white opacity-100"></div>
        
        {/* Contenido del menú */}
        <div className="relative z-10 pt-20 px-6 h-full overflow-y-auto bg-white">
          {/* Botón X para cerrar */}
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-900" />
            </button>
          </div>
          
          <div className="flex flex-col space-y-4 text-lg font-medium">
            <button onClick={() => handleMenuClick(() => navigate('/properties/search'))} className="flex items-center gap-3 text-left p-4 hover:bg-green-200 rounded-xl transition-colors text-green-800 font-bold text-xl bg-green-100 border-b-2 border-green-300">
              <Building className="w-6 h-6" />
              <span>Coliving</span>
            </button>
            <button onClick={() => handleMenuClick(() => navigate('/search'))} className="flex items-center gap-3 text-left p-4 hover:bg-gray-100 rounded-xl transition-colors border-b-2 border-gray-300 text-gray-900 font-bold text-xl">
              <Search className="w-6 h-6" />
              <span>Buscar Actividades</span>
            </button>
            <button onClick={() => handleMenuClick(() => navigate('/'))} className="flex items-center gap-3 text-left p-4 hover:bg-gray-100 rounded-xl transition-colors border-b-2 border-gray-300 text-gray-900 font-bold text-xl">
              <Home className="w-6 h-6" />
              <span>Inicio</span>
            </button>
            <button onClick={() => handleMenuClick(() => navigate('/#how-it-works'))} className="flex items-center gap-3 text-left p-4 hover:bg-gray-100 rounded-xl transition-colors border-b-2 border-gray-300 text-gray-900 font-bold text-xl">
              <Sparkles className="w-6 h-6" />
              <span>Cómo Funciona</span>
            </button>
            <button onClick={() => handleMenuClick(() => navigate('/#faq'))} className="flex items-center gap-3 text-left p-4 hover:bg-gray-100 rounded-xl transition-colors border-b-2 border-gray-300 text-gray-900 font-bold text-xl">
              <QuestionMark className="w-6 h-6" />
              <span>FAQ</span>
            </button>
            
            <div className="pt-8 flex flex-col space-y-4 mt-4">
              {user ? (
                <button onClick={() => handleMenuClick(() => navigate('/dashboard'))} className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-4 rounded-xl font-bold text-center shadow-lg hover:bg-green-700 transition-colors text-lg">
                  <LayoutDashboard className="w-6 h-6" />
                  <span>Ir a mi Panel</span>
                </button>
              ) : (
                <>
                  <button onClick={() => handleMenuClick(() => navigate('/login'))} className="flex items-center justify-center gap-3 w-full border-2 border-gray-400 py-4 rounded-xl font-bold text-gray-900 hover:bg-gray-200 transition-colors text-lg">
                    <User className="w-6 h-6" />
                    <span>Iniciar Sesión</span>
                  </button>
                  <button onClick={() => handleMenuClick(() => navigate('/register'))} className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors text-lg">
                    <User className="w-6 h-6" />
                    <span>Registrarse Gratis</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicNavbar;

