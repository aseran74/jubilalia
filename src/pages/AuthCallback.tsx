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
        setStatus('Verificando parámetros de URL...');
        
        // Verificar si hay parámetros de error en la URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('Error en URL:', errorParam, errorDescription);
          setError(`Error de autenticación: ${errorParam} - ${errorDescription}`);
          setStatus('Error en la autenticación');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setStatus('Obteniendo sesión...');
        
        // Obtener la sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(`Error obteniendo sesión: ${sessionError.message}`);
          setStatus('Error en la sesión');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (session) {
          console.log('✅ Usuario autenticado correctamente:', session.user.email);
          setStatus('¡Autenticación exitosa! Redirigiendo...');
          
          // Pequeña pausa para mostrar el mensaje de éxito
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          console.log('❌ No hay sesión activa');
          setError('No se pudo establecer la sesión');
          setStatus('Error: No hay sesión activa');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        setError(`Error inesperado: ${error.message}`);
        setStatus('Error inesperado');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error de Autenticación</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirigiendo al login...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{status}</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>URL actual: {window.location.href}</p>
              <p>Parámetros: {searchParams.toString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
