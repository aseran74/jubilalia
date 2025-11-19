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

  BuildingOfficeIcon as Building,

  StarIcon as Star,

  ChartBarIcon as ChartBar,

  MagnifyingGlassIcon as Search,

  UserIcon as User

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

    // Normalización simple

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

    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100 selection:text-green-900">

      

      {/* --- NAVBAR --- */}

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${

        isScrolled || isMenuOpen 

          ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100 py-2' 

          : 'bg-transparent py-4'

      }`}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between h-16">

            {/* Logo */}

            <button onClick={() => navigate('/')} className="flex-shrink-0 group relative z-50">

              <img 

                src="/images/jubilogo.svg" 

                alt="Jubilalia" 

                className={`h-10 w-auto transition-all duration-300 ${

                  isScrolled || isMenuOpen ? 'brightness-100' : 'brightness-0 invert'

                }`}

              />

            </button>



            {/* Desktop Menu */}

            <div className="hidden lg:flex items-center space-x-8">

              {['Inicio', 'Cómo Funciona', 'Qué Hacemos', 'FAQ'].map((item, idx) => {

                const ids = ['home', 'how-it-works', 'what-we-do', 'faq'];

                return (

                  <button 

                    key={item}

                    onClick={() => scrollToSection(ids[idx])}

                    className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${

                      isScrolled ? 'text-gray-600 hover:text-green-600' : 'text-white/90 hover:text-white'

                    }`}

                  >

                    {item}

                  </button>

                );

              })}

            </div>



            {/* Desktop CTA */}

            <div className="hidden lg:flex items-center space-x-4">

              <button onClick={() => navigate('/search')} className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${

                 isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'

              }`}>

                Buscar

              </button>

              

              {user ? (

                <ProfileCard isTransparent={!isScrolled} />

              ) : (

                <>

                  <button onClick={() => navigate('/login')} className={`text-sm font-semibold px-4 py-2 transition-colors ${

                    isScrolled ? 'text-gray-900 hover:text-green-600' : 'text-white hover:text-green-200'

                  }`}>

                    Entrar

                  </button>

                  <button onClick={() => navigate('/register')} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/50">

                    Registrarse

                  </button>

                </>

              )}

            </div>



            {/* Mobile Toggle */}

            <button 

              onClick={() => setIsMenuOpen(!isMenuOpen)}

              className={`lg:hidden p-2 rounded-md z-50 transition-colors ${

                isScrolled || isMenuOpen ? 'text-gray-900' : 'text-white'

              }`}

            >

              {isMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}

            </button>

          </div>

        </div>



        {/* Mobile Menu Overlay */}

        <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out lg:hidden pt-24 px-6 ${

          isMenuOpen ? 'translate-x-0' : 'translate-x-full'

        }`}>

          <div className="flex flex-col space-y-6 text-lg font-medium text-gray-800">

            <button onClick={() => scrollToSection('home')} className="text-left py-2 border-b border-gray-100">Inicio</button>

            <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2 border-b border-gray-100">Cómo Funciona</button>

            <button onClick={() => scrollToSection('what-we-do')} className="text-left py-2 border-b border-gray-100">Qué Hacemos</button>

            <button onClick={() => { setIsMenuOpen(false); navigate('/search'); }} className="text-left py-2 text-green-600">🔍 Buscar Actividades</button>

            

            <div className="pt-6 flex flex-col space-y-4">

              {user ? (

                <button onClick={() => navigate('/dashboard')} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-center shadow-lg">

                  Ir a mi Panel

                </button>

              ) : (

                <>

                  <button onClick={() => navigate('/login')} className="w-full border-2 border-gray-200 py-3 rounded-xl font-bold text-gray-600">

                    Iniciar Sesión

                  </button>

                  <button onClick={() => navigate('/register')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200">

                    Registrarse Gratis

                  </button>

                </>

              )}

            </div>

          </div>

        </div>

      </nav>



      {/* --- HERO SECTION --- */}

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

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-8 animate-fade-in-up">

            <Sparkles className="w-4 h-4 text-yellow-300" />

            <span>La comunidad #1 para disfrutar la madurez</span>

          </div>



          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">

            Conecta. Comparte. <br/>

            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-green-200">

              Vive Acompañado.

            </span>

          </h1>

          

          <p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto mb-12 font-light leading-relaxed">

            La plataforma segura para encontrar compañeros de vivienda, unirte a grupos locales y disfrutar de actividades con gente como tú.

          </p>



          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-200">

            <button onClick={handleGetStarted} className="w-full sm:w-auto px-8 py-4 bg-white text-green-700 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">

              Empezar Ahora <ArrowRight className="w-5 h-5" />

            </button>

            <button onClick={() => setIsCohousingModalOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-green-700/50 backdrop-blur-sm border border-white/30 text-white rounded-full font-bold text-lg hover:bg-green-700/70 transition-all duration-300 flex items-center justify-center gap-2">

              <Home className="w-5 h-5" /> ¿Qué es Cohousing?

            </button>

          </div>

          {/* Stats en Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-white/80 text-sm md:text-base">Usuarios Activos</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">150+</div>
              <div className="text-white/80 text-sm md:text-base">Alojamientos</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
              <div className="text-white/80 text-sm md:text-base">Actividades</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">4.9</div>
              <div className="text-white/80 text-sm md:text-base">Valoración</div>
            </div>
          </div>

        </div>

        

        {/* Wave Separator */}

        <div className="absolute bottom-0 left-0 right-0">

           <svg className="fill-white" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">

             <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>

           </svg>

        </div>

      </section>



      {/* --- FEATURES CARDS (Qué puedes hacer) --- */}

      <section className="py-20 bg-white relative z-10 -mt-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">

            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">Todo lo que necesitas</h2>

            <p className="text-xl text-gray-500">Herramientas diseñadas pensando en ti</p>

          </div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card 1 */}

            <div className="group bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2">

              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">

                <Users className="w-8 h-8 text-green-600" />

              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">Grupos y Comunidad</h3>

              <p className="text-gray-600 mb-6">Encuentra personas con tus mismos hobbies. Desde senderismo hasta clubes de lectura.</p>

              <button onClick={() => navigate('/dashboard/groups')} className="text-green-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">

                Explorar grupos <ArrowRight className="w-4 h-4" />

              </button>

            </div>



            {/* Card 2 */}

            <div className="group bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2">

              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">

                <Home className="w-8 h-8 text-blue-600" />

              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">Vivienda Compartida</h3>

              <p className="text-gray-600 mb-6">Alquila una habitación o encuentra compañeros compatibles para compartir gastos y compañía.</p>

              <button onClick={() => navigate('/dashboard/rooms')} className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">

                Ver habitaciones <ArrowRight className="w-4 h-4" />

              </button>

            </div>



            {/* Card 3 */}

            <div className="group bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2">

              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">

                <Calendar className="w-8 h-8 text-pink-600" />

              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">Actividades</h3>

              <p className="text-gray-600 mb-6">No te quedes en casa. Descubre eventos locales, talleres y viajes organizados.</p>

              <button onClick={() => navigate('/dashboard/activities')} className="text-pink-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">

                Ver agenda <ArrowRight className="w-4 h-4" />

              </button>

            </div>

          </div>

        </div>

      </section>



      {/* --- NUESTRA PLATAFORMA EN NÚMEROS --- */}

      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">

            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">

              Nuestra Plataforma en Números

            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">

              Descubre por qué miles de jubilados confían en nuestra plataforma para mejorar su calidad de vida

            </p>

          </div>



          {/* Stats Grid */}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-20">

            <div className="text-center group">

              <div className="flex justify-center mb-4">

                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">

                  <Users className="w-8 h-8 text-green-600 animate-float" />

                </div>

              </div>

              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">500+</div>

              <div className="text-base font-semibold text-gray-800 mb-2">Usuarios Activos</div>

              <div className="text-xs text-gray-600">Jubilados conectados</div>

            </div>

            <div className="text-center group">

              <div className="flex justify-center mb-4">

                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">

                  <Building className="w-8 h-8 text-blue-600 animate-float" style={{animationDelay: '0.2s'}} />

                </div>

              </div>

              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">150+</div>

              <div className="text-base font-semibold text-gray-800 mb-2">Alojamientos</div>

              <div className="text-xs text-gray-600">Casas y pisos disponibles</div>

            </div>

            <div className="text-center group">

              <div className="flex justify-center mb-4">

                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">

                  <Users className="w-8 h-8 text-purple-600 animate-float" style={{animationDelay: '0.4s'}} />

                </div>

              </div>

              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300">25+</div>

              <div className="text-base font-semibold text-gray-800 mb-2">Grupos Activos</div>

              <div className="text-xs text-gray-600">Comunidades temáticas</div>

            </div>

            <div className="text-center group">

              <div className="flex justify-center mb-4">

                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors duration-300">

                  <Calendar className="w-8 h-8 text-pink-600 animate-float" style={{animationDelay: '0.6s'}} />

                </div>

              </div>

              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-3 group-hover:scale-110 transition-transform duration-300">50+</div>

              <div className="text-base font-semibold text-gray-800 mb-2">Actividades</div>

              <div className="text-xs text-gray-600">Eventos mensuales</div>

            </div>

            <div className="text-center group">

              <div className="flex justify-center mb-4">

                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors duration-300">

                  <Star className="w-8 h-8 text-yellow-600 animate-float" style={{animationDelay: '0.8s'}} />

                </div>

              </div>

              <div className="text-4xl md:text-5xl font-bold text-yellow-600 mb-3 group-hover:scale-110 transition-transform duration-300">4.9</div>

              <div className="text-base font-semibold text-gray-800 mb-2">Valoración</div>

              <div className="text-xs text-gray-600">De nuestros usuarios</div>

            </div>

            <div className="text-center group">

              <div className="flex justify-center mb-4">

                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors duration-300">

                  <ChartBar className="w-8 h-8 text-teal-600 animate-float" style={{animationDelay: '1s'}} />

                </div>

              </div>

              <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-3 group-hover:scale-110 transition-transform duration-300">98%</div>

              <div className="text-base font-semibold text-gray-800 mb-2">Satisfacción</div>

              <div className="text-xs text-gray-600">Usuarios satisfechos</div>

            </div>

          </div>



          {/* Testimonios */}

          <div className="mb-12">

            <div className="flex items-center justify-center mb-12">

              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4 animate-float">

                <MessageCircle className="w-8 h-8 text-white" />

              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-gray-800">

                Lo que dicen nuestros usuarios

              </h3>

            </div>



            <div className="grid md:grid-cols-3 gap-8">

              {/* Testimonio 1 */}

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">

                <div className="flex items-center mb-4">

                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold mr-4 animate-float">

                    M

                  </div>

                  <div>

                    <div className="font-bold text-gray-900 text-lg">María González</div>

                    <div className="text-sm text-gray-600">Madrid, 68 años</div>

                  </div>

                </div>

                <p className="text-gray-700 italic leading-relaxed">

                  "Jubilalia me ha cambiado la vida. He encontrado compañeros maravillosos para compartir vivienda y hemos creado una amistad increíble."

                </p>

              </div>



              {/* Testimonio 2 */}

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">

                <div className="flex items-center mb-4">

                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mr-4 animate-float" style={{animationDelay: '0.2s'}}>

                    C

                  </div>

                  <div>

                    <div className="font-bold text-gray-900 text-lg">Carlos Ruiz</div>

                    <div className="text-sm text-gray-600">Barcelona, 72 años</div>

                  </div>

                </div>

                <p className="text-gray-700 italic leading-relaxed">

                  "Las actividades organizadas por la comunidad son fantásticas. Siempre hay algo interesante que hacer y gente nueva que conocer."

                </p>

              </div>



              {/* Testimonio 3 */}

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">

                <div className="flex items-center mb-4">

                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-3xl font-bold mr-4 animate-float" style={{animationDelay: '0.4s'}}>

                    A

                  </div>

                  <div>

                    <div className="font-bold text-gray-900 text-lg">Ana Martínez</div>

                    <div className="text-sm text-gray-600">Valencia, 65 años</div>

                  </div>

                </div>

                <p className="text-gray-700 italic leading-relaxed">

                  "La plataforma es muy fácil de usar y el soporte es excelente. Me siento seguro y bienvenido en esta comunidad."

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* --- SECTION: COMPARTIR (Storytelling UX) --- */}

      <section id="compartir" className="pt-12 pb-24 bg-gradient-to-b from-green-50/50 to-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          

          {/* Header Emocional */}

          <div className="text-center mb-16 max-w-4xl mx-auto">

            <div className="inline-flex justify-center items-center w-20 h-20 bg-white rounded-full shadow-md mb-6 animate-float">

              <Heart className="w-10 h-10 text-red-500 fill-current" />

            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">

              La soledad no es una opción, <br/> <span className="text-green-600">es una elección.</span>

            </h2>

            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">

              En España, más de 2 millones de personas mayores viven solas. En <strong>Jubilalia</strong> convertimos casas vacías en hogares llenos de vida.

            </p>

          </div>



          {/* Botón para abrir modal */}
          <div className="text-center mb-12">

            <button
              onClick={() => setIsSuccessCaseModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Descubre cómo funciona Jubilalia
            </button>

          </div>



          {/* Cómo funciona (Steps) con números y flechas */}

          <div className="relative">

            <div className="grid md:grid-cols-4 gap-6 relative">

              {/* Líneas con flechas entre pasos (solo desktop) */}
              <div className="hidden md:block absolute top-20 left-1/4 right-0 h-0.5 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 transform -translate-y-1/2"></div>
              <div className="hidden md:block absolute top-20 left-1/2 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-yellow-200 transform -translate-y-1/2"></div>
              <div className="hidden md:block absolute top-20 left-3/4 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-yellow-200 to-green-200 transform -translate-y-1/2"></div>
              
              {/* Flechas (solo desktop) */}
              <div className="hidden md:block absolute top-20 left-1/4 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <ArrowRight className="w-6 h-6 text-blue-500" />
              </div>
              <div className="hidden md:block absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <ArrowRight className="w-6 h-6 text-purple-500" />
              </div>
              <div className="hidden md:block absolute top-20 left-3/4 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <ArrowRight className="w-6 h-6 text-yellow-500" />
              </div>

              {[

                { num: '1', title: 'Te conocemos', desc: 'Nos cuentas quién eres, cómo vives, qué te gusta y qué esperas de la convivencia.', bgColor: 'bg-green-100', textColor: 'text-green-600' },

                { num: '2', title: 'Buscamos por ti', desc: 'En Jubilalia buscamos personas afines que también quieran compartir hogar o compañía.', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },

                { num: '3', title: 'Os conectamos', desc: 'Os ponemos en contacto para que os conozcáis sin compromiso. Podéis convivir unos días de prueba.', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },

                { num: '4', title: 'Nueva etapa', desc: 'Si todo encaja, empieza una etapa de compañía, ahorro y vida compartida.', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' }

              ].map((item, idx) => (

                <div key={idx} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center relative z-10 group">

                  <div className={`w-20 h-20 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 ${item.textColor} font-bold text-3xl`}>

                    {item.num}

                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>

                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>

                </div>

              ))}

            </div>

          </div>

          

        </div>

      </section>



      {/* --- ACTIVIDADES & GRUPOS (Dynamic Content) --- */}

      <section id="activities" className="py-24 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">

            <div>

              <span className="text-green-600 font-bold tracking-wider uppercase text-sm">Agenda</span>

              <h2 className="text-4xl font-bold text-gray-900 mt-2">Actividades Destacadas</h2>

            </div>

            <button onClick={() => navigate('/dashboard/activities')} className="text-green-600 font-bold hover:underline flex items-center gap-2">

              Ver todo <ArrowRight className="w-4 h-4"/>

            </button>

          </div>



          {loadingActivities ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {[1,2,3,4].map(i => (

                <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse"></div>

              ))}

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {activities.length > 0 ? activities.map((activity) => (

                <div key={activity.id} className="hover-lift">

                  <ActivityCard activity={activity} />

                </div>

              )) : (

                <div className="col-span-4 text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">

                  <p className="text-gray-500 text-lg">Pronto tendremos nuevas actividades para ti.</p>

                </div>

              )}

            </div>

          )}

        </div>

      </section>



      {/* --- GRUPOS DESTACADOS --- */}

      <section id="groups" className="py-24 bg-gradient-to-b from-white to-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">

            <div>

              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Comunidad</span>

              <h2 className="text-4xl font-bold text-gray-900 mt-2">Grupos Destacados</h2>

            </div>

            <button onClick={() => navigate('/dashboard/groups')} className="text-blue-600 font-bold hover:underline flex items-center gap-2">

              Ver todo <ArrowRight className="w-4 h-4"/>

            </button>

          </div>



          {loadingGroups ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {[1,2,3,4].map(i => (

                <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse"></div>

              ))}

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {groups.length > 0 ? groups.map((group) => (

                <div key={group.id} className="hover-lift">

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

                <div className="col-span-4 text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">

                  <p className="text-gray-500 text-lg">Pronto tendremos nuevos grupos para ti.</p>

                </div>

              )}

            </div>

          )}

        </div>

      </section>



      {/* --- CONTACTO SIMPLE --- */}

      <section id="contact" className="py-24 bg-gray-900 text-white relative overflow-hidden">

        <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-800/50 rounded-l-full transform translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Tienes dudas? <br/>Estamos aquí para ti.</h2>

              <p className="text-gray-400 text-lg mb-8">

                Nuestro equipo de soporte está especializado en ayudar a personas mayores. Llámanos o escríbenos, te atenderemos con paciencia y cariño.

              </p>

              

              <div className="space-y-6">

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">

                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">

                    <Phone className="w-6 h-6 text-white" />

                  </div>

                  <div>

                    <p className="text-sm text-gray-400">Llámanos gratis</p>

                    <p className="text-xl font-bold">900 123 456</p>

                  </div>

                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">

                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">

                    <Mail className="w-6 h-6 text-white" />

                  </div>

                  <div>

                    <p className="text-sm text-gray-400">Escríbenos</p>

                    <p className="text-xl font-bold">hola@jubilalia.com</p>

                  </div>

                </div>

              </div>

            </div>



            <form className="bg-white rounded-3xl p-8 text-gray-900 shadow-2xl">

              <div className="space-y-4">

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>

                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50" placeholder="Tu nombre" />

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono o Email</label>

                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50" placeholder="Para contactarte" />

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>

                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50" placeholder="¿En qué podemos ayudarte?"></textarea>

                </div>

                <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]">

                  Enviar Mensaje

                </button>

              </div>

            </form>

          </div>

        </div>

      </section>



      {/* --- FOOTER --- */}

      <footer className="bg-gray-950 text-gray-400 py-12 pb-28 lg:pb-12 border-t border-gray-900">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <img src="/images/jubilogo.svg" alt="Jubilalia" className="h-8 mx-auto mb-6 brightness-0 invert opacity-50" />

          <div className="flex justify-center space-x-8 mb-8 text-sm font-medium">

            <a href="#" className="hover:text-white">Privacidad</a>

            <a href="#" className="hover:text-white">Términos</a>

            <a href="#" className="hover:text-white">Cookies</a>

          </div>

          <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} Jubilalia. Hecho con ❤️ para nuestros mayores.</p>

        </div>

      </footer>



      {/* Mobile/Tablet Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Inicio */}
          <button
            onClick={() => {
              scrollToSection('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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

          {/* Actividades */}
          <button
            onClick={() => {
              scrollToSection('activities');
            }}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">Actividades</span>
          </button>

          {/* Perfil / Registro */}
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Perfil</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/register')}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Registro</span>
            </button>
          )}
        </div>
      </nav>

      {/* Spacer para evitar que el contenido quede oculto detrás del navbar inferior en móvil */}
      <div className="h-16 lg:hidden"></div>

      {/* Modales */}

      <CohousingModal isOpen={isCohousingModalOpen} onClose={() => setIsCohousingModalOpen(false)} />

      <SuccessCaseModal isOpen={isSuccessCaseModalOpen} onClose={() => setIsSuccessCaseModalOpen(false)} />

    </div>

  );

};



export default LandingPage;
