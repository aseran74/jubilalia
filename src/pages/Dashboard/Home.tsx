import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building, 
  MessageCircle, 
  Calendar, 
  Home,
  Search,
  Heart,
  MapPin,
  Star,
  Plus,
  ArrowRight,
  User,
  Settings,
  Bell
} from 'lucide-react';
import PageMeta from "../../components/common/PageMeta";

export default function JubilaliaDashboardHome() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <PageMeta
        title="Jubilalia Dashboard | Plataforma para Jubilados"
        description="Dashboard principal de Jubilalia - Conecta, comparte y disfruta de la vida juntos"
      />
      
      {/* Header del Dashboard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ¡Bienvenido a Jubilalia! 🏠
        </h1>
        <p className="text-lg text-gray-600">
          Tu plataforma para conectar con otros jubilados, compartir vivienda y disfrutar de actividades juntos
        </p>
      </div>

      {/* Navegación por Pestañas */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Vista General', icon: Home },
            { id: 'roommates', label: 'Compartir Habitación', icon: Users },
            { id: 'accommodations', label: 'Alojamientos', icon: Building },
            { id: 'social', label: 'Red Social', icon: MessageCircle },
            { id: 'activities', label: 'Actividades', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="space-y-8">
        {/* Vista General */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Métricas Principales */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">150+</h3>
                <p className="text-gray-600">Usuarios Activos</p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">25+</h3>
                <p className="text-gray-600">Alojamientos</p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">12</h3>
                <p className="text-gray-600">Grupos Activos</p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">8</h3>
                <p className="text-gray-600">Eventos Esta Semana</p>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="col-span-12">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Acciones Rápidas</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Link
                    to="/roommates"
                    className="group p-6 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-xl text-center hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Search className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg">Buscar Compañeros</h4>
                    <p className="text-sm opacity-90 mt-2">Encuentra personas compatibles</p>
                  </Link>
                  
                  <Link
                    to="/accommodations"
                    className="group p-6 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl text-center hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Building className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg">Ver Alojamientos</h4>
                    <p className="text-sm opacity-90 mt-2">Descubre viviendas perfectas</p>
                  </Link>
                  
                  <Link
                    to="/social"
                    className="group p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl text-center hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <MessageCircle className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg">Red Social</h4>
                    <p className="text-sm opacity-90 mt-2">Conecta con tu comunidad</p>
                  </Link>
                  
                  <Link
                    to="/activities"
                    className="group p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl text-center hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Calendar className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg">Actividades</h4>
                    <p className="text-sm opacity-90 mt-2">Participa en eventos</p>
                  </Link>
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Actividad Reciente</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">Nuevo compañero disponible en Madrid</p>
                      <p className="text-gray-600 text-sm">María, 65 años, le gusta la jardinería</p>
                    </div>
                    <span className="text-gray-400 text-sm">Hace 2 horas</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">Nuevo alojamiento en Barcelona</p>
                      <p className="text-gray-600 text-sm">Casa con jardín, 3 habitaciones, €800/mes</p>
                    </div>
                    <span className="text-gray-400 text-sm">Hace 5 horas</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">Nueva actividad: Paseo por el Retiro</p>
                      <p className="text-gray-600 text-sm">Organizado por Juan, este domingo a las 10:00</p>
                    </div>
                    <span className="text-gray-400 text-sm">Hace 1 día</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas</h3>
                <div className="space-y-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                    <p className="text-green-700 font-medium">Usuarios Satisfechos</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">€450</div>
                    <p className="text-blue-700 font-medium">Ahorro Promedio/Mes</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
                    <p className="text-purple-700 font-medium">Ciudades Activas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compartir Habitación */}
        {activeTab === 'roommates' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Compartir Habitación</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encuentra compañeros de habitación compatibles con tus gustos, horarios y estilo de vida. 
                Una forma económica y social de vivir.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <Search className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Buscar Compañeros</h3>
                <p className="text-gray-600">Filtra por edad, gustos, horarios y más</p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chat Interno</h3>
                <p className="text-gray-600">Conoce a tu futuro compañero antes de decidir</p>
              </div>
              
              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <Heart className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Perfiles Verificados</h3>
                <p className="text-gray-600">Personas reales y confiables</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to="/roommates"
                className="inline-flex items-center space-x-2 bg-green-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                <span>Empezar a Buscar</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Alojamientos */}
        {activeTab === 'accommodations' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <Building className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Alojamientos</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre alojamientos perfectos para compartir con otros jubilados. 
                Casas, pisos y residencias con todas las comodidades que necesitas.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ubicaciones Premium</h3>
                <p className="text-gray-600">Zonas bien comunicadas y seguras</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <Star className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Alojamientos Verificados</h3>
                <p className="text-gray-600">Propiedades inspeccionadas y seguras</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Comunidad Jubilada</h3>
                <p className="text-gray-600">Solo para personas de 55+ años</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to="/accommodations"
                className="inline-flex items-center space-x-2 bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                <span>Ver Alojamientos</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Red Social */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <MessageCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Red Social</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Conecta con otros jubilados, comparte experiencias, crea grupos temáticos 
                y mantén una vida social activa y enriquecedora.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <Users className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Grupos Temáticos</h3>
                <p className="text-gray-600">Ajedrez, jardinería, viajes, música...</p>
              </div>
              
              <div className="text-center p-6 bg-red-50 rounded-xl">
                <MessageCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Muro de Actividad</h3>
                <p className="text-gray-600">Comparte fotos, pensamientos y noticias</p>
              </div>
              
              <div className="text-center p-6 bg-pink-50 rounded-xl">
                <Heart className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Amistades</h3>
                <p className="text-gray-600">Conecta con personas afines</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to="/social"
                className="inline-flex items-center space-x-2 bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                <span>Explorar Red Social</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Actividades */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <Calendar className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Actividades</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Participa en actividades organizadas por la comunidad: paseos, talleres, 
                excursiones, juegos y mucho más. ¡Nunca te aburrirás!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Calendario de Eventos</h3>
                <p className="text-gray-600">Actividades programadas y organizadas</p>
              </div>
              
              <div className="text-center p-6 bg-pink-50 rounded-xl">
                <Plus className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Crear Actividades</h3>
                <p className="text-gray-600">Organiza tus propias actividades</p>
              </div>
              
              <div className="text-center p-6 bg-indigo-50 rounded-xl">
                <Bell className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Notificaciones</h3>
                <p className="text-gray-600">Recibe avisos de actividades cercanas</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to="/activities"
                className="inline-flex items-center space-x-2 bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                <span>Ver Actividades</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
