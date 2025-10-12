import React from 'react';
import { X } from 'lucide-react';
import { 
  HeartIcon as Heart, 
  UserGroupIcon as Users, 
  HomeIcon as Home, 
  ChatBubbleLeftRightIcon as MessageCircle, 
  CheckCircleIcon as CheckCircle, 
  SparklesIcon as Sparkles, 
  CakeIcon as UtensilsCrossed, 
  SparklesIcon as Spray, 
  ShieldCheckIcon as Shield, 
  GiftIcon as PartyPopper 
} from '@heroicons/react/24/outline';

interface CompartirInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CompartirInfoModal: React.FC<CompartirInfoModalProps> = ({ isOpen, onClose }) => {
  console.log('CompartirInfoModal - isOpen:', isOpen);
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Vive acompañado, vive mejor con Jubilalia</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Introducción */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <p className="text-lg text-gray-700 leading-relaxed">
              Porque sabemos que en España viven solas, con 65 o más años, aproximadamente <strong>1.511.000 mujeres</strong> y <strong>620.400 hombres</strong>,
              en Jubilalia creamos soluciones reales para que puedan disfrutar de una convivencia plena, tranquila y feliz.
            </p>
          </div>

          {/* Una nueva forma de vivir */}
          <div>
            <div className="flex items-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Una nueva forma de vivir la madurez</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              En Jubilalia creemos que la felicidad no tiene edad.
              Muchas personas viven solas, no por elección, sino porque la vida ha cambiado sus caminos.
              Por eso hemos creado un sistema sencillo, humano y seguro que te permite encontrar a alguien compatible para compartir casa, gastos… y experiencias.
            </p>
          </div>

          {/* Cómo funciona */}
          <div>
            <div className="flex items-center mb-6">
              <MessageCircle className="w-6 h-6 text-blue-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Cómo funciona</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold mr-4">1</div>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Primero, te conocemos.</strong> Nos cuentas quién eres, cómo vives, qué te gusta y qué esperas de la convivencia.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold mr-4">2</div>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Después, en Jubilalia buscamos por ti</strong> a personas afines que también quieran compartir hogar o compañía.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold mr-4">3</div>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Cuando encontramos a alguien compatible,</strong> os ponemos en contacto para que os conozcáis sin compromiso.
                  Incluso podéis convivir unos días de prueba, solo para ver cómo os sentís.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold mr-4">4</div>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Y si todo encaja…</strong> empieza una nueva etapa.
                  Una etapa de compañía, ahorro, y sobre todo, vida compartida.
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplo real */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <div className="flex items-center mb-4">
              <Home className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Ejemplo real: María y Pepa, del Barrio del Pilar</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>María Gonzalo Zamorano (68)</strong> y <strong>Pepa Martínez Serra (71)</strong>, ambas viudas con pensiones de 1.400 €, se conocieron gracias a Jubilalia.
                Al principio dudaban, pero tras unos días conviviendo descubrieron que se entendían a la perfección.
              </p>
              <p>
                María alquiló su casa por 1.400 €, y acordaron pagar 700 € cada una.
                <strong> Ahora, cada una dispone de 1.800 € netos al mes</strong>, viven acompañadas, comparten risas, comidas y nuevas aventuras.
              </p>
              <p className="italic">
                Con Jubilalia han encontrado algo más que un techo compartido: una amiga, tranquilidad y una vida activa.
              </p>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Servicios que hacen la vida más fácil</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Porque vivir bien no es solo compartir casa: es disfrutar cada día con tranquilidad, sabor y bienestar.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alimentación */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <UtensilsCrossed className="w-6 h-6 text-orange-500 mr-3" />
                  <h4 className="text-lg font-bold text-gray-900">Alimentación – TAPPERS</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Menús caseros, equilibrados y listos para calentar.
                  Cada semana eligen sus platos favoritos desde Tappers.es, sin preocuparse por cocinar.
                  <br /><span className="text-orange-600 font-semibold">🥗 Comida rica, sana y sin esfuerzo.</span>
                </p>
              </div>

              {/* Limpieza */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <Spray className="w-6 h-6 text-blue-500 mr-3" />
                  <h4 className="text-lg font-bold text-gray-900">Limpieza – CÉS GOURMET</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Tu hogar siempre limpio, cuidado y a tu gusto.
                  Con CÉS GOURMET y Interdomicilio, ofrecemos servicios de limpieza, planchado y ayuda doméstica.
                  <br /><span className="text-blue-600 font-semibold">✨ Más tiempo para ti, menos para las tareas.</span>
                </p>
              </div>

              {/* Bienestar */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <Shield className="w-6 h-6 text-red-500 mr-3" />
                  <h4 className="text-lg font-bold text-gray-900">Bienestar – ADESLAS</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Nuestros seguros de hogar y salud, en colaboración con Adeslas, te dan la tranquilidad que necesitas.
                  Cobertura médica, asistencia y protección.
                  <br /><span className="text-red-600 font-semibold">🛡️ Vivir acompañado y vivir seguro.</span>
                </p>
              </div>

              {/* Actividades */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <PartyPopper className="w-6 h-6 text-purple-500 mr-3" />
                  <h4 className="text-lg font-bold text-gray-900">Actividades y ocio</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Desde campeonatos de mus y spas hasta escapadas culturales y viajes por Europa, Jubilalia te conecta con nuevas experiencias y amistades.
                  <br /><span className="text-purple-600 font-semibold">🧳 Porque compartir también es disfrutar.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Testimonios */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">En palabras de María y Pepa</h3>
            </div>
            <blockquote className="text-lg italic text-gray-700 border-l-4 border-green-500 pl-4">
              "Gracias a Jubilalia hemos vuelto a reír, a viajar, a sentirnos vivas.
              No somos solo compañeras de piso… somos amigas que comparten una nueva etapa de vida."
            </blockquote>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            Comenzar ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompartirInfoModal;

