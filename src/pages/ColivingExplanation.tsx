import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon,
  MagnifyingGlassIcon as SearchIcon,
  PlusIcon,
  DocumentTextIcon,
  UserGroupIcon as UsersIcon,
  BuildingOfficeIcon as BuildingIcon,
  LockClosedIcon as KeyIcon,
  BanknotesIcon as CurrencyDollarIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

const ColivingExplanation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Las tres versiones de coliving
  const colivingVersions = [
    {
      id: 'habitaciones',
      title: 'Tu casa, tu refugio… ahora compartido',
      subtitle: 'Alquila una habitación y gana compañía, estabilidad y tranquilidad',
      icon: HomeIcon,
      color: 'bg-blue-500',
      description: 'Si tienes una vivienda en propiedad, no necesitas mudarte ni cambiar tu vida. Solo abrir una parte de tu hogar a otra persona afín a ti.',
      detailedDescription: 'Tu casa sigue siendo tuya. La diferencia es que ahora suma.',
      benefits: [
        { emoji: '💶', text: 'Ingresos extra para vivir más desahogado' },
        { emoji: '🤝', text: 'Compañía diaria, sin soledad' },
        { emoji: '🛡️', text: 'Seguridad y apoyo mutuo' },
        { emoji: '🧠', text: 'Tranquilidad: tú sigues mandando en tu casa' }
      ],
      highlights: [
        '👉 Tú eliges a la persona, el ritmo y las normas.',
        '👉 Convivencia respetuosa, clara y pensada para seniors.'
      ],
      features: [
        'Publica tu habitación disponible',
        'Busca habitaciones en tu zona',
        'Crea posts para encontrar compañero/a',
        'Comparte gastos y compañía'
      ],
      actions: [
        { label: 'Ver Anuncios', action: () => navigate('/dashboard/rooms'), icon: SearchIcon },
        { label: 'Publicar Habitación', action: () => navigate('/dashboard/rooms/create'), icon: PlusIcon },
        { label: 'Ver Posts', action: () => navigate('/dashboard/posts'), icon: DocumentTextIcon }
      ]
    },
    {
      id: 'alquiler',
      title: 'Alquilar juntos: vivir mejor gastando menos',
      subtitle: 'Comparte alquiler con personas como tú',
      icon: KeyIcon,
      color: 'bg-green-500',
      description: '¿Por qué afrontar un alquiler solo cuando puedes vivir mejor acompañado?',
      detailedDescription: 'No es compartir por necesidad. Es compartir por calidad de vida.',
      benefits: [
        { emoji: '🏠', text: 'Viviendas mejores y más amplias' },
        { emoji: '💸', text: 'Menos gasto mensual' },
        { emoji: '🌱', text: 'Un día a día más activo y social' },
        { emoji: '🧩', text: 'Reparto de responsabilidades' }
      ],
      idealFor: [
        'No quieres atarte a una propiedad',
        'Buscas flexibilidad',
        'Valoras la convivencia y el apoyo mutuo'
      ],
      features: [
        'Residencias para mayores',
        'Colivings en alquiler',
        'Inmuebles grandes compartidos',
        'Comunidades establecidas',
        'Publica posts para buscar compañeros: "Estamos buscando un grupo de 8 personas para alquilar en Filipinas este inmueble, ya somos 2"'
      ],
      actions: [
        { label: 'Buscar Alquileres', action: () => navigate('/dashboard/properties/rental'), icon: SearchIcon },
        { label: 'Publicar Alquiler', action: () => navigate('/dashboard/properties/rental/create'), icon: PlusIcon },
        { label: 'Publicar Post', action: () => navigate('/dashboard/properties/rental/posts'), icon: DocumentTextIcon },
        { label: 'Ver Residencias', action: () => navigate('/dashboard/properties/rental'), icon: BuildingIcon }
      ]
    },
    {
      id: 'venta',
      title: 'Comprar juntos hoy para jubilarte tranquilo mañana',
      subtitle: 'Una decisión inteligente para el futuro',
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      description: 'Esta es la opción para quienes piensan a largo plazo.',
      detailedDescription: 'Invertir juntos no es solo una decisión financiera. Es una decisión de vida.',
      benefits: [
        { emoji: '🏡', text: 'Hogar propio' },
        { emoji: '📉', text: 'Menos incertidumbre económica' },
        { emoji: '🤍', text: 'Personas de confianza alrededor' },
        { emoji: '🌅', text: 'Una jubilación vivida, no sobrevivida' }
      ],
      whatYouCanDo: [
        'Comprar un terreno o propiedad',
        'Diseñar un espacio adaptado a la jubilación',
        'Reducir costes de compra y mantenimiento',
        'Crear una comunidad estable y humana'
      ],
      features: [
        'Comprar entre varios',
        'Colivings en venta',
        'Inmuebles para parejas',
        'Inversión compartida',
        'Publica posts para buscar socios: "Buscamos un terreno apto para hacer un coliving en Málaga para 20 residentes, base construible 800 metros cuadrados"'
      ],
      actions: [
        { label: 'Buscar Propiedades', action: () => navigate('/dashboard/properties/sale'), icon: SearchIcon },
        { label: 'Publicar Venta', action: () => navigate('/dashboard/properties/sale/create'), icon: PlusIcon },
        { label: 'Publicar Post', action: () => navigate('/dashboard/properties/sale/posts'), icon: DocumentTextIcon },
        { label: 'Ver Ofertas', action: () => navigate('/dashboard/properties/sale'), icon: BuildingIcon }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Barra superior de estado simulada */}
      <div className="bg-white px-4 py-1.5 flex items-center justify-between text-xs text-gray-600 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <span className="font-medium">19:40</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs">14</span>
          <div className="w-5 h-3 border-2 border-gray-600 rounded-sm relative">
            <div className="absolute inset-0.5 bg-gray-600 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="flex items-center">
            <img 
              src="/images/jubilogo.svg" 
              alt="Jubilalia" 
              className="h-7 w-auto"
            />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(user ? '/dashboard/profile' : '/login')}
            className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UsersIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            🏡 Tres caminos para vivir mejor, acompañado y con tranquilidad
          </h1>
          <p className="text-lg text-green-50 mb-2 font-medium">
            La convivencia no es solo compartir un espacio.
          </p>
          <p className="text-lg text-green-50 mb-6">
            Es compartir seguridad, bienestar y futuro.
          </p>
          <p className="text-base text-green-100 max-w-2xl mx-auto">
            En nuestra plataforma te ofrecemos tres formas reales y humanas de hacerlo posible, 
            adaptadas a tu momento vital y a tus objetivos.
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="px-4 py-6 max-w-6xl mx-auto">
        {/* Introducción */}
        <section className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ No se trata solo de vivienda</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Se trata de cómo quieres vivir los próximos años.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-gray-700 font-semibold">
              <span>📈 Más acompañado.</span>
              <span>🛡️ Más tranquilo.</span>
              <span>🕊️ Más libre.</span>
            </div>
            <p className="text-gray-600 mt-4 leading-relaxed">
              Nosotros te ayudamos a encontrar el modelo y las personas adecuadas.<br/>
              <strong className="text-gray-900">Tú eliges el camino.</strong>
            </p>
          </div>
        </section>

        {/* Las tres versiones de Coliving */}
        {colivingVersions.map((version, index) => {
          const Icon = version.icon;
          return (
            <section key={version.id} className="mb-8">
              {/* Tarjeta principal de la versión */}
              <div className={`${version.color} rounded-3xl p-6 text-white shadow-lg mb-4`}>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-2xl p-4 flex-shrink-0">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                        Opción {index + 1}
                      </span>
                      <h2 className="text-2xl font-bold">{version.title}</h2>
                    </div>
                    <p className="text-white/90 text-sm mb-3">{version.subtitle}</p>
                    <p className="text-white/80 text-sm leading-relaxed">{version.description}</p>
                  </div>
                </div>
              </div>

              {/* Beneficios / Qué ganas */}
              {version.benefits && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {version.id === 'habitaciones' ? '¿Qué ganas?' : 
                     version.id === 'alquiler' ? 'Unir fuerzas permite acceder a:' :
                     '¿El resultado?'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {version.benefits.map((benefit: { emoji: string; text: string }, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{benefit.emoji}</span>
                        <span className="text-gray-700 text-sm leading-relaxed">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights / Ideal para / Qué puedes hacer */}
              {version.highlights && (
                <div className="bg-blue-50 rounded-2xl p-6 shadow-sm border border-blue-100 mb-4">
                  <div className="space-y-2">
                    {version.highlights.map((highlight: string, idx: number) => (
                      <p key={idx} className="text-gray-800 text-sm font-medium">{highlight}</p>
                    ))}
                  </div>
                </div>
              )}

              {version.idealFor && (
                <div className="bg-green-50 rounded-2xl p-6 shadow-sm border border-green-100 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Ideal si:</h3>
                  <ul className="space-y-2">
                    {version.idealFor.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {version.whatYouCanDo && (
                <div className="bg-purple-50 rounded-2xl p-6 shadow-sm border border-purple-100 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Unirte a otras personas para:</h3>
                  <ul className="space-y-2">
                    {version.whatYouCanDo.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Descripción detallada */}
              {version.detailedDescription && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
                  <p className="text-gray-800 text-base font-semibold italic text-center">
                    {version.detailedDescription}
                  </p>
                </div>
              )}

              {/* Características técnicas */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Funcionalidades
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {version.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones con explicaciones */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">¿Cómo empezar?</h3>
                <div className="space-y-4">
                  {version.actions.map((action, idx) => {
                    const ActionIcon = action.icon;
                    const explanations: Record<string, string> = {
                      'Buscar Alquileres': 'Explora las residencias y colivings disponibles en alquiler. Filtra por ubicación, precio y características.',
                      'Publicar Alquiler': 'Si tienes una propiedad o residencia para alquilar, publícala aquí y encuentra inquilinos compatibles.',
                      'Publicar Post': 'Crea un post para buscar compañeros. Ejemplo: "Buscamos 6 personas para alquilar una villa en Filipinas, ya somos 2".',
                      'Ver Residencias': 'Consulta todas las residencias disponibles en tu zona.',
                      'Buscar Propiedades': 'Explora propiedades en venta, ideales para comprar en grupo o crear un coliving.',
                      'Publicar Venta': 'Publica tu propiedad si buscas venderla a un grupo de personas o para crear un coliving.',
                      'Ver Ofertas': 'Revisa todas las propiedades disponibles para compra compartida.',
                      'Ver Anuncios': 'Explora las habitaciones disponibles en tu zona.',
                      'Publicar Habitación': 'Si tienes una habitación libre, publícala aquí y encuentra el compañero ideal.',
                      'Ver Posts': 'Consulta los posts de personas buscando compañeros para compartir vivienda.'
                    };
                    const explanation = explanations[action.label] || '';
                    return (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                        <button
                          onClick={action.action}
                          className="w-full flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-gray-100 group-hover:bg-gray-200 rounded-lg p-2 transition-colors">
                              <ActionIcon className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
                            </div>
                            <div className="text-left flex-1">
                              <span className="text-sm font-bold text-gray-900 block">{action.label}</span>
                              {explanation && (
                                <span className="text-xs text-gray-600 mt-1 block">{explanation}</span>
                              )}
                            </div>
                          </div>
                          <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        {/* Sección con fotos de personas senior */}
        <section className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Personas como tú ya están disfrutando del coliving
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { name: 'María', age: 68, location: 'Madrid' },
              { name: 'Carlos', age: 72, location: 'Barcelona' },
              { name: 'Ana', age: 65, location: 'Valencia' },
              { name: 'José', age: 70, location: 'Sevilla' }
            ].map((person, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                  <span className="text-white text-2xl font-bold">{person.name.charAt(0)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{person.name}</p>
                <p className="text-xs text-gray-600">{person.age} años</p>
                <p className="text-xs text-gray-500">{person.location}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-sm">
            Más de 500 personas mayores ya forman parte de nuestra comunidad de coliving
          </p>
        </section>

        {/* Sección de ayuda */}
        <section className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">¿No estás seguro de cuál elegir?</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Si solo tienes una habitación libre en tu casa, elige <strong>Habitaciones</strong>. 
                Si buscas alquilar o ya tienes una residencia completa, elige <strong>Alquiler</strong>. 
                Si quieres comprar una propiedad junto con otras personas, elige <strong>Venta</strong>.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Explorar todas las opciones
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Barra de navegación inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-green-600 transition-colors"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Inicio</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/activities')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-400 hover:text-green-600 transition-colors"
          >
            <SearchIcon className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Buscar</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-400 hover:text-green-600 transition-colors"
          >
            <DocumentTextIcon className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/rooms/create')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-400 hover:text-green-600 transition-colors"
          >
            <PlusIcon className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Publicar</span>
          </button>
          <button
            onClick={() => navigate(user ? '/dashboard/profile' : '/login')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-400 hover:text-green-600 transition-colors"
          >
            <UsersIcon className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ColivingExplanation;
