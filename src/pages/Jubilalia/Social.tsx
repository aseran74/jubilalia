import React, { useState } from 'react';
import { 
  MessageCircle, 
  Users, 
  Heart, 
  Plus, 
  Bell,
  Image,
  Send,
  ThumbsUp,
  MessageSquare,
  Share2
} from 'lucide-react';

const JubilaliaSocial: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-800">Red Social</h1>
            </div>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Plus className="w-5 h-5" />
              <span>Crear Publicación</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Conecta con tu 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"> comunidad</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Comparte experiencias, crea grupos temáticos y mantén una vida social activa 
            con otros jubilados que comparten tus intereses.
          </p>
          
          {/* Estadísticas rápidas */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">500+</div>
              <div className="text-sm text-gray-600">Usuarios Activos</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">25+</div>
              <div className="text-sm text-gray-600">Grupos Temáticos</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">1000+</div>
              <div className="text-sm text-gray-600">Publicaciones</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">50+</div>
              <div className="text-sm text-gray-600">Eventos Organizados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navegación por Pestañas */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { id: 'feed', label: 'Muro de Actividad', icon: MessageCircle },
              { id: 'groups', label: 'Grupos', icon: Users },
              { id: 'events', label: 'Eventos', icon: Bell },
              { id: 'friends', label: 'Amigos', icon: Heart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-lg'
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
          {/* Muro de Actividad */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* Crear Publicación */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">U</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="¿Qué quieres compartir con la comunidad?"
                      className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                          <Image className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                          <Bell className="w-5 h-5" />
                        </button>
                      </div>
                      <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                        <Send className="w-4 h-4 inline mr-2" />
                        Publicar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publicaciones de Ejemplo */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">M</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-800">María González</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 text-sm">Hace 2 horas</span>
                    </div>
                    <p className="text-gray-700 mb-4">
                      ¡Hola comunidad! Hoy he estado en el parque del Retiro y he conocido a un grupo 
                      de jubilados que juegan al ajedrez. ¿Alguien más se anima a unirse? 
                      Sería genial formar un grupo regular. 🏛️♟️
                    </p>
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors">
                        <ThumbsUp className="w-5 h-5" />
                        <span>Me gusta (12)</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span>Comentar (5)</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span>Compartir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">J</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-800">Juan Martínez</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 text-sm">Hace 5 horas</span>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Compartiendo una foto de mi huerta urbana. Los tomates están creciendo 
                      perfectamente este año. ¿Alguien más tiene huerta? Me encantaría 
                      intercambiar consejos y semillas. 🍅🌱
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <div className="w-full h-48 bg-gradient-to-br from-green-200 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">[Imagen de la huerta]</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors">
                        <ThumbsUp className="w-5 h-5" />
                        <span>Me gusta (8)</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span>Comentar (3)</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span>Compartir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grupos */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <Users className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Grupos Temáticos</h3>
                <p className="text-gray-600 mb-6">
                  Únete a grupos de personas que comparten tus intereses
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-2">♟️ Ajedrez</h4>
                    <p className="text-gray-600 text-sm mb-3">Partidas y torneos</p>
                    <span className="text-orange-600 text-sm font-medium">45 miembros</span>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-2">🌱 Jardinería</h4>
                    <p className="text-gray-600 text-sm mb-3">Huertas y plantas</p>
                    <span className="text-green-600 text-sm font-medium">32 miembros</span>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-2">✈️ Viajes</h4>
                    <p className="text-gray-600 text-sm mb-3">Excursiones y aventuras</p>
                    <span className="text-blue-600 text-sm font-medium">28 miembros</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eventos */}
          {activeTab === 'events' && (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <Bell className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Eventos y Actividades</h3>
              <p className="text-gray-600 mb-6">
                Participa en eventos organizados por la comunidad
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Paseo por el Retiro</h4>
                  <p className="text-gray-600 text-sm mb-3">Domingo 10:00</p>
                  <span className="text-purple-600 text-sm font-medium">15 participantes</span>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Taller de Jardinería</h4>
                  <p className="text-gray-600 text-sm mb-3">Sábado 16:00</p>
                  <span className="text-green-600 text-sm font-medium">8 participantes</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Torneo de Ajedrez</h4>
                  <p className="text-gray-600 text-sm mb-3">Viernes 18:00</p>
                  <span className="text-blue-600 text-sm font-medium">12 participantes</span>
                </div>
              </div>
            </div>
          )}

          {/* Amigos */}
          {activeTab === 'friends' && (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Amigos y Conexiones</h3>
              <p className="text-gray-600 mb-6">
                Conecta con personas afines y mantén amistades
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-pink-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">María González</h4>
                  <p className="text-gray-600 text-sm mb-3">Intereses: Ajedrez, Jardinería</p>
                  <span className="text-pink-600 text-sm font-medium">Amigos desde hace 3 meses</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Juan Martínez</h4>
                  <p className="text-gray-600 text-sm mb-3">Intereses: Huerta, Viajes</p>
                  <span className="text-blue-600 text-sm font-medium">Amigos desde hace 1 mes</span>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Carmen López</h4>
                  <p className="text-gray-600 text-sm mb-3">Intereses: Música, Lectura</p>
                  <span className="text-green-600 text-sm font-medium">Amigos desde hace 2 semanas</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default JubilaliaSocial;
