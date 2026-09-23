import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Heart,
  Home,
  KeyRound,
  MessageCircle,
  Plus,
  Store,
  UserRound,
  Users,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import MobileTabBar from '../components/mobile/MobileTabBar';

interface MenuTile {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  path: string;
  needsAuth: boolean;
}

const PLAN_TILES: MenuTile[] = [
  {
    title: 'Crear actividad',
    subtitle: 'Publica un plan',
    icon: Plus,
    color: 'bg-[#3B82F6]',
    path: '/dashboard/activities/create',
    needsAuth: true,
  },
  {
    title: 'Actividad',
    subtitle: 'Planes y salidas',
    icon: Calendar,
    color: 'bg-[#22C55E]',
    path: '/dashboard/activities',
    needsAuth: true,
  },
  {
    title: 'Grupos',
    subtitle: 'Comunidades',
    icon: Users,
    color: 'bg-[#A855F7]',
    path: '/dashboard/groups?explore',
    needsAuth: true,
  },
  {
    title: 'Miembros',
    subtitle: 'Conoce gente',
    icon: UserRound,
    color: 'bg-[#14B8A6]',
    path: '/dashboard/users',
    needsAuth: true,
  },
];

const MY_THINGS_TILES: MenuTile[] = [
  {
    title: 'Mis mensajes',
    icon: MessageCircle,
    color: 'bg-[#EC4899]',
    path: '/dashboard/messages',
    needsAuth: true,
  },
  {
    title: 'Mis amigos',
    icon: Heart,
    color: 'bg-[#F97316]',
    path: '/dashboard/friends',
    needsAuth: true,
  },
  {
    title: 'Mis grupos',
    icon: Users,
    color: 'bg-[#8B5CF6]',
    path: '/dashboard/groups',
    needsAuth: true,
  },
  {
    title: 'Mis notificaciones',
    icon: Bell,
    color: 'bg-amber-500',
    path: '/dashboard/notifications',
    needsAuth: true,
  },
];

const COLIVING_TILES: MenuTile[] = [
  {
    title: 'Habitaciones',
    icon: KeyRound,
    color: 'bg-emerald-700',
    path: '/dashboard/rooms',
    needsAuth: true,
  },
  {
    title: 'Alquiler',
    icon: Home,
    color: 'bg-sky-600',
    path: '/dashboard/properties/rental',
    needsAuth: true,
  },
  {
    title: 'Venta',
    icon: Store,
    color: 'bg-violet-700',
    path: '/dashboard/properties/sale',
    needsAuth: true,
  },
];

const TileGrid: React.FC<{
  tiles: MenuTile[];
  compact?: boolean;
  onOpen: (path: string, needsAuth: boolean) => void;
}> = ({ tiles, compact = false, onOpen }) => (
  <div className="grid grid-cols-2 gap-3">
    {tiles.map((tile) => {
      const Icon = tile.icon;
      return (
        <button
          key={tile.title}
          type="button"
          onClick={() => onOpen(tile.path, tile.needsAuth)}
          className={`${tile.color} flex ${compact ? 'min-h-[6.75rem]' : 'min-h-[8.5rem]'} flex-col items-center justify-center rounded-[1.6rem] px-3 py-4 text-white shadow-md transition-transform active:scale-[0.97]`}
        >
          <Icon className={compact ? 'h-7 w-7' : 'h-9 w-9'} strokeWidth={2.2} aria-hidden="true" />
          <span className="mt-2 text-center text-[15px] font-extrabold leading-tight">{tile.title}</span>
          {tile.subtitle && (
            <span className="mt-1 text-center text-xs font-medium text-white/85">{tile.subtitle}</span>
          )}
        </button>
      );
    })}
  </div>
);

const MobileLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.user_metadata?.name?.split(' ')[0] ||
    '';

  const city = profile?.city || '';

  const goTo = (path: string, needsAuth: boolean) => {
    if (needsAuth && !user) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

  return (
    <div className="app-shell min-h-screen bg-white">
      <header className="app-header bg-white/95">
        <div className="flex items-center justify-between gap-3">
          <img src="/images/jubilogo.svg" alt="Jubilalia" className="h-9 w-auto" />
          <button
            type="button"
            onClick={() => navigate(user ? '/dashboard/profile' : '/login')}
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-100 ring-2 ring-white"
            aria-label={user ? 'Abrir perfil' : 'Iniciar sesión'}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-6 w-6 text-stone-500" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <main className="app-page bg-white">
        <section className="mb-6">
          <h1 className="text-[1.75rem] font-extrabold tracking-tight text-stone-900">
            {firstName ? `Hola, ${firstName}` : 'Jubilalia'}
          </h1>
          <p className="mt-1 text-sm text-stone-500">{city ? `Cerca de ${city}` : 'Elige qué quieres hacer'}</p>
        </section>

        <section className="mb-8">
          <TileGrid tiles={PLAN_TILES} onOpen={goTo} />
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-extrabold text-stone-900">Mis cosas</h2>
          <TileGrid tiles={MY_THINGS_TILES} compact onOpen={goTo} />
        </section>

        <section>
          <h2 className="mb-3 text-xl font-extrabold text-stone-900">Coliving</h2>
          <TileGrid tiles={COLIVING_TILES} compact onOpen={goTo} />
        </section>
      </main>

      <MobileTabBar />
    </div>
  );
};

export default MobileLandingPage;
