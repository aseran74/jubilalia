import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { environment } from '../../config/environment';

const GoogleAuthDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {};

      // 1. Verificar variables de entorno
      results.environment = {
        hasSupabaseUrl: !!environment.supabase.url,
        hasSupabaseAnonKey: !!environment.supabase.anonKey,
        supabaseUrl: environment.supabase.url,
        anonKeyPreview: environment.supabase.anonKey ? `${environment.supabase.anonKey.substring(0, 20)}...` : 'No configurado',
        currentOrigin: window.location.origin,
        currentUrl: window.location.href
      };

      // 2. Verificar conectividad con Supabase
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        results.supabaseConnection = {
          success: !error,
          error: error?.message || null,
          data: data
        };
      } catch (error: any) {
        results.supabaseConnection = {
          success: false,
          error: error.message
        };
      }

      // 3. Verificar configuración de OAuth
      try {
        const { data: { session } } = await supabase.auth.getSession();
        results.currentSession = {
          hasSession: !!session,
          userEmail: session?.user?.email || null,
          userId: session?.user?.id || null
        };
      } catch (error: any) {
        results.currentSession = {
          hasSession: false,
          error: error.message
        };
      }

      // 4. Verificar configuración de Google OAuth
      results.googleOAuthConfig = {
        expectedRedirectUrl: `${window.location.origin}/auth/callback`,
        currentDomain: window.location.hostname,
        isHttps: window.location.protocol === 'https:',
        isLocalhost: window.location.hostname === 'localhost'
      };

      setDiagnostics(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  const testGoogleAuth = async () => {
    try {
      console.log('🧪 Probando autenticación con Google...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('❌ Error en autenticación Google:', error);
        alert(`Error: ${error.message}`);
      } else {
        console.log('✅ Redirección iniciada:', data);
      }
    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      alert(`Error inesperado: ${error.message}`);
    }
  };

  const clearSessionData = async () => {
    try {
      console.log('🧹 Limpiando datos de sesión...');
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Limpiar localStorage
      localStorage.clear();
      
      // Limpiar sessionStorage
      sessionStorage.clear();
      
      // Limpiar cookies del dominio
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      });
      
      alert('✅ Datos de sesión limpiados. Recarga la página para continuar.');
      window.location.reload();
    } catch (error: any) {
      console.error('❌ Error limpiando sesión:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🔍 Diagnóstico de Autenticación Google</h2>
        <div className="animate-pulse">Cargando diagnóstico...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🔍 Diagnóstico de Autenticación Google</h2>
      
      {/* Variables de entorno */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">📋 Variables de Entorno</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Supabase URL:</strong> 
              <span className={diagnostics.environment.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.environment.hasSupabaseUrl ? '✅ Configurado' : '❌ No configurado'}
              </span>
            </div>
            <div>
              <strong>Supabase Anon Key:</strong> 
              <span className={diagnostics.environment.hasSupabaseAnonKey ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.environment.hasSupabaseAnonKey ? '✅ Configurado' : '❌ No configurado'}
              </span>
            </div>
            <div><strong>URL actual:</strong> {diagnostics.environment.currentUrl}</div>
            <div><strong>Origen:</strong> {diagnostics.environment.currentOrigin}</div>
          </div>
        </div>
      </div>

      {/* Conectividad Supabase */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">🔗 Conectividad Supabase</h3>
        <div className={`p-4 rounded ${diagnostics.supabaseConnection.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={diagnostics.supabaseConnection.success ? 'text-green-600' : 'text-red-600'}>
            {diagnostics.supabaseConnection.success ? '✅ Conectado' : '❌ Error de conexión'}
          </div>
          {diagnostics.supabaseConnection.error && (
            <div className="text-red-600 text-sm mt-2">
              Error: {diagnostics.supabaseConnection.error}
            </div>
          )}
        </div>
      </div>

      {/* Sesión actual */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">👤 Sesión Actual</h3>
        <div className={`p-4 rounded ${diagnostics.currentSession.hasSession ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className={diagnostics.currentSession.hasSession ? 'text-green-600' : 'text-yellow-600'}>
            {diagnostics.currentSession.hasSession ? '✅ Usuario autenticado' : '⚠️ No hay sesión activa'}
          </div>
          {diagnostics.currentSession.userEmail && (
            <div className="text-sm mt-2">
              Email: {diagnostics.currentSession.userEmail}
            </div>
          )}
        </div>
      </div>

      {/* Configuración OAuth */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">🔐 Configuración OAuth</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm space-y-2">
            <div><strong>URL de redirección esperada:</strong> {diagnostics.googleOAuthConfig.expectedRedirectUrl}</div>
            <div><strong>Dominio actual:</strong> {diagnostics.googleOAuthConfig.currentDomain}</div>
            <div>
              <strong>HTTPS:</strong> 
              <span className={diagnostics.googleOAuthConfig.isHttps ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.googleOAuthConfig.isHttps ? '✅ Sí' : '❌ No'}
              </span>
            </div>
            <div>
              <strong>Localhost:</strong> 
              <span className={diagnostics.googleOAuthConfig.isLocalhost ? 'text-yellow-600' : 'text-green-600'}>
                {diagnostics.googleOAuthConfig.isLocalhost ? '⚠️ Sí' : '✅ No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de prueba */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">🧪 Pruebas y Soluciones</h3>
        <div className="space-x-4">
          <button
            onClick={testGoogleAuth}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Probar Autenticación con Google
          </button>
          <button
            onClick={clearSessionData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            🧹 Limpiar Datos de Sesión
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <strong>Nota:</strong> Si funciona en modo incógnito pero no en sesión normal, usa el botón "Limpiar Datos de Sesión"
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="text-lg font-semibold mb-3">📝 Instrucciones para Solucionar</h3>
        <div className="text-sm space-y-2">
          <div><strong>1. Variables de entorno:</strong> Asegúrate de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas en Vercel</div>
          <div><strong>2. Configuración en Supabase:</strong> Ve a Authentication → Providers → Google y configura las URLs de redirección</div>
          <div><strong>3. URLs de redirección en Supabase:</strong> Agrega {diagnostics.googleOAuthConfig.expectedRedirectUrl}</div>
          <div><strong>4. Google Cloud Console:</strong> Verifica que las URLs autorizadas incluyan tu dominio de Vercel</div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthDiagnostic;
