import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  MessageCircle, 
  Calendar, 
  Heart,
  ArrowRight,
  Star
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProfileCard from '../../components/landing/ProfileCard';

const JubilaliaHome: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Jubilalia</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <ProfileCard />
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 border-2 border-green-500 text-green-600 rounded-full font-semibold hover:bg-green-500 hover:text-white transition-all duration-200"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Encuentra tu 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500"> compañía perfecta</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Jubilalia conecta personas jubiladas para compartir vivienda, crear amistades y disfrutar de la vida juntos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xl font-bold rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>{user ? "Ir al Dashboard" : "Empezar Ahora"}</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-xl font-semibold rounded-full hover:border-gray-400 transition-all duration-200">
              Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-800 mb-16">
            ¿Qué ofrece Jubilalia?
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Compartir Habitación */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Compartir Habitación</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Encuentra compañeros de habitación compatibles con tus gustos y preferencias
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-green-500" />
                  <span>Filtros por edad y preferencias</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-green-500" />
                  <span>Chat interno para conocerse</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-green-500" />
                  <span>Perfiles detallados</span>
                </li>
              </ul>
            </div>

            {/* Alojamientos Grandes */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Alojamientos Grandes</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Descubre casas y residencias perfectas para vivir en comunidad
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span>Marketplace de viviendas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span>Unirse con otras parejas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span>Filtros por precio y ubicación</span>
                </li>
              </ul>
            </div>

            {/* Red Social */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Red Social de Ocio</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Organiza actividades y mantén contacto con tu comunidad
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Muro de actividades</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Grupos temáticos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Calendario de eventos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-blue-500">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-16">
            Jubilalia en números
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-green-100 text-lg">Usuarios activos</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-green-100 text-lg">Alojamientos</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-green-100 text-lg">Grupos activos</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-green-100 text-lg">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-gray-800 mb-6">
            ¿Listo para empezar tu nueva aventura?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Únete a Jubilalia y descubre una nueva forma de vivir la jubilación
          </p>
          <Link
            to="/jubilalia/register"
            className="inline-block px-10 py-5 bg-gradient-to-r from-green-500 to-blue-500 text-white text-2xl font-bold rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Crear mi perfil gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Jubilalia</span>
              </div>
              <p className="text-gray-300">
                Conectando personas jubiladas para una vida mejor
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Servicios</h5>
              <ul className="space-y-2 text-gray-300">
                <li>Compartir habitación</li>
                <li>Alojamientos grandes</li>
                <li>Red social</li>
                <li>Actividades</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Soporte</h5>
              <ul className="space-y-2 text-gray-300">
                <li>Centro de ayuda</li>
                <li>Contacto</li>
                <li>FAQ</li>
                <li>Seguridad</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-300">
                <li>Términos de uso</li>
                <li>Privacidad</li>
                <li>Cookies</li>
                <li>Condiciones</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Jubilalia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JubilaliaHome;
