import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  Heart,
  Bell,
  Search,
  Filter,
  Star,
  ArrowRight
} from 'lucide-react';

const JubilaliaActivities: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-800">Actividades</h1>
            </div>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Plus className="w-5 h-5" />
              <span>Crear Actividad</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Participa en 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"> actividades increíbles</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Únete a eventos organizados por la comunidad: paseos, talleres, excursiones, 
            juegos y mucho más. ¡Nunca te aburrirás en Jubilalia!
          </p>
          
          {/* Estadísticas rápidas */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">50+</div>
              <div className="text-sm text-gray-600">Eventos Este Mes</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">300+</div>
              <div className="text-sm text-gray-600">Participantes</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">15</div>
              <div className="text-sm text-gray-600">Eventos Esta Semana</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">4.8</div>
              <div className="text-sm text-gray-600">Valoración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navegación por Pestañas */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { id: 'upcoming', label: 'Próximos Eventos', icon: Calendar },
              { id: 'my-activities', label: 'Mis Actividades', icon: Heart },
              { id: 'create', label: 'Crear Actividad', icon: Plus },
              { id: 'calendar', label: 'Calendario', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Próximos Eventos */}
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              {/* Filtros de búsqueda */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar actividades..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                    <Filter className="w-5 h-5" />
                    <span>Filtros</span>
                  </button>
                </div>
              </div>

              {/* Lista de eventos */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Evento 1 */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">🌳 Paseo por el Retiro</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Paseo por el Retiro</h3>
                    <p className="text-gray-600 mb-4">
                      Disfruta de un agradable paseo por el parque más emblemático de Madrid. 
                      Conoceremos su historia y disfrutaremos de la naturaleza.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Domingo, 10:00 - 12:00</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Parque del Retiro, Madrid</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>15 participantes</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                        Apuntarme
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evento 2 */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">🌱 Taller de Jardinería</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Taller de Jardinería</h3>
                    <p className="text-gray-600 mb-4">
                      Aprende técnicas básicas de jardinería urbana. Cultiva tus propias 
                      plantas y verduras en casa.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Sábado, 16:00 - 18:00</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Centro Cultural, Barcelona</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>8 participantes</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                        Apuntarme
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evento 3 */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">♟️ Torneo de Ajedrez</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Torneo de Ajedrez</h3>
                    <p className="text-gray-600 mb-4">
                      Participa en nuestro torneo mensual de ajedrez. Todos los niveles 
                      son bienvenidos.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Viernes, 18:00 - 21:00</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Club de Ajedrez, Valencia</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>12 participantes</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                        Apuntarme
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evento 4 */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">🎵 Concierto Clásico</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Concierto Clásico</h3>
                    <p className="text-gray-600 mb-4">
                      Disfruta de música clásica en un entorno íntimo. 
                      Obras de Mozart, Beethoven y Bach.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Martes, 20:00 - 22:00</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Auditorio Nacional, Madrid</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>25 participantes</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                        Apuntarme
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evento 5 */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-pink-200 to-red-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">📚 Club de Lectura</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Club de Lectura</h3>
                    <p className="text-gray-600 mb-4">
                      Discute libros interesantes con otros amantes de la lectura. 
                      Este mes: "El Quijote".
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Jueves, 17:00 - 19:00</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Biblioteca Municipal, Sevilla</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>10 participantes</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                        Apuntarme
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evento 6 */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">🚶‍♀️ Senderismo</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Ruta de Senderismo</h3>
                    <p className="text-gray-600 mb-4">
                      Ruta fácil por la sierra de Madrid. Disfruta de vistas 
                      espectaculares y aire puro.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Sábado, 9:00 - 14:00</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Sierra de Guadarrama</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>18 participantes</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                        Apuntarme
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mis Actividades */}
          {activeTab === 'my-activities' && (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Mis Actividades</h3>
              <p className="text-gray-600 mb-6">
                Aquí verás todas las actividades en las que te has apuntado
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-pink-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Paseo por el Retiro</h4>
                  <p className="text-gray-600 text-sm mb-3">Domingo 10:00</p>
                  <span className="text-pink-600 text-sm font-medium">Confirmado</span>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Taller de Jardinería</h4>
                  <p className="text-gray-600 text-sm mb-3">Sábado 16:00</p>
                  <span className="text-green-600 text-sm font-medium">Confirmado</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Torneo de Ajedrez</h4>
                  <p className="text-gray-600 text-sm mb-3">Viernes 18:00</p>
                  <span className="text-blue-600 text-sm font-medium">Pendiente</span>
                </div>
              </div>
            </div>
          )}

          {/* Crear Actividad */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="text-center mb-8">
                <Plus className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Crear Nueva Actividad</h3>
                <p className="text-gray-600">
                  Organiza una actividad para la comunidad de Jubilalia
                </p>
              </div>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la Actividad
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Paseo por el Retiro"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>Seleccionar categoría</option>
                      <option>Paseos y Excursiones</option>
                      <option>Talleres y Cursos</option>
                      <option>Deportes y Juegos</option>
                      <option>Cultura y Arte</option>
                      <option>Social y Networking</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Describe tu actividad..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (horas)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Parque del Retiro, Madrid"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número Máximo de Participantes
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Crear Actividad
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Calendario */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <Calendar className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Calendario de Actividades</h3>
              <p className="text-gray-600 mb-6">
                Vista mensual de todas las actividades disponibles
              </p>
              <div className="bg-gray-100 rounded-xl p-8">
                <div className="text-gray-500 text-lg">
                  [Aquí se mostrará el calendario interactivo con todas las actividades]
                </div>
                <p className="text-gray-600 mt-4">
                  El calendario mostrará las actividades organizadas por fecha, 
                  permitiendo ver fácilmente qué eventos están disponibles cada día.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default JubilaliaActivities;
