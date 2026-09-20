import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Procesando autenticación...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Verificando autenticación...');

        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        if (errorParam) {
          setError(errorDescription || errorParam);
          setTimeout(() => navigate('/login'), 2500);
          return;
        }

        const { data: existing, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(sessionError.message);
          setTimeout(() => navigate('/login'), 2500);
          return;
        }

        if (!existing.session) {
          const code = searchParams.get('code');
          if (code) {
            setStatus('Confirmando sesión...');
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              setError(exchangeError.message);
              setTimeout(() => navigate('/login'), 2500);
              return;
            }
          }
        }

        const { data } = await supabase.auth.getSession();

        if (data.session) {
          setStatus('Acceso correcto. Entrando...');
          const home = Capacitor.isNativePlatform() ? '/' : '/dashboard';
          navigate(home, { replace: true });
          return;
        }

        setError('No se encontró sesión de autenticación');
        setTimeout(() => navigate('/login'), 2500);
      } catch (err: any) {
        setError(err.message || 'Error inesperado');
        setTimeout(() => navigate('/login'), 2500);
      }
    };

    const timer = setTimeout(handleAuthCallback, 200);
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3eee4] px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
        <p className="text-stone-700">{error || status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
