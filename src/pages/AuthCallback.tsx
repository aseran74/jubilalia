import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Procesando autenticación...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        console.log('Current URL:', window.location.href);
        
        setStatus('Verificando parámetros de autenticación...');
        
        // Verificar si hay error en los parámetros de la URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('Auth error from URL:', errorParam, errorDescription);
          setError(`Error de autenticación: ${errorDescription || errorParam}`);
          setStatus('Error en la autenticación');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Verificar si hay tokens en el hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log('Access token found in URL hash');
          setStatus('Tokens detectados, procesando...');
        }

        setStatus('Obteniendo sesión...');
        
        // Forzar la obtención de la sesión
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(`Error obteniendo sesión: ${sessionError.message}`);
          setStatus('Error en la sesión');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data.session) {
          console.log('Session found:', data.session);
          console.log('User authenticated:', data.session.user.email);
          setStatus('¡Autenticación exitosa! Redirigiendo...');
          
          // Limpiar la URL antes de navegar
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Navegar a la página principal
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          console.log('No session found, redirecting to login');
          setError('No se encontró sesión de autenticación');
          setStatus('Error: No hay sesión');
          setTimeout(() => navigate('/login'), 2000);
        }
        
      } catch (err: any) {
        console.error('Unexpected error in auth callback:', err);
        setError(`Error inesperado: ${err.message}`);
        setStatus('Error inesperado');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    // Dar tiempo para que Supabase procese la URL
    const timer = setTimeout(handleAuthCallback, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-red-600">{error}</p>
          <p className="text-gray-500 mt-2">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
        <p className="text-sm text-gray-500 mt-2">Por favor espera...</p>
        <div className="mt-4 text-xs text-gray-400">
          <p>URL actual: {window.location.href}</p>
          <p>Query params: {searchParams.toString()}</p>
          <p>Hash: {window.location.hash.substring(0, 100)}...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;