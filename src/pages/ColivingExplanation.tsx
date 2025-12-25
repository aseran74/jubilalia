import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  ArrowRightIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/solid'; // Iconos sólidos para mejor legibilidad

const ColivingExplanation: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'habitaciones' | 'alquiler' | 'venta'>('habitaciones');

  // Datos estructurados para renderizado dinámico
  const content = {
    habitaciones: {
      id: 'habitaciones',
      title: 'Compartir Habitación',
      subtitle: 'Tu casa, tu refugio... ahora con compañía.',
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-800',
      icon: HomeIcon,
      intro: 'Ideal si tienes una vivienda propia y te sobra una habitación y quieres combatir la soledad y generar ingresos extra sin mudarte. Tenemos un buscador que filtra para que encuentres el compañero/a ideal.',
      features: [
        { icon: '💶', text: 'Ingresos extra mensuales', useEmoji: true },
        { icon: '🤝', text: 'Compañía y seguridad diaria', useEmoji: true },
        { icon: '🏠', text: 'Tú pones las normas de tu casa', useEmoji: true },
        { icon: CalendarDaysIcon, text: 'Flex Rent: Alquiler de temporada 11 meses para probar la convivencia si quieres alquilar tu inmueble y vivir con un compañero/a', useEmoji: false },
        { icon: ClockIcon, text: 'Flex Week: Prueba unas semanas de convivencia antes de tomar el paso definitivo. La convivencia es muy importante.', useEmoji: false }
      ],
      actions: [
        { label: 'Buscar Habitaciones', path: '/dashboard/rooms', icon: MagnifyingGlassIcon, primary: true },
        { label: 'Publicar Habitación', path: '/dashboard/rooms/create', icon: PlusIcon, primary: false },
        { label: 'Publicar Post', path: '/dashboard/rooms/posts', icon: DocumentTextIcon, primary: false }
      ]
    },
    alquiler: {
      id: 'alquiler',
      title: 'Alquiler Colaborativo',
      subtitle: 'Vivir mejor gastando la mitad.',
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      icon: BuildingOfficeIcon,
      intro: 'Únete a otras personas para alquilar chalets o pisos grandes que, por separado, serían imposibles de pagar. Tenemos desde gente que se quieren alquilar un edificio entero en plena Ciudad de Vigo, y buscan socios en el proyecto, a grupos de 10 personas que quieren alquilarse un chalet enorme en Filipinas, Tailandia o Indonesia, a proyectos de coliving con alojamiento independiente en Málaga o Cádiz cerca de campos de Golf, a determinado precio mensual. También tenemos residencias normales para personas no dependientes.',
      features: [
        { icon: '🏰', text: 'Acceso a viviendas de lujo', useEmoji: true },
        { icon: '📉', text: 'División de gastos y facturas', useEmoji: true },
        { icon: '🧩', text: 'Comunidad activa y dinámica', useEmoji: true }
      ],
      actions: [
        { label: 'Buscar Alquileres', path: '/dashboard/properties/rental', icon: MagnifyingGlassIcon, primary: true },
        { label: 'Publicar Alquiler', path: '/dashboard/properties/rental/create', icon: PlusIcon, primary: false },
        { label: 'Publicar Post', path: '/dashboard/properties/rental/posts', icon: DocumentTextIcon, primary: false }
      ]
    },
    venta: {
      id: 'venta',
      title: 'Compra e Inversión',
      subtitle: 'Construye tu futuro (literalmente).',
      color: 'bg-violet-600',
      lightColor: 'bg-violet-50',
      textColor: 'text-violet-800',
      icon: CurrencyDollarIcon,
      intro: 'La opción para visionarios: comprar terrenos o edificios entre varios para crear un Cohousing senior en propiedad. Tenemos desde gente que está buscando terrenos y socios para hacer un coliving en Málaga, a grupos que deciden comprarse una Mansión del siglo XVIII en plena Italia, o Chalets en el paraíso de Indonesia o Tailandia, o pequeños grupos de 3 parejas (6 personas) que compran y hacen reformas buenas de inmuebles en la Costa de Cádiz donde vivir todo el año.',
      features: [
        { icon: '🏗️', text: 'Diseño a medida para seniors', useEmoji: true },
        { icon: '🔐', text: 'Propiedad y patrimonio real', useEmoji: true },
        { icon: '🌟', text: 'Comunidad estable de por vida', useEmoji: true }
      ],
      actions: [
        { label: 'Buscar Venta', path: '/dashboard/properties/sale', icon: MagnifyingGlassIcon, primary: true },
        { label: 'Publicar Venta', path: '/dashboard/properties/sale/create', icon: PlusIcon, primary: false },
        { label: 'Publicar Post', path: '/dashboard/properties/sale/posts', icon: DocumentTextIcon, primary: false }
      ]
    }
  };

  const activeContent = content[activeTab];

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-slate-900 pb-20 selection:bg-emerald-100">
      
      {/* 1. Header "Glassmorphism" sutil */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
         <img 
           src="/images/jubilogo.svg" 
           alt="Jubilalia" 
           className="h-8 w-auto cursor-pointer" 
           onClick={() => navigate('/')} 
         />
         <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-stone-100 transition-colors">
            <UserGroupIcon className="w-6 h-6 text-stone-500" />
         </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-8">
        
        {/* 2. Hero Emocional */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-800 mb-3 leading-tight">
            Diseña tu forma de vivir
          </h1>
          <p className="text-stone-500 text-lg">
            No hay una sola forma de jubilarse. Elige la que mejor se adapte a tu momento actual.
          </p>
        </div>

        {/* 3. Selector de Pestañas (Bento Navigation) */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-white border border-stone-200 rounded-2xl shadow-sm mb-8">
          {(Object.keys(content) as Array<keyof typeof content>).map((key) => {
            const item = content[key];
            const isActive = activeTab === key;
            const Icon = item.icon;
            
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? `${item.lightColor} ${item.textColor} font-bold shadow-sm ring-1 ring-inset ring-black/5` 
                    : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
                <span className="text-[10px] md:text-xs uppercase tracking-wide">{item.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Tarjeta de Contenido Dinámico (Morphing Card) */}
        <div className="relative overflow-hidden bg-white rounded-[2rem] border border-stone-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            
            {/* Banner superior de color */}
            <div className={`h-2 w-full ${activeContent.color}`} />
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                   <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${activeContent.lightColor} ${activeContent.textColor} uppercase tracking-wider`}>
                      Opción Seleccionada
                   </span>
                   <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">
                     {activeContent.title}
                   </h2>
                   <p className="text-lg text-stone-500 font-medium leading-relaxed">
                     {activeContent.subtitle}
                   </p>
                </div>
              </div>

              {/* Descripción Principal */}
              <p className="text-stone-600 mb-8 leading-relaxed text-lg">
                {activeContent.intro}
              </p>

              {/* Bento Grid de Beneficios */}
              <div className="grid gap-4 mb-8">
                {activeContent.features.map((feature, idx) => {
                  if (feature.useEmoji && typeof feature.icon === 'string') {
                    return (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                        <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                        <span className="font-semibold text-stone-700">{feature.text}</span>
                      </div>
                    );
                  } else if (!feature.useEmoji && typeof feature.icon !== 'string') {
                    const IconComponent = feature.icon;
                    return (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                        <div className={`p-2 rounded-xl ${activeContent.lightColor} flex-shrink-0`}>
                          <IconComponent className={`w-6 h-6 ${activeContent.textColor}`} />
                        </div>
                        <span className="font-semibold text-stone-700">{feature.text}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Botones de Acción (Hierarchical) */}
              <div className="space-y-3">
                {activeContent.actions.map((action, idx) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate(action.path)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] ${
                        action.primary 
                          ? `${activeContent.color} text-white shadow-lg shadow-${activeContent.color}/20 hover:brightness-110` 
                          : 'bg-white border-2 border-stone-100 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ActionIcon className={`w-5 h-5 ${action.primary ? 'text-white' : 'text-stone-400'}`} />
                        <span className="font-bold">{action.label}</span>
                      </div>
                      <ArrowRightIcon className={`w-5 h-5 ${action.primary ? 'opacity-100' : 'opacity-30'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
        </div>

        {/* 5. Footer "Trust" */}
        <div className="mt-12 text-center pb-8">
          <p className="text-stone-400 text-sm mb-4">Más de 500 personas mayores confían en nosotros</p>
          <div className="flex justify-center -space-x-3">
             {[1,2,3,4].map((i) => (
               <img key={i} src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
             ))}
             <button className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 border-2 border-white">
               +99
             </button>
          </div>
        </div>

      </main>
      
      {/* Floating Action Button (Asistente IA - Tendencia 2026) */}
      <button className="fixed bottom-6 right-6 bg-stone-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50">
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

    </div>
  );
};

export default ColivingExplanation;
