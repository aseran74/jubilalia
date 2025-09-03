import React from 'react';
import { Users, Building, MessageCircle, Calendar, Star, Heart } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Usuarios Activos',
      description: 'Jubilados conectados',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Building,
      value: '150+',
      label: 'Alojamientos',
      description: 'Casas y pisos disponibles',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      value: '25+',
      label: 'Grupos Activos',
      description: 'Comunidades temáticas',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Calendar,
      value: '50+',
      label: 'Actividades',
      description: 'Eventos mensuales',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Star,
      value: '4.9',
      label: 'Valoración',
      description: 'De nuestros usuarios',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Heart,
      value: '98%',
      label: 'Satisfacción',
      description: 'Usuarios satisfechos',
      color: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Nuestra Plataforma en Números
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre por qué miles de jubilados confían en nuestra plataforma para mejorar su calidad de vida
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 group-hover:text-gray-700 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonios */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Lo que dicen nuestros usuarios
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Jubilalia me ha cambiado la vida. He encontrado compañeros maravillosos para compartir vivienda y hemos creado una amistad increíble."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-800">María González</div>
                  <div className="text-sm text-gray-500">Madrid, 68 años</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Las actividades organizadas por la comunidad son fantásticas. Siempre hay algo interesante que hacer y gente nueva que conocer."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  C
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Carlos Ruiz</div>
                  <div className="text-sm text-gray-500">Barcelona, 72 años</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "La plataforma es muy fácil de usar y el soporte es excelente. Me siento seguro y bienvenido en esta comunidad."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Ana Martínez</div>
                  <div className="text-sm text-gray-500">Valencia, 65 años</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
