import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon as Users, 
  BuildingOfficeIcon as Building, 
  ChatBubbleLeftRightIcon as MessageCircle, 
  CalendarIcon as Calendar, 
  ChevronDownIcon as ChevronDown,
  Bars3Icon as Menu,
  XMarkIcon as X,
  ArrowRightIcon as ArrowRight,
  PhoneIcon as Phone,
  EnvelopeIcon as Mail,
  MapPinIcon as MapPin,
  BuildingOfficeIcon as Facebook,
  BuildingOfficeIcon as Twitter,
  BuildingOfficeIcon as Instagram,
  BuildingOfficeIcon as Linkedin
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import ProfileCard from '../components/landing/ProfileCard';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import FeaturedContent from '../components/landing/FeaturedContent';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
    if (user) {
              navigate('/dashboard');
      } else {
        navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Transparente */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/images/jubilogo.svg" 
                alt="Logo" 
                className={`w-48 h-15 transition-all duration-300 ${
                  isScrolled ? 'filter brightness-0' : 'filter brightness-0 invert'
                }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className={`font-medium transition-colors hover:text-green-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Inicio
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className={`font-medium transition-colors hover:text-green-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Cómo Funciona
              </button>
              <button 
                onClick={() => scrollToSection('what-we-do')}
                className={`font-medium transition-colors hover:text-green-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Qué Hacemos
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className={`font-medium transition-colors hover:text-green-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                FAQ
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className={`font-medium transition-colors hover:text-green-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Contacto
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="transition-all duration-300">
                  <ProfileCard isTransparent={!isScrolled} />
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`font-medium transition-colors hover:text-green-500 ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-500 text-white px-6 py-3 rounded-full font-medium hover:bg-green-600 transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="block w-full text-left text-gray-700 hover:text-green-500 font-medium py-2"
              >
                Inicio
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left text-gray-700 hover:text-green-500 font-medium py-2"
              >
                Cómo Funciona
              </button>
              <button 
                onClick={() => scrollToSection('what-we-do')}
                className="block w-full text-left text-gray-700 hover:text-green-500 font-medium py-2"
              >
                Qué Hacemos
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left text-gray-700 hover:text-green-500 font-medium py-2"
              >
                FAQ
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left text-gray-700 hover:text-green-500 font-medium py-2"
              >
                Contacto
              </button>
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/dashboard"
                      className="block w-full text-left text-gray-700 hover:text-green-500 font-medium py-2"
                    >
                      Ir al Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block w-full text-left text-gray-700 hover:text-green-500 font-medium py-2"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full bg-green-500 text-white px-6 py-3 rounded-full font-medium hover:bg-green-600 transition-colors text-center"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 overflow-hidden pt-20 sm:pt-24 lg:pt-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Conecta, Comparte,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Vive Mejor
            </span>
          </h1>
          
                     <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
             Somos la primera plataforma que conecta a personas senior ,  para compartir vivienda, 
             crear amistades y disfrutar de actividades juntos. ¡Únete a nuestra comunidad!
           </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Empezar Ahora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Saber Más</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Usuarios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-white/80">Alojamientos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80">Actividades</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.9</div>
              <div className="text-white/80">Valoración</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
                         <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
               ¿Cómo Funciona Nuestra Plataforma?
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En solo 3 pasos simples puedes empezar a disfrutar de todos los beneficios de nuestra plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Crea tu Perfil</h3>
                             <p className="text-gray-600">
                 Regístrate y completa tu perfil con tus intereses, preferencias y lo que buscas en nuestra plataforma
               </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Explora Opciones</h3>
              <p className="text-gray-600">
                Descubre alojamientos, encuentra compañeros o únete a actividades que te interesen
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Conecta y Disfruta</h3>
              <p className="text-gray-600">
                Chatea con otros usuarios, organiza encuentros y construye amistades duraderas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Qué Hacemos */}
      <section id="what-we-do" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
                         <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
               ¿Qué Hacemos en Nuestra Plataforma?
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma ofrece múltiples servicios para mejorar tu calidad de vida
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50">
              <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Compartir Habitación</h3>
              <p className="text-gray-600">
                Encuentra compañeros compatibles para compartir vivienda y reducir gastos
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50">
              <Building className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Alojamientos Grandes</h3>
              <p className="text-gray-600">
                Explora casas y pisos grandes para vivir en comunidad
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <MessageCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Red Social</h3>
              <p className="text-gray-600">
                Conecta con otros jubilados y comparte experiencias
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-orange-50">
              <Calendar className="w-16 h-16 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Actividades</h3>
              <p className="text-gray-600">
                Participa en eventos y actividades organizadas por la comunidad
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              ¿Listo para empezar?
            </h3>
                         <p className="text-gray-600 mb-8">
               Únete a miles de jubilados que ya están disfrutando de nuestra plataforma
             </p>
            <button
              onClick={handleGetStarted}
              className="bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Empezar Ahora
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

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

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Oficina</h4>
                    <p className="text-gray-600">Calle Mayor 123, Madrid, España</p>
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

      {/* Contenido Destacado */}
      <FeaturedContent />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
                         <div>
               <div className="flex items-center space-x-3 mb-4">
                 <img 
                   src="/images/jubilogo.svg" 
                   alt="Logo" 
                   className="w-24 h-8"
                 />
               </div>
              <p className="text-gray-400">
                Conectando jubilados para una vida mejor juntos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Compartir Habitación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alojamientos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Red Social</a></li>
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
    </div>
  );
};

export default LandingPage;
