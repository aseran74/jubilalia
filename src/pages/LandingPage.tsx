import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon as Users, 
  ChatBubbleLeftRightIcon as MessageCircle, 
  CalendarIcon as Calendar, 
  ArrowRightIcon as ArrowRight,
  PhoneIcon as Phone,
  EnvelopeIcon as Mail,
  HomeIcon as Home,
  HeartIcon as Heart,
  SparklesIcon as Sparkles,
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon as ChevronDown,
  BuildingOfficeIcon as Building,
  StarIcon as Star,
  ChartBarIcon as ChartBar,
  MagnifyingGlassIcon as Search,
  UserIcon as User,
  Squares2X2Icon as LayoutDashboard,
  QuestionMarkCircleIcon as QuestionMark,
  CheckCircleIcon as CheckCircle,
  ShieldCheckIcon as ShieldCheck,
  MagnifyingGlassIcon as SearchIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import ProfileCard from '../components/landing/ProfileCard';
import CohousingModal from '../components/landing/CohousingModal';
import SuccessCaseModal from '../components/landing/SuccessCaseModal';
import ActivityCard from '../components/landing/ActivityCard';
import GroupCard from '../components/landing/GroupCard';
import { supabase } from '../lib/supabase';

const LandingPage: React.FC = () => {
  // --- ESTADOS ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCohousingModalOpen, setIsCohousingModalOpen] = useState(false);
  const [isSuccessCaseModalOpen, setIsSuccessCaseModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Datos
  interface Activity {
    id: string;
    title: string;
    description: string;
    category?: string;
    location: string;
    city: string;
    date: string;
    time: string;
    max_participants: number;
    current_participants: number;
    price: number;
    images: string[];
    is_featured: boolean;
    created_at: string;
    [key: string]: unknown;
  }

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  interface Group {
    id: string;
    name: string;
    description?: string;
    category?: string;
    city?: string;
    image_url?: string;
    current_members?: number;
    max_members?: number;
    is_public?: boolean;
    created_at: string;
    [key: string]: unknown;
  }

  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- HELPERS ---
  const mapActivityTypeToCategory = (activityType: string): string => {
    return activityType ? activityType.toLowerCase() : 'general';
  };

  // --- DATA FETCHING ---
  const fetchActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)
        .eq('show_on_landing', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      // Fetch Imágenes
      let imagesByActivity: Record<string, string[]> = {};
      const ids = (data || []).map(a => a.id);
      
      if (ids.length > 0) {
        const { data: imagesData } = await supabase
          .from('activity_images')
          .select('activity_id,image_url')
          .in('activity_id', ids)
          .order('is_primary', { ascending: false });
          
        if (imagesData) {
          imagesByActivity = imagesData.reduce((acc: Record<string, string[]>, img: { activity_id: string; image_url: string }) => {
            if (!acc[img.activity_id]) acc[img.activity_id] = [];
            acc[img.activity_id].push(img.image_url);
            return acc;
          }, {});
        }
      }

      const formattedActivities = (data || []).map(activity => ({
        ...activity,
        category: mapActivityTypeToCategory(activity.activity_type),
        price: parseFloat(activity.price || 0),
        images: imagesByActivity[activity.id] || [],
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('show_on_landing', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error) setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  // --- EFECTOS ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchGroups();
  }, [fetchActivities, fetchGroups]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Compensar navbar fijo
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate(user ? '/dashboard' : '/register');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-green-200 selection:text-green-900">
      
      {/* --- NAVBAR MEJORADO --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        isScrolled || isMenuOpen 
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
                className={`h-10 w-auto transition-all duration-300 ${
                  isScrolled || isMenuOpen ? 'brightness-100' : 'brightness-0 invert drop-shadow-md'
                }`}
              />
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
               <div className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-500 ${isScrolled ? 'bg-gray-100/50' : 'bg-black/10 backdrop-blur-sm border border-white/10'}`}>
                {[
                    { label: 'Inicio', id: 'home', icon: Home },
                    { label: 'Buscar', id: 'search', icon: Search },
                    { label: 'Cómo Funciona', id: 'how-it-works', icon: Sparkles },
                    { label: 'FAQ', id: 'faq', icon: QuestionMark }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => item.id === 'search' ? navigate('/search') : scrollToSection(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        isScrolled 
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
                <ProfileCard isTransparent={!isScrolled} />
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all ${
                    isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
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
                isScrolled || isMenuOpen ? 'text-gray-900 bg-gray-100' : 'text-white bg-white/20 backdrop-blur-md'
              }`}
            >
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Fuera del nav para mejor control */}
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
            <button onClick={() => { setIsMenuOpen(false); navigate('/search'); }} className="flex items-center gap-3 text-left p-4 hover:bg-green-200 rounded-xl transition-colors text-green-800 font-bold text-xl bg-green-100 border-b-2 border-green-300">
              <Search className="w-6 h-6" />
              <span>Buscar Actividades</span>
            </button>
            <button onClick={() => scrollToSection('home')} className="flex items-center gap-3 text-left p-4 hover:bg-gray-100 rounded-xl transition-colors border-b-2 border-gray-300 text-gray-900 font-bold text-xl">
              <Home className="w-6 h-6" />
              <span>Inicio</span>
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="flex items-center gap-3 text-left p-4 hover:bg-gray-100 rounded-xl transition-colors border-b-2 border-gray-300 text-gray-900 font-bold text-xl">
              <Sparkles className="w-6 h-6" />
              <span>Cómo Funciona</span>
            </button>
            <button onClick={() => scrollToSection('faq')} className="flex items-center gap-3 text-left p-4 hover:bg-gray-100 rounded-xl transition-colors border-b-2 border-gray-300 text-gray-900 font-bold text-xl">
              <QuestionMark className="w-6 h-6" />
              <span>FAQ</span>
            </button>
            
            <div className="pt-8 flex flex-col space-y-4 mt-4">
              {user ? (
                <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-4 rounded-xl font-bold text-center shadow-lg hover:bg-green-700 transition-colors text-lg">
                  <LayoutDashboard className="w-6 h-6" />
                  <span>Ir a mi Panel</span>
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-3 w-full border-2 border-gray-400 py-4 rounded-xl font-bold text-gray-900 hover:bg-gray-200 transition-colors text-lg">
                    <User className="w-6 h-6" />
                    <span>Iniciar Sesión</span>
                  </button>
                  <button onClick={() => navigate('/register')} className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors text-lg">
                    <User className="w-6 h-6" />
                    <span>Registrarse Gratis</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- HERO SECTION (EFECTOS INTACTOS) --- */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Moderno y Suave con Efectos */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700">
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite'
            }}></div>
          </div>

          {/* Floating Geometric Shapes */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Large Hexagons */}
            <div className="absolute top-20 left-20 w-32 h-32 opacity-20 animate-float-slow">
              <div className="w-full h-full bg-white transform rotate-45 rounded-lg"></div>
            </div>
            <div className="absolute bottom-32 right-32 w-24 h-24 opacity-25 animate-float-medium">
              <div className="w-full h-full bg-yellow-300 transform rotate-12 rounded-lg"></div>
            </div>
            
            {/* Medium Circles with Gradient */}
            <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-white to-blue-200 rounded-full opacity-30 animate-float-fast"></div>
            <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full opacity-25 animate-float-slow"></div>
            
            {/* Small Triangles */}
            <div className="absolute top-1/2 left-1/6 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-white opacity-40 animate-float-medium"></div>
            <div className="absolute bottom-1/4 right-1/6 w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-yellow-300 opacity-35 animate-float-fast"></div>
            
            {/* Floating Dots with Trail Effect */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-white rounded-full opacity-60 animate-float-dots"></div>
            <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-yellow-300 rounded-full opacity-70 animate-float-dots" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/3 left-2/3 w-4 h-4 bg-white rounded-full opacity-50 animate-float-dots" style={{animationDelay: '2s'}}></div>
          </div>

          {/* Gradient Orbs */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-3xl opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 pb-32 lg:pb-40">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-8 animate-fade-in-up shadow-lg hover:bg-white/20 transition-colors cursor-default">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>La comunidad #1 para disfrutar la madurez</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 leading-[1.1] drop-shadow-sm">
            Conecta. Comparte. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-green-200">
              Vive Acompañado.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto mb-12 font-medium leading-relaxed drop-shadow-sm">
          Haz nuevas amistades, conecta con grupos, comparte vivienda y vive experiencias en buena compañía junto a personas senior de tu generación.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in-up delay-200">
            <button onClick={handleGetStarted} className="w-full sm:w-auto px-8 py-4 bg-white text-green-800 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-green-50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
              Empezar Ahora <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => setIsCohousingModalOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/40 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
              <Home className="w-5 h-5" /> ¿Qué es Cohousing?
            </button>
          </div>
          
          {/* Stats en Hero (Rediseñado para mejor integración) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-5xl mx-auto animate-fade-in-up pt-8 border-t border-white/10" style={{animationDelay: '0.6s'}}>
            {[
              { val: '500+', label: 'Usuarios Activos' },
              { val: '150+', label: 'Alojamientos' },
              { val: '50+', label: 'Actividades' },
              { val: '4.9', label: 'Valoración' }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{stat.val}</div>
                <div className="text-green-100 text-sm md:text-base font-medium tracking-wide uppercase opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
           <svg className="fill-slate-50 w-full h-auto" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
             <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
           </svg>
        </div>
      </section>

      {/* --- FEATURES CARDS (Layout Bento Grid) --- */}
      <section className="py-20 bg-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Todo lo que necesitas</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Herramientas diseñadas pensando en ti</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 flex flex-col items-start h-full">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-green-100">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Grupos y Comunidad</h3>
              <p className="text-gray-600 mb-8 leading-relaxed flex-grow">Encuentra personas o grupos con tus mismos hobbies. Desde gente que hace senderismo hasta clubes de lectura.</p>
              <button onClick={() => navigate('/dashboard/groups')} className="w-full py-3 bg-gray-50 hover:bg-green-600 hover:text-white text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group-hover:shadow-lg">
                Explorar grupos <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 flex flex-col items-start h-full relative overflow-hidden">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-blue-100">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vivienda Compartida</h3>
              <p className="text-gray-600 mb-8 leading-relaxed flex-grow">Alquila una habitación o encuentra compañeros compatibles para compartir gastos y compañía.</p>
              <button onClick={() => navigate('/dashboard/rooms')} className="w-full py-3 bg-gray-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group-hover:shadow-lg">
                Ver habitaciones <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 flex flex-col items-start h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl z-10">Popular</div>
              <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-pink-100">
                <Calendar className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Actividades</h3>
              <p className="text-gray-600 mb-8 leading-relaxed flex-grow">No te quedes en casa. Descubre eventos locales, talleres y viajes organizados.</p>
              <button onClick={() => navigate('/dashboard/activities')} className="w-full py-3 bg-gray-50 hover:bg-pink-600 hover:text-white text-pink-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group-hover:shadow-lg">
                Ver agenda <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- NUESTRA PLATAFORMA EN NÚMEROS --- */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Nuestra Plataforma en Números
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre por qué miles de jubilados confían en nuestra plataforma para mejorar su calidad de vida
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-24">
            {[
                { Icon: Users, color: 'green', val: '500+', label: 'Usuarios Activos', sub: 'Jubilados conectados' },
                { Icon: Building, color: 'blue', val: '150+', label: 'Alojamientos', sub: 'Casas y pisos' },
                { Icon: Users, color: 'purple', val: '25+', label: 'Grupos Activos', sub: 'Comunidades' },
                { Icon: Calendar, color: 'pink', val: '50+', label: 'Actividades', sub: 'Eventos mensuales' },
                { Icon: Star, color: 'yellow', val: '4.9', label: 'Valoración', sub: 'De usuarios' },
                { Icon: ChartBar, color: 'teal', val: '98%', label: 'Satisfacción', sub: 'Usuarios felices' }
            ].map((item, idx) => (
                <div key={idx} className="text-center group p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                    <div className="flex justify-center mb-4">
                        <div className={`w-14 h-14 bg-${item.color}-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                            <item.Icon className={`w-7 h-7 text-${item.color}-600`} />
                        </div>
                    </div>
                    <div className={`text-3xl font-bold text-${item.color}-600 mb-2`}>{item.val}</div>
                    <div className="text-sm font-bold text-gray-800 mb-1">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.sub}</div>
                </div>
            ))}
          </div>

          {/* Testimonios (Style Bubble) */}
          <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            {/* Decorative Quote */}
            <div className="absolute top-10 left-10 text-9xl text-green-100 font-serif opacity-50 pointer-events-none">“</div>

            <div className="flex flex-col items-center justify-center mb-12 relative z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-md">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
                Lo que dicen nuestros usuarios
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                  { name: 'María González', loc: 'Madrid, 68 años', text: "Jubilalia me ha cambiado la vida. He encontrado una compañera y amiga maravillosa para compartir vivienda , ahorro 800€ todos los meses y encima hemos creado un grupo de amigas con el que viajar por toda Europa", color: 'green' },
                  { name: 'Carlos Ruiz', loc: 'Barcelona, 72 años', text: "Las actividades organizadas por la comunidad son fantásticas. Siempre hay algo interesante que hacer y gente nueva que conocer.", color: 'blue' },
                  { name: 'Ana Martínez', loc: 'Valencia, 65 años', text: "La plataforma es muy fácil de usar y el soporte es excelente. Me siento seguro y bienvenido en esta comunidad.", color: 'pink' }
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col">
                    <div className="flex items-center mb-6">
                        <div className={`w-12 h-12 rounded-full bg-${t.color}-100 flex items-center justify-center text-${t.color}-700 text-xl font-bold mr-4`}>
                            {t.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{t.name}</div>
                            <div className="text-sm text-gray-500">{t.loc}</div>
                        </div>
                    </div>
                    <p className="text-gray-600 italic leading-relaxed flex-grow">"{t.text}"</p>
                    <div className="flex gap-1 mt-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-current"/>)}
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION: COMPARTIR (Storytelling UX) --- */}
      <section id="compartir" className="pt-24 pb-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Emocional */}
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <div className="inline-flex justify-center items-center w-20 h-20 bg-red-50 rounded-full shadow-sm mb-8 animate-bounce-slow">
              <Heart className="w-10 h-10 text-red-500 fill-current" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              La soledad no es una opción, <br/> <span className="text-green-600 underline decoration-green-200 decoration-4 underline-offset-4">es una elección.</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              En España, más de 2 millones de personas mayores viven solas. En <strong>Jubilalia</strong> convertimos casas vacías en hogares llenos de vida.
            </p>
          </div>

          {/* --- CÓMO FUNCIONA: Pasos visuales --- */}
            <div className="relative">
               {/* Conector visual en desktop */}
               <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0" style={{ top: '4rem' }}></div>

              <div className="grid md:grid-cols-3 gap-10 relative z-10">
                {/* Paso 1 */}
                <div className="group text-center bg-white p-8 rounded-[2.5rem] hover:bg-green-50 hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="relative mb-8 inline-block">
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-green-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <span className="text-4xl font-bold text-green-600">1</span>
                    </div>
                    <div className="absolute -top-0 -right-0 bg-white rounded-full p-1">
                      <CheckCircle className="w-8 h-8 text-green-500 fill-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Crea tu Perfil
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Regístrate y completa tu perfil con tus intereses es completamente gratuito, crea tus preferencias y lo que buscas en nuestra plataforma
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/50 rounded-full text-sm text-green-700 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Verificación Segura</span>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="group text-center bg-white p-8 rounded-[2.5rem] hover:bg-blue-50 hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="relative mb-8 inline-block">
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-blue-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <span className="text-4xl font-bold text-blue-600">2</span>
                    </div>
                    <div className="absolute -top-0 -right-0 bg-white rounded-full p-1">
                      <CheckCircle className="w-8 h-8 text-blue-500 fill-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Explora Opciones
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                    Encuentra tus compañeros y descubre aficiones compartidas, desde emocionantes partidas de <strong>Mus</strong>, hasta <strong>clubes culturales o de lectura</strong>, o haz deportes como el <strong>Taichi o el Padel</strong>, realiza salidas culturales a <strong>Museos o conferencias</strong>, o simplemente queda para ir al <strong>cine o el teatro</strong> con otros usuarios, y por último te organizamos <strong>viajes por Europa y España</strong>.
                  </p>                    
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 rounded-full text-sm text-blue-700 font-bold">
                    <SearchIcon className="w-5 h-5" />
                    <span>Búsqueda Inteligente</span>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="group text-center bg-white p-8 rounded-[2.5rem] hover:bg-purple-50 hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="relative mb-8 inline-block">
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-purple-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <span className="text-4xl font-bold text-purple-600">3</span>
                    </div>
                    <div className="absolute -top-0 -right-0 bg-white rounded-full p-1">
                      <CheckCircle className="w-8 h-8 text-purple-500 fill-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Conecta y Disfruta
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Chatea con otros usuarios, organiza encuentros y actividades y construye amistades duraderas
                  </p>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Cómo Funciona (Alternate Layout) */}
      <section id="how-it-works" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white text-purple-700 text-sm font-bold mb-6 border border-purple-100 shadow-sm">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                  Tu eliges tu camino
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                  ¿Cómo funciona <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Jubilalia?</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Si buscas un compañero/a con el que compartir gastos y experiencias, o ver o crear una comunidad de Cohousing en la que retirarte.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                 {/* Items loop */}
                 {[
                     { step: 1, title: "Define tu Proyecto", desc: "¿Vives solo, tienes una habitación libre y quieres compartir gastos o tener compañía? ¿O sueñas con un Cohousing en Cádiz donde retirarte, jugar al golf o pescar con gente afín? ¿Quizás prefieres alquilar o comprar una villa en un paraíso tropical como Filipinas o República Dominicana con tu pareja o más gente? Dinos qué buscas y nosotros lo encontramos.", color: "green" },
                     { step: 2, title: "Buscamos por ti", desc: "Encontramos a la persona ideal para tu habitación o al grupo de compañeros con el mismo sueño de retiro que tú.", color: "blue" },
                     { step: 3, title: "Conectad seguros", desc: "Chatea y conoceos. Podéis convivir unos días de prueba en casa u organizar reuniones para planificar vuestra mudanza .", color: "purple" },
                     { step: 4, title: "Nueva Etapa", desc: "Si todo encaja, empieza una vida de compañía y ahorro. Ya sea en tu hogar de siempre o bajo una palmera en el paraíso.", color: "orange" }
                 ].map((item, index) => (
                    <div key={index} className={`group text-center relative p-8 rounded-[2rem] bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-${item.color}-100 h-full flex flex-col`}>
                        <div className="relative mb-6">
                            <div className={`w-20 h-20 bg-${item.color}-50 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-500`}>
                            <span className={`text-3xl font-bold text-${item.color}-600`}>{item.step}</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{item.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed flex-grow" dangerouslySetInnerHTML={{__html: item.desc.replace(/Cohousing en Cádiz|Filipinas o República Dominicana|grupo de compañeros|compañía y ahorro/g, '<strong>$&</strong>')}}></p>
                    </div>
                 ))}
              </div>
            </div>
      </section>

      {/* --- ACTIVIDADES & GRUPOS --- */}
      <section id="activities" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold tracking-wider uppercase text-xs">Agenda</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3">Actividades Destacadas</h2>
            </div>
            <button onClick={() => navigate('/dashboard/activities')} className="group text-green-600 font-bold flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 hover:bg-green-600 hover:text-white transition-all">
              Ver todo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>

          {loadingActivities ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-gray-100 rounded-3xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activities.length > 0 ? activities.map((activity) => (
                <div key={activity.id} className="hover:-translate-y-2 transition-transform duration-300">
                  <ActivityCard activity={activity} />
                </div>
              )) : (
                <div className="col-span-4 text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-300">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                  <p className="text-gray-500 text-lg">Pronto tendremos nuevas actividades para ti.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* --- GRUPOS DESTACADOS --- */}
      <section id="groups" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 pb-6 border-b border-gray-200">
            <div>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold tracking-wider uppercase text-xs">Comunidad</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3">Grupos Destacados</h2>
            </div>
            <button onClick={() => navigate('/dashboard/groups')} className="group text-blue-600 font-bold flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-blue-600 hover:text-white transition-all shadow-sm">
              Ver todo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>

          {loadingGroups ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-gray-200 rounded-3xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {groups.length > 0 ? groups.map((group) => (
                <div key={group.id} className="hover:-translate-y-2 transition-transform duration-300">
                  <GroupCard group={{
                    id: group.id,
                    name: group.name,
                    description: group.description || '',
                    category: group.category,
                    current_members: group.current_members || 0,
                    max_members: group.max_members || 0,
                    is_public: group.is_public ?? true,
                    created_at: group.created_at,
                    image_url: group.image_url
                  }} />
                </div>
              )) : (
                <div className="col-span-4 text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                  <p className="text-gray-500 text-lg">Pronto tendremos nuevos grupos para ti.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* --- FAQ SECTION (Estilo Acordeón Moderno) --- */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-gray-600">
              Resolvemos tus dudas más comunes sobre nuestra plataforma
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: '¿Es seguro usar Jubilalia?',
                answer: 'Sí, todos nuestros usuarios son verificados y tenemos sistemas de seguridad para proteger tu información personal y garantizar un entorno seguro.'
              },
              {
                question: '¿Cuánto cuesta usar la plataforma?',
                answer: 'La plataforma es completamente gratuita. Solo pagas por los servicios que decidas contratar (alojamientos, actividades, etc.).'
              },
              {
                question: '¿Puedo cancelar mi cuenta en cualquier momento?',
                answer: 'Por supuesto, puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil sin ningún costo adicional.'
              },
              {
                question: '¿Cómo contacto con el soporte?',
                answer: 'Puedes contactarnos a través de nuestro formulario de contacto, por email o por teléfono. Estamos disponibles 24/7 para ayudarte.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    openFaqIndex === index 
                    ? 'bg-green-50 border-green-200 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left focus:outline-none"
                >
                  <h3 className={`text-lg sm:text-xl font-bold pr-4 transition-colors ${openFaqIndex === index ? 'text-green-800' : 'text-gray-800'}`}>
                    {faq.question}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaqIndex === index ? 'bg-green-200' : 'bg-gray-100'}`}>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${
                        openFaqIndex === index ? 'transform rotate-180 text-green-700' : 'text-gray-500'
                        }`}
                    />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                    <p className="text-gray-700 leading-relaxed border-t border-green-200/50 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACTO (Card Flotante) --- */}
      <section id="contact" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Fondo Decorativo */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gray-800/50 rounded-l-full transform translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-green-900 to-gray-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-800 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Tienes dudas? <br/>Estamos aquí para ti.</h2>
              <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                Nuestro equipo de soporte está especializado en ayudar a personas mayores. Llámanos o escríbenos, te atenderemos con paciencia y cariño.
              </p>
              
              <div className="space-y-6">
                <a href="tel:900123456" className="flex items-center gap-6 bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Llámanos gratis</p>
                    <p className="text-2xl font-bold">900 123 456</p>
                  </div>
                </a>
                <a href="mailto:hola@jubilalia.com" className="flex items-center gap-6 bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Escríbenos</p>
                    <p className="text-2xl font-bold">hola@jubilalia.com</p>
                  </div>
                </a>
              </div>
            </div>

            <form className="bg-white rounded-[2rem] p-8 md:p-10 text-gray-900 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Envíanos un mensaje</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
                  <input type="text" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono o Email</label>
                  <input type="text" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50" placeholder="Para contactarte" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mensaje</label>
                  <textarea rows={4} className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50" placeholder="¿En qué podemos ayudarte?"></textarea>
                </div>
                <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-600/20 transition-all transform hover:scale-[1.02] active:scale-95">
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-20 pb-32 lg:pb-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src="/images/jubilogo.svg" alt="Jubilalia" className="h-10 mx-auto mb-8 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
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
            { label: 'Inicio', icon: Home, action: () => { scrollToSection('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
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

      {/* Modales */}
      <CohousingModal isOpen={isCohousingModalOpen} onClose={() => setIsCohousingModalOpen(false)} />
      <SuccessCaseModal isOpen={isSuccessCaseModalOpen} onClose={() => setIsSuccessCaseModalOpen(false)} />
    </div>
  );
};

export default LandingPage;