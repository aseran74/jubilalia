import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const VercelAuthFix: React.FC = () => {
  const [status, setStatus] = useState('Iniciando diagnóstico...');
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setStatus('Verificando autenticación...');
        
        // 1. Verificar sesión actual
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(`Error de sesión: ${sessionError.message}`);
          setStatus('Error de sesión');
          return;
        }

        setSession(currentSession);

        if (currentSession) {
          setUser(currentSession.user);
          setStatus('✅ Usuario autenticado correctamente');
        } else {
          setStatus('❌ No hay sesión activa');
        }

        // 2. Verificar usuario actual
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError(`Error de usuario: ${userError.message}`);
          setStatus('Error de usuario');
          return;
        }

        setUser(currentUser);

        // 3. Test de acceso a datos
        if (currentUser) {
          setStatus('Probando acceso a datos...');
          
          const { error: roomsError } = await supabase
            .from('rooms')
            .select('*')
            .limit(1);
          
          if (roomsError) {
            setError(`Error accediendo a rooms: ${roomsError.message}`);
            setStatus('Error accediendo a datos');
          } else {
            setStatus('✅ Acceso a datos funcionando correctamente');
          }
        }

      } catch (error: any) {
        setError(`Error inesperado: ${error.message}`);
        setStatus('Error inesperado');
      }
    };

    checkAuth();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setStatus('Iniciando login con Google...');
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(`Error en login: ${error.message}`);
        setStatus('Error en login');
      } else {
        setStatus('Redirigiendo a Google...');
      }
    } catch (error: any) {
      setError(`Error inesperado: ${error.message}`);
      setStatus('Error inesperado');
    }
  };

  const handleLogout = async () => {
    try {
      setStatus('Cerrando sesión...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(`Error al cerrar sesión: ${error.message}`);
      } else {
        setUser(null);
        setSession(null);
        setStatus('✅ Sesión cerrada correctamente');
      }
    } catch (error: any) {
      setError(`Error inesperado: ${error.message}`);
    }
  };

  const testDataAccess = async () => {
    try {
      setStatus('Probando acceso a datos...');
      
      // Test rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .limit(5);
      
      if (roomsError) {
        setError(`Error en rooms: ${roomsError.message}`);
        return;
      }

      // Test profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
      
      if (profilesError) {
        setError(`Error en profiles: ${profilesError.message}`);
        return;
      }

      setStatus(`✅ Datos accesibles - Rooms: ${rooms.length}, Profiles: ${profiles.length}`);
      
    } catch (error: any) {
      setError(`Error inesperado: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 Solucionador de Autenticación Vercel</h1>
      
      {/* Estado actual */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Estado Actual</h2>
        <div className="space-y-2">
          <p><strong>Estado:</strong> {status}</p>
          {error && (
            <div className="bg-red-50 p-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
          {user && (
            <div className="bg-green-50 p-3 rounded">
              <strong>Usuario:</strong> {user.email} (ID: {user.id})
            </div>
          )}
          {session && (
            <div className="bg-blue-50 p-3 rounded">
              <strong>Sesión:</strong> Activa hasta {new Date(session.expires_at * 1000).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Acciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleGoogleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔐 Login con Google
          </button>
          
          <button
            onClick={testDataAccess}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📊 Probar Acceso a Datos
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Información de debugging */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Información de Debugging</h2>
        <div className="text-sm space-y-2">
          <p><strong>URL actual:</strong> {window.location.href}</p>
          <p><strong>Origen:</strong> {window.location.origin}</p>
          <p><strong>Es producción:</strong> {import.meta.env.PROD ? '✅ Sí (Vercel)' : '❌ No (Local)'}</p>
          <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
          <p><strong>Tiene Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Sí' : '❌ No'}</p>
          <p><strong>Longitud Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 'N/A'} caracteres</p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-yellow-50 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">📋 Instrucciones para Vercel</h2>
        <div className="text-sm space-y-2">
          <p><strong>1.</strong> Si no hay sesión activa, haz clic en "Login con Google"</p>
          <p><strong>2.</strong> Completa el proceso de autenticación con Google</p>
          <p><strong>3.</strong> Una vez autenticado, prueba el acceso a datos</p>
          <p><strong>4.</strong> Si todo funciona, puedes navegar a las otras secciones</p>
          <p><strong>5.</strong> Si hay errores, verifica las variables de entorno en Vercel</p>
        </div>
      </div>
    </div>
  );
};

export default VercelAuthFix;
