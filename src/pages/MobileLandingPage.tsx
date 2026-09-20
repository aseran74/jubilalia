import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronRight,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getIdentityStatus } from '../lib/identityVerification';
import MobileTabBar from '../components/mobile/MobileTabBar';
import MobileActivityCard, { MobileActivity } from '../components/mobile/MobileActivityCard';

const MobileLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activities, setActivities] = useState<MobileActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const identityStatus = useMemo(() => getIdentityStatus(user?.id), [user?.id]);

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.user_metadata?.name?.split(' ')[0] ||
    '';

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;

        const ids = (data || []).map((activity) => activity.id);
        let imagesByActivity: Record<string, string[]> = {};

        if (ids.length > 0) {
          const { data: imagesData } = await supabase
            .from('activity_images')
            .select('activity_id, image_url')
            .in('activity_id', ids)
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
          (data || []).map((activity) => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            city: activity.city,
            location: activity.location,
            date: activity.date,
            time: activity.time,
            price: parseFloat(activity.price || 0),
            images: imagesByActivity[activity.id] || activity.images || [],
            category: activity.activity_type || activity.category,
          }))
        );
      } catch (error) {
        console.error('Error cargando actividades:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  const goToIdentity = () => {
    navigate(user ? '/verificar-identidad' : '/login');
  };

  return (
    <div className="app-shell min-h-screen">
      <header className="app-header">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/images/jubilogo.svg"
              alt="Jubilalia"
              className="h-9 w-auto"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate(user ? '/dashboard/profile' : '/login')}
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white"
            aria-label={user ? 'Abrir perfil' : 'Iniciar sesión'}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-6 w-6 text-emerald-800" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <main className="app-page">
        <section className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Comunidad senior
          </p>
          <h1 className="mt-1 text-[1.85rem] font-bold leading-tight text-stone-900">
            {firstName ? `Hola, ${firstName}` : 'Vive acompañado'}
          </h1>
          <p className="mt-2 text-base leading-relaxed text-stone-600">
            Actividades, amistades y vivienda compartida, con calma y cerca de ti.
          </p>
        </section>

        <section className="mb-7">
          {identityStatus === 'verified' ? (
            <div className="flex items-center gap-3 rounded-[1.4rem] bg-emerald-50 px-4 py-4 ring-1 ring-emerald-100">
              <BadgeCheck className="h-7 w-7 text-emerald-700" aria-hidden="true" />
              <div>
                <p className="font-bold text-emerald-950">Identidad verificada</p>
                <p className="text-sm text-emerald-800">Tu perfil genera más confianza.</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={goToIdentity}
              className="w-full rounded-[1.6rem] bg-[#2f4a3a] px-5 py-5 text-left text-[#f4efe4] shadow-[0_12px_30px_rgba(47,74,58,0.25)] transition-transform active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </span>
                <ChevronRight className="mt-1 h-6 w-6 shrink-0 opacity-80" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">Valida tu identidad</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#f4efe4]/80">
                {identityStatus === 'pending'
                  ? 'Estamos revisando tu documentación. Puedes consultar el estado aquí.'
                  : 'Un paso breve para publicar, unirte a planes y compartir vivienda con más seguridad.'}
              </p>
              <span className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#f4efe4] px-4 text-sm font-bold text-[#2f4a3a]">
                {identityStatus === 'pending' ? 'Ver estado' : 'Empezar ahora'}
              </span>
            </button>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Actividades</h2>
              <p className="text-sm text-stone-500">Planes cerca de ti</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="min-h-11 text-sm font-bold text-emerald-800"
            >
              Ver más
            </button>
          </div>

          {loadingActivities ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-56 animate-pulse rounded-[1.4rem] bg-white/70" />
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <MobileActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] bg-white px-5 py-8 text-center shadow-sm ring-1 ring-stone-200">
              <p className="font-bold text-stone-900">Aún no hay actividades</p>
              <p className="mt-1 text-sm text-stone-500">Cuando se publiquen, aparecerán aquí.</p>
              <button
                type="button"
                onClick={() => navigate(user ? '/activities/create' : '/login')}
                className="mt-4 min-h-12 rounded-full bg-emerald-800 px-5 font-semibold text-white"
              >
                Publicar una actividad
              </button>
            </div>
          )}
        </section>
      </main>

      <MobileTabBar />
    </div>
  );
};

export default MobileLandingPage;
