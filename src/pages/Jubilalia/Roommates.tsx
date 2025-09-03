import React from 'react';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  Search,
  Filter,
  Star,
  MapPin
} from 'lucide-react';

const JubilaliaRoommates: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-800">Compartir Habitación</h1>
            </div>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Search className="w-5 h-5" />
              <span>Buscar Compañeros</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Encuentra tu 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500"> compañero ideal</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Conecta con otros jubilados que buscan compartir vivienda. 
            Encuentra personas compatibles con tus gustos, horarios y estilo de vida.
          </p>
          
          {/* Estadísticas rápidas */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">200+</div>
              <div className="text-sm text-gray-600">Compañeros Disponibles</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">30+</div>
              <div className="text-sm text-gray-600">Ciudades Activas</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">150+</div>
              <div className="text-sm text-gray-600">Emparejamientos Exitosos</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">4.9</div>
              <div className="text-sm text-gray-600">Valoración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Información sobre el servicio */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  ¿Por qué compartir habitación en Jubilalia?
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ahorra dinero en alquiler y gastos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compañía y seguridad las 24 horas</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Perfiles verificados y seguros</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Chat interno para conocerse antes</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  ¿Buscas compañero?
                </h4>
                <p className="text-gray-600 mb-4">
                  Crea tu perfil y encuentra personas compatibles para compartir vivienda.
                </p>
                <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  Crear Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Características principales */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <Search className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Búsqueda Inteligente</h3>
              <p className="text-gray-600">
                Filtra por edad, gustos, horarios, si fuma/no fuma y más criterios
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chat Interno</h3>
              <p className="text-gray-600">
                Conoce a tu futuro compañero antes de decidir compartir vivienda
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <Heart className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Perfiles Verificados</h3>
              <p className="text-gray-600">
                Todas las personas están verificadas y son reales
              </p>
            </div>
          </div>

          {/* Placeholder para lista de compañeros */}
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Lista de Compañeros</h3>
            <p className="text-gray-600 mb-6">
              Aquí se mostrarán los perfiles de personas disponibles para compartir habitación
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                <Filter className="w-5 h-5 inline mr-2" />
                Aplicar Filtros
              </button>
              <button className="px-6 py-3 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-500 hover:text-white transition-colors">
                <Search className="w-5 h-5 inline mr-2" />
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JubilaliaRoommates;
