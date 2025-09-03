import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const RedirectFix: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verificando redirección...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setStatus('Detectando tokens en la URL...');
        
        // Verificar si hay tokens en el hash
        const hash = window.location.hash;
        console.log('🔍 Hash detectado:', hash);
        
        if (hash && hash.includes('access_token')) {
          setStatus('Procesando tokens de Google OAuth...');
          
          // Extraer los parámetros del hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const expiresAt = hashParams.get('expires_at');
          
          console.log('✅ Tokens extraídos:', {
            accessToken: accessToken ? 'Presente' : 'Faltante',
            refreshToken: refreshToken ? 'Presente' : 'Faltante',
            expiresAt: expiresAt
          });
          
          setStatus('Estableciendo sesión...');
          
          // Establecer la sesión manualmente
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken || '',
            refresh_token: refreshToken || ''
          });
          
          if (sessionError) {
            console.error('Error estableciendo sesión:', sessionError);
            setError(`Error: ${sessionError.message}`);
            return;
          }
          
          if (data.session) {
            console.log('✅ Sesión establecida correctamente:', data.session.user.email);
            setStatus('¡Autenticación exitosa! Redirigiendo...');
            
            // Limpiar el hash de la URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } else {
            setError('No se pudo establecer la sesión');
          }
        } else {
          setError('No se encontraron tokens en la URL');
        }
      } catch (error: any) {
        console.error('Error en redirect fix:', error);
        setError(`Error: ${error.message}`);
      }
    };

    handleRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error de Redirección</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Volver al Login
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{status}</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>URL: {window.location.href}</p>
              <p>Hash: {window.location.hash.substring(0, 100)}...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedirectFix;
