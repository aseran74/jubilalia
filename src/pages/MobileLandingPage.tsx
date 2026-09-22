import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Map as MapIcon,
  MessageCircle,
  Plus,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import MobileTabBar from '../components/mobile/MobileTabBar';
import MobileActivityCard, { MobileActivity } from '../components/mobile/MobileActivityCard';

interface NearbyGroup {
  id: string;
  name: string;
  description?: string;
  city?: string;
  category?: string;
  image_url?: string;
  current_members?: number;
}

const MENU_TILES = [
  {
    title: 'Crear Actividad',
    subtitle: 'Publica tu actividad',
    icon: Plus,
    color: 'bg-[#3B82F6]',
    path: '/dashboard/activities/create',
    needsAuth: true,
  },
  {
    title: 'Buscar Actividades',
    subtitle: 'Encuentra tu actividad',
    icon: Search,
    color: 'bg-[#22C55E]',
    path: '/dashboard/activities',
    needsAuth: true,
  },
  {
    title: 'Búsqueda por Mapa',
    subtitle: 'Explora en el mapa',
    icon: MapIcon,
    color: 'bg-[#A855F7]',
    path: '/dashboard/activities',
    needsAuth: true,
  },
  {
    title: 'Mis Actividades',
    subtitle: 'Gestiona tus actividades',
    icon: Briefcase,
    color: 'bg-[#F97316]',
    path: '/dashboard/activities?mine',
    needsAuth: true,
  },
  {
    title: 'Miembros',
    subtitle: 'Gestiona miembros',
    icon: Users,
    color: 'bg-[#14B8A6]',
    path: '/dashboard/users',
    needsAuth: true,
  },
  {
    title: 'Posts',
    subtitle: 'Explora en el mapa',
    icon: FileText,
    color: 'bg-[#6366F1]',
    path: '/dashboard/posts',
    needsAuth: true,
  },
  {
    title: 'Mensajería',
    subtitle: 'Chatea con otros',
    icon: MessageCircle,
    color: 'bg-[#EC4899]',
    path: '/dashboard/messages',
    needsAuth: true,
  },
] as const;

const MobileLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activities, setActivities] = useState<MobileActivity[]>([]);
  const [groups, setGroups] = useState<NearbyGroup[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.user_metadata?.name?.split(' ')[0] ||
    '';

  const city = profile?.city || '';

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        setLoadingNearby(true);

        let activityQuery = supabase
          .from('activities')
          .select('id, title, description, activity_type, location, city, date, time, price')
          .eq('is_active', true)
          .order('date', { ascending: true })
          .limit(6);

        if (city) {
          activityQuery = activityQuery.ilike('city', `%${city}%`);
        }

        const { data: activityData, error: activityError } = await activityQuery;
        if (activityError) throw activityError;

        let nearbyActivities = activityData || [];
        if (nearbyActivities.length === 0) {
          const { data: fallbackActivities } = await supabase
            .from('activities')
            .select('id, title, description, activity_type, location, city, date, time, price')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(6);
          nearbyActivities = fallbackActivities || [];
        }

        const activityIds = nearbyActivities.map((activity) => activity.id);
        let imagesByActivity: Record<string, string[]> = {};

        if (activityIds.length > 0) {
          const { data: imagesData } = await supabase
            .from('activity_images')
            .select('activity_id, image_url')
            .in('activity_id', activityIds)
            .order('is_primary', { ascending: false });

          if (imagesData) {
            imagesByActivity = imagesData.reduce((acc: Record<string, string[]>, img) => {
              if (!acc[img.activity_id]) acc[img.activity_id] = [];
              acc[img.activity_id].push(img.image_url);
              return acc;
            }, {});
          }
        }

        setActivities(
          nearbyActivities.map((activity) => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            city: activity.city,
            location: activity.location,
            date: activity.date,
            time: activity.time,
            price: parseFloat(activity.price || 0),
            images: imagesByActivity[activity.id] || [],
            category: activity.activity_type,
          }))
        );

        let groupQuery = supabase
          .from('groups')
          .select('id, name, description, image_url, city, category, current_members')
          .order('created_at', { ascending: false })
          .limit(6);

        if (city) {
          groupQuery = groupQuery.ilike('city', `%${city}%`);
        }

        const { data: groupData } = await groupQuery;
        let nearbyGroups = (groupData as NearbyGroup[]) || [];

        if (nearbyGroups.length === 0) {
          const { data: fallbackGroups } = await supabase
            .from('groups')
            .select('id, name, description, image_url, city, category, current_members')
            .order('created_at', { ascending: false })
            .limit(6);
          nearbyGroups = (fallbackGroups as NearbyGroup[]) || [];
        }

        setGroups(nearbyGroups);
      } catch (error) {
        console.error('Error cargando contenido cercano:', error);
      } finally {
        setLoadingNearby(false);
      }
    };

    fetchNearby();
  }, [city]);

  const goTo = (path: string, needsAuth: boolean) => {
    if (needsAuth && !user) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const nearbyLabel = useMemo(
    () => (city ? `Cerca de ${city}` : 'Cerca de ti'),
    [city]
  );

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
            {firstName ? `Hola, ${firstName}` : 'Actividades'}
          </h1>
          <p className="mt-1 text-sm text-stone-500">{nearbyLabel}</p>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3">
            {MENU_TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.title}
                  type="button"
                  onClick={() => goTo(tile.path, tile.needsAuth)}
                  className={`${tile.color} flex min-h-[9.5rem] flex-col items-center justify-center rounded-[1.6rem] px-3 py-5 text-white shadow-md transition-transform active:scale-[0.97]`}
                >
                  <Icon className="h-9 w-9" strokeWidth={2.2} aria-hidden="true" />
                  <span className="mt-3 text-center text-[15px] font-extrabold leading-tight">
                    {tile.title}
                  </span>
                  <span className="mt-1 text-center text-xs font-medium text-white/85">
                    {tile.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Actividades cercanas</h2>
              <p className="text-sm text-stone-500">{nearbyLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => goTo('/dashboard/activities', true)}
              className="min-h-11 text-sm font-bold text-emerald-700"
            >
              Ver más
            </button>
          </div>

          {loadingNearby ? (
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="h-52 animate-pulse rounded-[1.4rem] bg-stone-100" />
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <MobileActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] bg-stone-50 px-5 py-8 text-center">
              <p className="font-bold text-stone-900">Aún no hay actividades cerca</p>
              <p className="mt-1 text-sm text-stone-500">Cuando se publiquen, aparecerán aquí.</p>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Grupos cercanos</h2>
              <p className="text-sm text-stone-500">{nearbyLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => goTo('/dashboard/groups?explore', true)}
              className="min-h-11 text-sm font-bold text-emerald-700"
            >
              Ver más
            </button>
          </div>

          {loadingNearby ? (
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="h-40 animate-pulse rounded-[1.4rem] bg-stone-100" />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => goTo(`/dashboard/groups/${group.id}`, true)}
                  className="block w-full overflow-hidden rounded-[1.4rem] bg-white text-left shadow-[0_10px_28px_rgba(40,32,20,0.08)] ring-1 ring-stone-200/80 transition-transform active:scale-[0.98]"
                >
                  <div className="relative h-36 bg-stone-200">
                    {group.image_url ? (
                      <img src={group.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-700">
                        <Users className="h-10 w-10 text-white/85" aria-hidden="true" />
                      </div>
                    )}
                    {group.category && (
                      <span className="absolute right-3 top-3 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                        {group.category}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 px-4 py-3.5">
                    <h3 className="line-clamp-1 text-lg font-bold text-stone-900">{group.name}</h3>
                    {group.description && (
                      <p className="line-clamp-2 text-sm text-stone-500">{group.description}</p>
                    )}
                    <p className="text-sm text-stone-500">
                      {group.city || 'España'}
                      {typeof group.current_members === 'number' ? ` · ${group.current_members} miembros` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] bg-stone-50 px-5 py-8 text-center">
              <p className="font-bold text-stone-900">Aún no hay grupos cerca</p>
              <p className="mt-1 text-sm text-stone-500">Cuando se creen, aparecerán aquí.</p>
            </div>
          )}
        </section>
      </main>

      <MobileTabBar />
    </div>
  );
};

export default MobileLandingPage;
