import React from 'react';
import { 
  XMarkIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon as MessageCircleIcon, 
  HomeIcon, 
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface SuccessCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessCaseModal: React.FC<SuccessCaseModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto my-8" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Cómo funciona Jubilalia</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Nueva forma de vivir */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <SparklesIcon className="w-8 h-8 text-yellow-500 mr-4" />
              <h3 className="text-3xl font-bold text-gray-900">Una nueva forma de vivir la madurez</h3>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              En Jubilalia creemos que la felicidad no tiene edad.
              Muchas personas viven solas, no por elección, sino porque la vida ha cambiado sus caminos.
              Por eso hemos creado un sistema sencillo, humano y seguro que te permite encontrar a alguien compatible para compartir casa, gastos… y experiencias.
            </p>
          </div>

          {/* Cómo funciona */}
          <div className="mb-10">
            <div className="flex items-center mb-6">
              <MessageCircleIcon className="w-8 h-8 text-blue-500 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900">💬 Cómo funciona</h3>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 relative">
              {/* Líneas con flechas entre pasos */}
              <div className="hidden md:block absolute top-20 left-1/4 right-0 h-0.5 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 transform -translate-y-1/2"></div>
              <div className="hidden md:block absolute top-20 left-1/2 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-yellow-200 transform -translate-y-1/2"></div>
              <div className="hidden md:block absolute top-20 left-3/4 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-yellow-200 to-green-200 transform -translate-y-1/2"></div>
              
              {/* Flechas */}
              <div className="hidden md:block absolute top-20 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <ArrowRightIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="hidden md:block absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <ArrowRightIcon className="w-6 h-6 text-purple-500" />
              </div>
              <div className="hidden md:block absolute top-20 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
                <ArrowRightIcon className="w-6 h-6 text-yellow-500" />
              </div>

              {[
                { num: '1', title: 'Te conocemos', desc: 'Nos cuentas quién eres, cómo vives, qué te gusta y qué esperas de la convivencia.', bgColor: 'bg-green-100', textColor: 'text-green-600' },
                { num: '2', title: 'Buscamos por ti', desc: 'En Jubilalia buscamos personas afines que también quieran compartir hogar o compañía.', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                { num: '3', title: 'Os conectamos', desc: 'Os ponemos en contacto para que os conozcáis sin compromiso. Podéis convivir unos días de prueba.', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
                { num: '4', title: 'Nueva etapa', desc: 'Si todo encaja, empieza una etapa de compañía, ahorro y vida compartida.', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' }
              ].map((step, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center relative z-10">
                  <div className={`w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 ${step.textColor} font-bold text-2xl`}>
                    {step.num}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ejemplo real */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <HomeIcon className="w-8 h-8 text-blue-600 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900">🏡 Ejemplo real: María y Pepa, del Barrio del Pilar</h3>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 md:p-8 border-l-8 border-blue-500">
              <div className="space-y-4 text-gray-800 text-lg">
                <p>
                  <strong>María Gonzalo Zamorano (68)</strong> y <strong>Pepa Martínez Serra (71)</strong>, ambas viudas con pensiones de 1.200 €, quitados gastos seguro salud privado, gastos comunes etc, apenas les quedaba 700€.
                </p>
                <p>
                  Nuestras amigas se conocieron gracias a Jubilalia. Al principio dudaban, pero tras unos días conviviendo descubrieron que se entendían a la perfección.
                </p>
                <p>
                  María alquiló su casa por 1.600 €, y acordó pagar 600 € a su amiga, y 800€ extra para ella. 
                  <strong className="text-blue-700"> Ahora, cada una dispone de 1.800 € netos al mes, el doble que tenían antes</strong> y encima viven acompañadas, comparten risas, comidas y nuevas aventuras y experiencias.
                </p>
                <p className="italic text-blue-900 font-medium">
                  Con Jubilalia han encontrado algo más que un techo compartido: una amiga, tranquilidad y una vida activa.
                </p>
              </div>
            </div>
          </div>

          {/* Servicios y Partners */}
          <div className="mb-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🌸 Nuestros Servicios y Partners</h3>
              <p className="text-lg text-gray-700">
                Descubre nuestros partners con descuentos exclusivos que hacen la vida más fácil. Porque vivir bien no es solo compartir casa: es disfrutar cada día con tranquilidad, sabor y bienestar.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🍽️', title: 'Alimentación', company: 'TAPPERS', desc: 'Menús caseros, equilibrados y listos para calentar. Sin preocuparse por cocinar.', borderColor: 'border-orange-400' },
                { icon: '🧹', title: 'Limpieza', company: 'CÉS GOURMET', desc: 'Tu hogar siempre limpio, cuidado y a tu gusto. Más tiempo para ti.', borderColor: 'border-blue-400' },
                { icon: '💊', title: 'Bienestar', company: 'ADESLAS y OCCIDENT', desc: 'Seguros de hogar y salud. Vivir acompañado y vivir seguro.', borderColor: 'border-red-400' },
                { icon: '🎉', title: 'Actividades', company: 'OCIO Y BIENESTAR', desc: 'Campeonatos, viajes, escapadas. Porque compartir es disfrutar.', borderColor: 'border-purple-400' }
              ].map((service, idx) => (
                <div key={idx} className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 ${service.borderColor}`}>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">{service.company}</p>
                  <p className="text-gray-700 mb-3 text-sm">{service.desc}</p>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                    🔥 Descuento Jubilalia
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonio */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 md:p-12 border-2 border-green-200 mb-8">
            <div className="flex items-center justify-center mb-6">
              <UserGroupIcon className="w-8 h-8 text-green-600 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900">💬 En palabras de María y Pepa</h3>
            </div>
            <blockquote className="text-xl italic text-gray-800 text-center border-l-4 border-green-500 pl-6">
              "Gracias a Jubilalia hemos vuelto a reír, a viajar, a sentirnos vivas.
              No somos solo compañeras de piso… somos amigas que comparten una nueva etapa de vida."
            </blockquote>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => {
                onClose();
                navigate('/register');
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Comenzar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para la flecha
const ArrowRightIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

export default SuccessCaseModal;

