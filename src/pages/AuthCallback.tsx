import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener la sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/login?error=auth_error');
          return;
        }

        if (session) {
          console.log('✅ Usuario autenticado correctamente:', session.user.email);
          // Redirigir al dashboard
          navigate('/dashboard');
        } else {
          console.log('❌ No hay sesión activa');
          navigate('/login?error=no_session');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
