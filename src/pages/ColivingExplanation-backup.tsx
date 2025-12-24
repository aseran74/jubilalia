// Backup de la versión actual antes de cambiar
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon,
  UserGroupIcon as UsersIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

const ColivingExplanation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const colivingOptions = [
    {
      id: 'habitaciones',
      number: '1)',
      title: 'Compartir vivienda: una habitación, una compañía',
      description: 'Si tienes una habitación libre o un espacio habitable y te gustaría compartir tu hogar con otra persona compatible, Jubilalia se encarga de buscarte el compañero o compañera ideal.',
      description2: 'Y al revés: si buscas una habitación en un hogar tranquilo, con personas afines a ti, la aplicación te ayuda a encontrarla.',
      highlight: 'Compartir no es solo ahorrar gastos: es ganar compañía, seguridad y bienestar.',
      actions: [
        { label: 'Ver habitaciones', path: '/dashboard/rooms', icon: SearchIcon },
        { label: 'Publicar habitación', path: '/dashboard/rooms/create', icon: PlusIcon }
      ]
    },
    {
      id: 'alquiler',
      number: '2)',
      title: 'Alquiler colaborativo: vivir mejor, sin comprar',
      description: 'Aquí entran distintas opciones de alquiler adaptadas a cada necesidad:',
      options: [
        'Coliving ya existente: por ejemplo, una plaza en un coliving con 40 o 50 personas, con gastos incluidos y servicios comunes.',
        'Residencias o viviendas compartidas con precio mensual claro y sin complicaciones.',
        'Alquiler en grupo: como alquilar entre varias personas una casa grande o un chalet (por ejemplo, una vivienda de 7 habitaciones durante varios años), reduciendo costes y creando una pequeña comunidad estable.'
      ],
      highlight: 'Todo con transparencia, acompañamiento y pensando en el largo plazo.',
      actions: [
        { label: 'Ver alquileres', path: '/dashboard/properties/rental', icon: SearchIcon },
        { label: 'Publicar alquiler', path: '/dashboard/properties/rental/create', icon: PlusIcon }
      ]
    },
    {
      id: 'venta',
      number: '3)',
      title: 'Compra compartida: invertir juntos para vivir juntos',
      description: 'Para quienes quieren ir un paso más allá, Jubilalia también facilita la compra colaborativa:',
      options: [
        'Comprar un terreno y construir un proyecto de coliving.',
        'Comprar un edificio entero entre varios socios.',
        'Crear una comunidad estable donde cada persona es copropietaria.'
      ],
      highlight: 'Una forma de invertir con sentido, pensando en el futuro, la convivencia y la tranquilidad.',
      actions: [
        { label: 'Ver oportunidades de compra', path: '/dashboard/properties/sale', icon: SearchIcon },
        { label: 'Publicar venta', path: '/dashboard/properties/sale/create', icon: PlusIcon }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <header className="bg-white px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <img 
          src="/images/jubilogo.svg" 
          alt="Jubilalia" 
          className="h-8 w-auto cursor-pointer" 
          onClick={() => navigate('/')} 
        />
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <DocumentTextIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Tres formas de vivir acompañado, con tranquilidad y libertad
          </h1>
          <p className="text-lg sm:text-xl text-green-50 max-w-3xl mx-auto leading-relaxed mb-8">
            En Jubilalia creemos que jubilarse no significa estar solo, sino elegir cómo y con quién vivir. 
            Por eso hemos creado una plataforma pensada para personas mayores que quieren compartir, 
            alquilar o invertir juntas en nuevas formas de vivienda, con seguridad y acompañamiento.
          </p>
          
          {/* Valores principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <div className="flex flex-col items-center">
              <ShieldCheckIcon className="w-10 h-10 mb-3 text-green-200" />
              <h3 className="font-bold text-lg mb-2">Seguridad</h3>
            </div>
            <div className="flex flex-col items-center">
              <UsersIcon className="w-10 h-10 mb-3 text-green-200" />
              <h3 className="font-bold text-lg mb-2">Comunidad</h3>
            </div>
            <div className="flex flex-col items-center">
              <HeartIcon className="w-10 h-10 mb-3 text-green-200" />
              <h3 className="font-bold text-lg mb-2">Acompañamiento</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {colivingOptions.map((option, index) => (
          <section key={option.id} className={`mb-16 lg:mb-24 ${index > 0 ? 'pt-8 border-t border-gray-200' : ''}`}>
            <div className="mb-6">
              <span className="text-2xl font-bold text-green-600 mb-2 block">{option.number}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {option.title}
              </h2>
            </div>

            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                {option.description}
              </p>
              
              {option.description2 && (
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {option.description2}
                </p>
              )}

              {option.options && (
                <ul className="space-y-3 mb-4">
                  {option.options.map((opt, idx) => (
                    <li key={idx} className="text-gray-700 text-lg leading-relaxed flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-1">•</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              )}

              {option.highlight && (
                <div className="bg-green-50 border-l-4 border-green-600 p-4 my-6 rounded-r-lg">
                  <p className="text-gray-800 text-lg font-semibold italic">
                    {option.highlight}
                  </p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {option.actions.map((action, idx) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all group"
                  >
                    <ActionIcon className="w-5 h-5" />
                    <span>{action.label}</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* Sección final */}
        <section className="mt-16 lg:mt-24 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 lg:p-12 border border-green-100">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Jubilalia no es solo vivienda
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Es comunidad, acompañamiento y una nueva forma de vivir la jubilación: 
              más humana, más justa y más compartida.
            </p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all group"
            >
              <span>¿Empezamos?</span>
              <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ColivingExplanation;
