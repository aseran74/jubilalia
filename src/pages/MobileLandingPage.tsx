import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  MapIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon as MessageIcon, 
  HomeIcon, 
  UserIcon, 
  BellIcon 
} from '@heroicons/react/24/solid'; // Cambiamos a SOLID para mejor visibilidad
import { useAuth } from '../hooks/useAuth';

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}

// Componente pequeño para los items de navegación
const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false }) => (
  <button className={`flex flex-col items-center gap-1 ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
    <Icon className="w-6 h-6" />
    <span className="text-[10px] font-bold tracking-wide">{label}</span>
  </button>
);

const MobileLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const mainCards = [
    {
      id: 'search-activities',
      title: 'Explorar',
      subtitle: 'Busca actividades',
      icon: SearchIcon,
      color: 'bg-emerald-500',
      action: () => navigate('/dashboard/activities')
    },
    {
      id: 'create-activity',
      title: 'Crear',
      subtitle: 'Publica algo nuevo',
      icon: PlusIcon,
      color: 'bg-indigo-500',
      action: () => navigate('/dashboard/activities/create')
    },
    {
      id: 'map-search',
      title: 'Cerca de mí',
      subtitle: 'Ver en el mapa',
      icon: MapIcon,
      color: 'bg-amber-500',
      action: () => navigate('/dashboard/activities/map')
    },
    {
      id: 'my-activities',
      title: 'Mi Agenda',
      subtitle: 'Mis eventos',
      icon: CalendarIcon,
      color: 'bg-rose-500',
      action: () => navigate('/dashboard/activities')
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased text-slate-900">
      
      {/* Header con Bienvenida Personalizada */}
      <header className="bg-white px-5 py-4 border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-emerald-900">Jubilalia</h1>
          </div>
          <button className="relative p-2 text-slate-600 bg-slate-100 rounded-full">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="px-5 py-6">
        {/* Sección de Bienvenida: Genera conexión emocional */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 italic">
            Hola, {user?.name || profile?.full_name || 'amigo'} 👋
          </h2>
          <p className="text-slate-500 mt-1 text-lg">¿Qué te apetece disfrutar hoy?</p>
        </section>

        {/* Grid de Actividades: Tarjetas más grandes y legibles */}
        <section className="mb-10">
          <div className="grid grid-cols-2 gap-4">
            {mainCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={card.action}
                  className="group relative flex flex-col items-start p-5 bg-white rounded-3xl shadow-sm border border-slate-100 transition-all active:scale-95"
                >
                  <div className={`${card.color} p-3 rounded-2xl mb-4 text-white shadow-md`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{card.title}</h3>
                  <p className="text-slate-500 text-xs mt-1">{card.subtitle}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Nueva Sección: Comunidad (Social Proof) */}
        <section className="mb-8">
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
            <h3 className="text-emerald-900 font-bold mb-2">Comunidad Jubilalia</h3>
            <p className="text-emerald-700 text-sm mb-4">Hay 12 actividades nuevas en tu zona esta semana.</p>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-700">+80</div>
            </div>
          </div>
        </section>
      </main>

      {/* Barra de Navegación Inferior Estilo "Dock" */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 pb-8 pt-3 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <NavItem icon={HomeIcon} label="Inicio" active />
          <NavItem icon={SearchIcon} label="Buscar" />
          {/* Botón Central Destacado */}
          <button 
            onClick={() => navigate('/dashboard/activities/create')}
            className="flex items-center justify-center -mt-12 w-14 h-14 bg-emerald-600 rounded-full shadow-lg shadow-emerald-200 text-white transition-transform active:scale-90 hover:bg-emerald-700"
          >
            <PlusIcon className="w-8 h-8" />
          </button>
          <NavItem icon={MessageIcon} label="Chat" />
          <NavItem icon={UserIcon} label="Perfil" />
        </div>
      </nav>
    </div>
  );
};

export default MobileLandingPage;
