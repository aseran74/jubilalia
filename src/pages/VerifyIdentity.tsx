import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Camera, IdCard, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getIdentityStatus, setIdentityStatus } from '../lib/identityVerification';
import MobileTabBar from '../components/mobile/MobileTabBar';

type DocKey = 'front' | 'back' | 'selfie';

const slots: { key: DocKey; title: string; hint: string; icon: typeof IdCard }[] = [
  { key: 'front', title: 'DNI o NIE, anverso', hint: 'La cara con tu foto', icon: IdCard },
  { key: 'back', title: 'DNI o NIE, reverso', hint: 'La cara posterior', icon: IdCard },
  { key: 'selfie', title: 'Selfie de verificación', hint: 'Rostro bien iluminado', icon: UserRound },
];

const VerifyIdentity: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentStatus = useMemo(() => getIdentityStatus(user?.id), [user?.id]);
  const [files, setFiles] = useState<Record<DocKey, File | null>>({
    front: null,
    back: null,
    selfie: null,
  });
  const [previews, setPreviews] = useState<Record<DocKey, string | null>>({
    front: null,
    back: null,
    selfie: null,
  });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(currentStatus === 'pending' || currentStatus === 'verified');

  const onPick = (key: DocKey, file?: File) => {
    if (!file) return;
    setError('');
    setFiles((prev) => ({ ...prev, [key]: file }));
    setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!files.front || !files.back || !files.selfie) {
      setError('Añade las tres fotos para continuar.');
      return;
    }
    setIdentityStatus(user.id, 'pending');
    setSubmitted(true);
  };

  return (
    <div className="app-shell min-h-screen">
      <header className="app-header">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-800 shadow-sm ring-1 ring-stone-200"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Seguridad</p>
            <h1 className="text-xl font-bold text-stone-900">Valida tu identidad</h1>
          </div>
        </div>
      </header>

      <main className="app-page">
        {currentStatus === 'verified' ? (
          <section className="rounded-[1.6rem] bg-emerald-800 px-5 py-6 text-white">
            <BadgeCheck className="h-10 w-10" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-bold">Identidad verificada</h2>
            <p className="mt-2 text-emerald-50">Ya puedes publicar y conectar con más confianza.</p>
          </section>
        ) : submitted || currentStatus === 'pending' ? (
          <section className="rounded-[1.6rem] bg-white px-5 py-6 shadow-sm ring-1 ring-stone-200">
            <ShieldCheck className="h-10 w-10 text-emerald-700" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-bold text-stone-900">Documentación enviada</h2>
            <p className="mt-2 text-base leading-relaxed text-stone-600">
              Revisaremos tu DNI y tu selfie. Te avisaremos cuando la cuenta quede verificada.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-5 min-h-12 w-full rounded-full bg-emerald-800 font-semibold text-white"
            >
              Volver al inicio
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="rounded-[1.6rem] bg-[#2f4a3a] px-5 py-5 text-[#f4efe4]">
              <ShieldCheck className="h-8 w-8" aria-hidden="true" />
              <p className="mt-3 text-lg font-bold leading-snug">
                Confirmamos que eres tú para cuidar la comunidad.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#f4efe4]/80">
                Solo el equipo de Jubilalia verá estos documentos. No se publican en tu perfil.
              </p>
            </section>

            {slots.map((slot) => {
              const Icon = slot.icon;
              return (
                <label
                  key={slot.key}
                  className="block cursor-pointer rounded-[1.4rem] bg-white p-4 shadow-sm ring-1 ring-stone-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-emerald-800">
                      {previews[slot.key] ? <Camera className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </span>
                    <span>
                      <span className="block font-bold text-stone-900">{slot.title}</span>
                      <span className="block text-sm text-stone-500">{slot.hint}</span>
                    </span>
                  </div>
                  {previews[slot.key] && (
                    <img
                      src={previews[slot.key]!}
                      alt=""
                      className="mt-3 h-36 w-full rounded-2xl object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture={slot.key === 'selfie' ? 'user' : 'environment'}
                    className="sr-only"
                    onChange={(event) => onPick(slot.key, event.target.files?.[0])}
                  />
                </label>
              );
            })}

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="min-h-14 w-full rounded-full bg-emerald-800 text-lg font-bold text-white shadow-lg active:scale-[0.99]"
            >
              Enviar para revisión
            </button>
          </form>
        )}
      </main>

      <MobileTabBar />
    </div>
  );
};

export default VerifyIdentity;
