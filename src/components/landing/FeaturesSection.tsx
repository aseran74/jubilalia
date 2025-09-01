import React from 'react';
import { 
  Shield, 
  Heart, 
  Users, 
  Building, 
  MessageCircle, 
  Calendar, 
  Star,
  CheckCircle
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description: 'Todos nuestros usuarios son verificados y tenemos sistemas de seguridad avanzados para proteger tu información.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Heart,
      title: 'Comunidad Acogedora',
      description: 'Únete a una comunidad de jubilados que comparten tus intereses y valores.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Users,
      title: 'Búsqueda Inteligente',
      description: 'Encuentra compañeros perfectos con nuestro sistema de búsqueda avanzado y filtros personalizados.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Building,
      title: 'Alojamientos Verificados',
      description: 'Todos los alojamientos son inspeccionados y verificados para garantizar tu seguridad y comodidad.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'Chat Integrado',
      description: 'Comunícate de forma segura con otros usuarios antes de tomar decisiones importantes.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Calendar,
      title: 'Actividades Organizadas',
      description: 'Participa en eventos y actividades organizadas por la comunidad o crea las tuyas propias.',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const benefits = [
    'Reducción de gastos de vivienda',
    'Compañía y amistades duraderas',
    'Actividades sociales regulares',
    'Soporte 24/7 disponible',
    'Plataforma fácil de usar',
    'Sin costos ocultos'
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
                     <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
             ¿Por qué elegirnos?
           </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestra plataforma está diseñada específicamente para jubilados, 
            con características que hacen que compartir vivienda y socializar sea fácil y seguro
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-gray-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
                         <h3 className="text-3xl font-bold text-gray-800 mb-6">
               Beneficios de unirte a nuestra plataforma
             </h3>
            <p className="text-lg text-gray-600 mb-8">
              Descubre cómo nuestra plataforma puede mejorar significativamente tu calidad de vida 
              durante la jubilación, ofreciendo soluciones prácticas y oportunidades sociales.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                <h4 className="font-semibold text-gray-800">Garantía de Satisfacción</h4>
              </div>
                             <p className="text-gray-600 text-sm">
                 Si no estás completamente satisfecho con tu experiencia en nuestra plataforma 
                 durante los primeros 30 días, te devolvemos tu dinero.
               </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 lg:p-12">
              <div className="text-center">
                                               <img 
                  src="/images/jubilogo.svg" 
                  alt="Logo" 
                  className="w-32 h-32 mx-auto mb-6"
                />
                <h4 className="text-2xl font-bold text-gray-800 mb-4">
                  ¡Únete a la Comunidad!
                </h4>
                                 <p className="text-gray-600 mb-6">
                   Miles de jubilados ya están disfrutando de los beneficios de nuestra plataforma. 
                   ¿Qué esperas para unirte?
                 </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Usuarios activos</span>
                    <span className="font-semibold text-gray-800">500+</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Alojamientos disponibles</span>
                    <span className="font-semibold text-gray-800">150+</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Actividades mensuales</span>
                    <span className="font-semibold text-gray-800">50+</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Valoración promedio</span>
                    <span className="font-semibold text-gray-800">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 -left-8 w-12 h-12 bg-green-400 rounded-full opacity-20 animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
