import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon as Users, 
  BuildingOfficeIcon as Building, 
  ChatBubbleLeftRightIcon as MessageCircle, 
  CalendarIcon as Calendar, 
  ChevronDownIcon as ChevronDown,
  ArrowRightIcon as ArrowRight,
  PhoneIcon as Phone,
  EnvelopeIcon as Mail,
  BuildingOfficeIcon as Facebook,
  BuildingOfficeIcon as Twitter,
  BuildingOfficeIcon as Instagram,
  BuildingOfficeIcon as Linkedin,
  UserIcon as User,
  HomeIcon as Home,
  CurrencyEuroIcon as CurrencyEuro,
  KeyIcon as Key,
  HeartIcon as Heart,
  SparklesIcon as Sparkles,
  ShieldCheckIcon as Shield,
  SparklesIcon as Spray,
  CakeIcon as UtensilsCrossed,
  GiftIcon as PartyPopper
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import ProfileCard from '../components/landing/ProfileCard';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import CohousingModal from '../components/landing/CohousingModal';


const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCohousingModalOpen, setIsCohousingModalOpen] = useState(false);
  const [showCompartirDetails, setShowCompartirDetails] = useState(false);
  // const [activeSection, setActiveSection] = useState('home');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    console.log('handleGetStarted - Usuario:', user);
    if (user) {
      console.log('handleGetStarted - Navegando al dashboard...');
              navigate('/dashboard');
      } else {
      console.log('handleGetStarted - Navegando al registro...');
        navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
            >
              <img 
                src="/images/jubilogo.svg" 
                alt="Jubilalia Logo" 
                className={`w-38 h-12 transition-all duration-500 ${
                  isScrolled ? 'filter brightness-0' : 'filter brightness-0 invert'
                } group-hover:scale-110`}
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { id: 'home', label: 'Inicio' },
                { id: 'how-it-works', label: 'Cómo Funciona' },
                { id: 'what-we-do', label: 'Qué Hacemos' },
                { id: 'faq', label: 'FAQ' },
                { id: 'contact', label: 'Contacto' }
              ].map((item) => (
              <button 
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 font-medium transition-all duration-300 hover:text-green-500 group ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="transition-all duration-300">
                  <ProfileCard isTransparent={!isScrolled} />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className={`font-medium transition-all duration-300 hover:text-green-500 hover:scale-105 ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-all duration-300 hover:bg-white/10"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45' : ''
                }`}></span>
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45' : ''
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl">
            <div className="px-4 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
              {[
                { id: 'home', label: 'Inicio', icon: '🏠' },
                { id: 'how-it-works', label: 'Cómo Funciona', icon: '⚙️' },
                { id: 'what-we-do', label: 'Qué Hacemos', icon: '🎯' },
                { id: 'faq', label: 'FAQ', icon: '❓' },
                { id: 'contact', label: 'Contacto', icon: '📞' }
              ].map((item) => (
              <button 
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center w-full text-left text-gray-700 hover:text-green-500 font-medium py-3 px-4 rounded-lg hover:bg-green-50 transition-all duration-300 group"
              >
                  <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              ))}
              
              <div className="pt-4 border-t border-gray-200 mt-4">
                {user ? (
                  <div className="space-y-4">
                    {/* Profile Card for Mobile */}
                    <div className="flex items-center justify-center mb-4">
                      <ProfileCard isTransparent={false} />
                    </div>
                    
                    <button
                      onClick={() => {
                        console.log('Botón Dashboard móvil - Usuario:', user);
                        console.log('Botón Dashboard móvil - Navegando...');
                        navigate('/dashboard');
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">📊</span>
                      <span>Ir al Dashboard</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center w-full text-left text-gray-700 hover:text-green-500 font-medium py-3 px-4 rounded-lg hover:bg-green-50 transition-all duration-300 group"
                    >
                      <span className="text-lg mr-3">🔑</span>
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                    >
                      Registrarse Ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 overflow-hidden pt-32 sm:pt-36 lg:pt-40">
        {/* Modern Geometric Background */}
        <div className="absolute inset-0 overflow-hidden">
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
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16 lg:py-20">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Plataforma #1 para Jubilados
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight animate-fade-in-up">
            Conecta, Comparte,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 animate-gradient-x">
              Vive Mejor
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Somos la primera plataforma que conecta a personas senior, para compartir vivienda o crear comunidades donde jubilarse, 
            crear amistades y disfrutar de actividades juntos. ¡Únete a nuestra comunidad!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <button
              onClick={handleGetStarted}
              className="group bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center space-x-2 hover:scale-105 transform"
            >
              <span>Empezar Ahora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setIsCohousingModalOpen(true)}
              className="group bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center space-x-2 hover:scale-105 transform"
            >
              <span>¿Qué es Cohousing?</span>
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 flex items-center space-x-2 hover:scale-105 transform backdrop-blur-sm"
            >
              <span>Saber Más</span>
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>

          {/* Enhanced Stats */}
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

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-white/60 text-sm font-medium">Desliza para explorar</span>
          <ChevronDown className="w-6 h-6 text-white/60" />
          </div>
        </div>
      </section>

      {/* Cards de Funcionalidades */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Funcionalidades Principales
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Nuestras <span className="gradient-text">Funcionalidades</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre todo lo que puedes hacer en nuestra plataforma diseñada específicamente para jubilados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {/* Card Grupos */}
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 hover:border-green-200 hover-lift relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <Users className="w-10 h-10 text-green-600" />
              </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors">Grupos</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Únete a grupos de personas con intereses similares y crea comunidades duraderas
              </p>
              <button 
                onClick={() => navigate('/dashboard/groups')}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold transition-all duration-300 group-hover:scale-105"
              >
                Explorar Grupos
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              </div>
            </div>

            {/* Card Personas */}
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 hover:border-blue-200 hover-lift relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <User className="w-10 h-10 text-blue-600" />
              </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">Personas</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Conecta con personas senior en tu área y haz nuevas amistades significativas
              </p>
              <button 
                onClick={() => navigate('/dashboard/users')}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300 group-hover:scale-105"
              >
                Conocer Personas
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              </div>
            </div>

            {/* Card Habitaciones */}
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 hover:border-purple-200 hover-lift relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <Home className="w-10 h-10 text-purple-600" />
              </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-purple-700 transition-colors">Habitaciones</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Encuentra habitaciones disponibles para compartir vivienda de forma segura
              </p>
              <button 
                onClick={() => navigate('/dashboard/rooms')}
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-all duration-300 group-hover:scale-105"
              >
                Ver Habitaciones
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              </div>
            </div>

            {/* Card Venta */}
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 hover:border-orange-200 hover-lift relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <CurrencyEuro className="w-10 h-10 text-orange-600" />
              </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-orange-700 transition-colors">Venta</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Explora propiedades en venta, que van desde comunidades coliving, chalets en la costa para vivir varias parejas, o un apartamento coqueto.
              </p>
              <button 
                onClick={() => navigate('/dashboard/properties/sale')}
                  className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition-all duration-300 group-hover:scale-105"
              >
                Ver Propiedades
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              </div>
            </div>

            {/* Card Alquiler */}
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 hover:border-teal-200 hover-lift relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <Key className="w-10 h-10 text-teal-600" />
              </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-teal-700 transition-colors">Alquiler</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Explora propiedades en alquiler, que van desde comunidades coliving, casas compartidas en la playa, o un piso acogedor en la ciudad.
              </p>
              <button 
                onClick={() => navigate('/dashboard/properties/rental')}
                  className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-all duration-300 group-hover:scale-105"
              >
                Ver Alquileres
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer" onClick={handleGetStarted}>
              <span>Explorar Todas las Funcionalidades</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Proceso Simple
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              ¿Cómo Funciona <span className="gradient-text">Nuestra Plataforma?</span>
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              En solo 3 pasos simples puedes empezar a disfrutar de todos los beneficios de nuestra plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Paso 1 */}
            <div className="group text-center relative">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <span className="text-4xl font-bold text-green-600">1</span>
              </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 group-hover:text-green-700 transition-colors">Crea tu Perfil</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                 Regístrate y completa tu perfil con tus intereses, preferencias y lo que buscas en nuestra plataforma
               </p>
              <div className="mt-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Verificación Segura
                </div>
              </div>
            </div>


            {/* Paso 2 */}
            <div className="group text-center relative">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <span className="text-4xl font-bold text-blue-600">2</span>
              </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 group-hover:text-blue-700 transition-colors">Explora Opciones</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Descubre alojamientos, encuentra compañeros o únete a actividades que te interesen
              </p>
              <div className="mt-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Búsqueda Inteligente
                </div>
              </div>
            </div>


            {/* Paso 3 */}
            <div className="group text-center relative">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <span className="text-4xl font-bold text-purple-600">3</span>
              </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 group-hover:text-purple-700 transition-colors">Conecta y Disfruta</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Chatea con otros usuarios, organiza encuentros y construye amistades duraderas
              </p>
              <div className="mt-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Comunidad Activa
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                ¿Listo para empezar tu viaje?
              </h3>
              <p className="text-gray-600 mb-6">
                Únete a miles de jubilados que ya están disfrutando de una vida más conectada y social
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Empezar Ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Qué Hacemos */}
      <section id="what-we-do" className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-80 h-80 bg-pink-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
              Nuestros Servicios
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              ¿Qué Hacemos en <span className="gradient-text">Nuestra Plataforma?</span>
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nuestra plataforma ofrece múltiples servicios para mejorar tu calidad de vida y conectar con personas afines
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 transition-all duration-500 hover-lift border border-green-100 hover:border-green-200">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors">Habitaciones</h3>
              <p className="text-gray-600 leading-relaxed">
                Encuentra habitaciones disponibles para compartir vivienda de forma segura. Si vives solo, encuentra compañeros con nuestro sistema Jubilalia, con los que compartir tu vivienda y compartir gastos y experiencias.
              </p>
              <div className="mt-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  Ahorro Garantizado
                </div>
              </div>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-500 hover-lift border border-blue-100 hover:border-blue-200">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Building className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">Alojamientos Grandes</h3>
              <p className="text-gray-600 leading-relaxed">
                Explora casas y pisos grandes para vivir en comunidad con todas las comodidades
              </p>
              <div className="mt-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  Espacios Amplios
                </div>
              </div>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-500 hover-lift border border-purple-100 hover:border-purple-200">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-purple-700 transition-colors">Red Social</h3>
              <p className="text-gray-600 leading-relaxed">
                Conecta con otros jubilados y comparte experiencias, consejos y momentos especiales
              </p>
              <div className="mt-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                  Comunidad Activa
                </div>
              </div>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-orange-50 hover:from-pink-100 hover:to-orange-100 transition-all duration-500 hover-lift border border-pink-100 hover:border-pink-200">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-pink-700 transition-colors">Actividades</h3>
              <p className="text-gray-600 leading-relaxed">
                Participa en eventos y actividades organizadas por la comunidad o crea las tuyas propias
              </p>
              <div className="mt-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
                  Eventos Regulares
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-50"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">
                  ¿Listo para transformar tu jubilación?
            </h3>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Únete a miles de jubilados que ya están disfrutando de una vida más conectada, social y llena de oportunidades
             </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              Empezar Ahora
            </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                  >
                    Más Información
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Compartir - Vive acompañado */}
      <section id="compartir" className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              💚 Vive acompañado, vive mejor con Jubilalia
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Porque sabemos que en España viven solas, con 65 o más años, aproximadamente <strong>1.511.000 mujeres</strong> y <strong>620.400 hombres</strong>,
              en Jubilalia creamos soluciones reales para que puedan disfrutar de una convivencia plena, tranquila y feliz.
            </p>
          </div>

          {/* Nueva forma de vivir */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <div className="flex items-center mb-6">
              <Sparkles className="w-8 h-8 text-yellow-500 mr-4" />
              <h3 className="text-3xl font-bold text-gray-900">Una nueva forma de vivir la madurez</h3>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              En Jubilalia creemos que la felicidad no tiene edad.
              Muchas personas viven solas, no por elección, sino porque la vida ha cambiado sus caminos.
              Por eso hemos creado un sistema sencillo, humano y seguro que te permite encontrar a alguien compatible para compartir casa, gastos… y experiencias.
            </p>
          </div>

          {/* Cómo funciona */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              <MessageCircle className="w-8 h-8 text-blue-500 mr-4" />
              <h3 className="text-3xl font-bold text-gray-900">💬 Cómo funciona</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Te conocemos</h4>
                <p className="text-gray-700">
                  Nos cuentas quién eres, cómo vives, qué te gusta y qué esperas de la convivencia.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Buscamos por ti</h4>
                <p className="text-gray-700">
                  En Jubilalia buscamos personas afines que también quieran compartir hogar o compañía.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Os conectamos</h4>
                <p className="text-gray-700">
                  Os ponemos en contacto para que os conozcáis sin compromiso. Podéis convivir unos días de prueba.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-xl mb-4">4</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Nueva etapa</h4>
                <p className="text-gray-700">
                  Si todo encaja, empieza una etapa de compañía, ahorro y vida compartida.
                </p>
              </div>
            </div>
          </div>

          {/* Botón Saber Más */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowCompartirDetails(!showCompartirDetails)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              {showCompartirDetails ? 'Ver menos' : 'Saber más sobre casos reales y servicios'}
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showCompartirDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Contenido desplegable */}
          {showCompartirDetails && (
            <div className="space-y-12 mb-12 animate-fadeIn">
              {/* Ejemplo real */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-xl p-8 md:p-12 border-l-8 border-blue-500">
                <div className="flex items-center mb-6">
                  <Home className="w-8 h-8 text-blue-600 mr-4" />
                  <h3 className="text-2xl font-bold text-gray-900">🏡 Ejemplo real: María y Pepa, del Barrio del Pilar</h3>
                </div>
                <div className="space-y-4 text-gray-800 text-lg">
                  <p>
                    <strong>María Gonzalo Zamorano (68)</strong> y <strong>Pepa Martínez Serra (71)</strong>, ambas viudas con pensiones de 1.400 €, se conocieron gracias a Jubilalia.
                    Al principio dudaban, pero tras unos días conviviendo descubrieron que se entendían a la perfección.
                  </p>
                  <p>
                    María alquiló su casa por 1.400 €, y acordaron pagar 700 € cada una.
                    <strong className="text-blue-700"> Ahora, cada una dispone de 1.800 € netos al mes</strong>, viven acompañadas, comparten risas, comidas y nuevas aventuras.
                  </p>
                  <p className="italic text-blue-900 font-medium">
                    Con Jubilalia han encontrado algo más que un techo compartido: una amiga, tranquilidad y una vida activa.
                  </p>
                </div>
              </div>

              {/* Servicios */}
              <div>
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">🌸 Servicios que hacen la vida más fácil</h3>
                  <p className="text-lg text-gray-700">
                    Porque vivir bien no es solo compartir casa: es disfrutar cada día con tranquilidad, sabor y bienestar.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-orange-400">
                    <UtensilsCrossed className="w-10 h-10 text-orange-500 mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">🍽️ Alimentación</h4>
                    <p className="text-sm text-gray-600 mb-2 font-semibold">TAPPERS</p>
                    <p className="text-gray-700">
                      Menús caseros, equilibrados y listos para calentar. Sin preocuparse por cocinar.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-blue-400">
                    <Spray className="w-10 h-10 text-blue-500 mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">🧹 Limpieza</h4>
                    <p className="text-sm text-gray-600 mb-2 font-semibold">CÉS GOURMET</p>
                    <p className="text-gray-700">
                      Tu hogar siempre limpio, cuidado y a tu gusto. Más tiempo para ti.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-red-400">
                    <Shield className="w-10 h-10 text-red-500 mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">💊 Bienestar</h4>
                    <p className="text-sm text-gray-600 mb-2 font-semibold">ADESLAS</p>
                    <p className="text-gray-700">
                      Seguros de hogar y salud. Vivir acompañado y vivir seguro.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-purple-400">
                    <PartyPopper className="w-10 h-10 text-purple-500 mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">🎉 Actividades</h4>
                    <p className="text-sm text-gray-600 mb-2 font-semibold">OCIO Y BIENESTAR</p>
                    <p className="text-gray-700">
                      Campeonatos, viajes, escapadas. Porque compartir es disfrutar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonio */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 md:p-12 border-2 border-green-200">
                <div className="flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-green-600 mr-4" />
                  <h3 className="text-2xl font-bold text-gray-900">💬 En palabras de María y Pepa</h3>
                </div>
                <blockquote className="text-xl italic text-gray-800 text-center border-l-4 border-green-500 pl-6">
                  "Gracias a Jubilalia hemos vuelto a reír, a viajar, a sentirnos vivas.
                  No somos solo compañeras de piso… somos amigas que comparten una nueva etapa de vida."
                </blockquote>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Comenzar ahora
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Preguntas Frecuentes
            </h2>
                         <p className="text-xl text-gray-600">
               Resolvemos tus dudas más comunes sobre nuestra plataforma
             </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ¿Es seguro usar Jubilalia?
              </h3>
              <p className="text-gray-600">
                Sí, todos nuestros usuarios son verificados y tenemos sistemas de seguridad 
                para proteger tu información personal y garantizar un entorno seguro.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ¿Cuánto cuesta usar la plataforma?
              </h3>
              <p className="text-gray-600">
                La plataforma es completamente gratuita. Solo pagas por los servicios 
                que decidas contratar (alojamientos, actividades, etc.).
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ¿Puedo cancelar mi cuenta en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Por supuesto, puedes cancelar tu cuenta en cualquier momento desde 
                la configuración de tu perfil sin ningún costo adicional.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ¿Cómo contacto con el soporte?
              </h3>
              <p className="text-gray-600">
                Puedes contactarnos a través de nuestro formulario de contacto, 
                por email o por teléfono. Estamos disponibles 24/7 para ayudarte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Contáctanos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ¿Tienes alguna pregunta o sugerencia? Nos encantaría escucharte
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Información de Contacto */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Información de Contacto
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Teléfono</h4>
                    <p className="text-gray-600">+34 900 123 456</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600">hola@jubilalia.com</p>
                  </div>
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-800 mb-4">Síguenos</h4>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-white hover:bg-pink-700 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Envíanos un Mensaje
              </h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Escribe tu mensaje aquí..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
                         <div>
               <div className="flex items-center space-x-3 mb-4">
                 <img 
                   src="/images/jubilogo.svg" 
                   alt="Logo" 
                  className="w-24 h-8 filter brightness-0 invert"
                 />
               </div>
              <p className="text-gray-400">
                Conectando jubilados para una vida mejor juntos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Habitaciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alquiler</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Venta</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Actividades</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prensa</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Jubilalia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Cohousing Modal */}
      <CohousingModal 
        isOpen={isCohousingModalOpen} 
        onClose={() => setIsCohousingModalOpen(false)} 
      />
    </div>
  );
};

export default LandingPage;
