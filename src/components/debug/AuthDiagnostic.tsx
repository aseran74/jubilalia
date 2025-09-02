import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { environment } from '../../config/environment';

const AuthDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {};

      // 1. Verificar configuración de entorno
      results.environment = {
        supabaseUrl: environment.supabase.url,
        hasAnonKey: !!environment.supabase.anonKey,
        anonKeyLength: environment.supabase.anonKey?.length || 0,
        currentOrigin: window.location.origin,
        currentHost: window.location.host,
        isProduction: window.location.host.includes('vercel.app')
      };

      // 2. Verificar conexión con Supabase
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

      // 3. Verificar configuración de autenticación
      try {
        const { data: { session } } = await supabase.auth.getSession();
        results.currentSession = {
          hasSession: !!session,
          userEmail: session?.user?.email || null,
          userId: session?.user?.id || null
        };
      } catch (error: any) {
        results.currentSession = {
          error: error.message
        };
      }

      // 4. Verificar configuración de OAuth
      results.oauthConfig = {
        expectedRedirectUrl: `${window.location.origin}/auth/callback`,
        currentUrl: window.location.href,
        searchParams: Object.fromEntries(new URLSearchParams(window.location.search))
      };

      setDiagnostics(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  const testGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        console.log('OAuth iniciado:', data);
      }
    } catch (error: any) {
      alert(`Error inesperado: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-2">Ejecutando diagnósticos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Autenticación</h1>
      
      {/* Configuración de entorno */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">1. Configuración de Entorno</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Supabase URL:</strong>
            <p className="text-gray-600 break-all">{diagnostics.environment?.supabaseUrl}</p>
          </div>
          <div>
            <strong>Tiene Anon Key:</strong>
            <p className={diagnostics.environment?.hasAnonKey ? 'text-green-600' : 'text-red-600'}>
              {diagnostics.environment?.hasAnonKey ? '✅ Sí' : '❌ No'}
            </p>
          </div>
          <div>
            <strong>Longitud Anon Key:</strong>
            <p className="text-gray-600">{diagnostics.environment?.anonKeyLength} caracteres</p>
          </div>
          <div>
            <strong>Origen actual:</strong>
            <p className="text-gray-600">{diagnostics.environment?.currentOrigin}</p>
          </div>
          <div>
            <strong>Host actual:</strong>
            <p className="text-gray-600">{diagnostics.environment?.currentHost}</p>
          </div>
          <div>
            <strong>Es producción:</strong>
            <p className={diagnostics.environment?.isProduction ? 'text-green-600' : 'text-yellow-600'}>
              {diagnostics.environment?.isProduction ? '✅ Sí (Vercel)' : '❌ No (Local)'}
            </p>
          </div>
        </div>
      </div>

      {/* Conexión con Supabase */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">2. Conexión con Supabase</h2>
        <div className="text-sm">
          <div className="mb-2">
            <strong>Estado:</strong>
            <span className={diagnostics.supabaseConnection?.success ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
              {diagnostics.supabaseConnection?.success ? '✅ Conectado' : '❌ Error'}
            </span>
          </div>
          {diagnostics.supabaseConnection?.error && (
            <div className="bg-red-50 p-3 rounded">
              <strong>Error:</strong> {diagnostics.supabaseConnection.error}
            </div>
          )}
        </div>
      </div>

      {/* Sesión actual */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">3. Sesión Actual</h2>
        <div className="text-sm">
          <div className="mb-2">
            <strong>Tiene sesión:</strong>
            <span className={diagnostics.currentSession?.hasSession ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
              {diagnostics.currentSession?.hasSession ? '✅ Sí' : '❌ No'}
            </span>
          </div>
          {diagnostics.currentSession?.userEmail && (
            <div>
              <strong>Email:</strong> {diagnostics.currentSession.userEmail}
            </div>
          )}
          {diagnostics.currentSession?.userId && (
            <div>
              <strong>User ID:</strong> {diagnostics.currentSession.userId}
            </div>
          )}
          {diagnostics.currentSession?.error && (
            <div className="bg-red-50 p-3 rounded mt-2">
              <strong>Error:</strong> {diagnostics.currentSession.error}
            </div>
          )}
        </div>
      </div>

      {/* Configuración OAuth */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">4. Configuración OAuth</h2>
        <div className="text-sm space-y-2">
          <div>
            <strong>URL de redirección esperada:</strong>
            <p className="text-gray-600 break-all">{diagnostics.oauthConfig?.expectedRedirectUrl}</p>
          </div>
          <div>
            <strong>URL actual:</strong>
            <p className="text-gray-600 break-all">{diagnostics.oauthConfig?.currentUrl}</p>
          </div>
          <div>
            <strong>Parámetros de URL:</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(diagnostics.oauthConfig?.searchParams, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Test de Google Auth */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">5. Test de Google Auth</h2>
        <button
          onClick={testGoogleAuth}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Probar Google OAuth
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Esto iniciará el flujo de autenticación con Google
        </p>
      </div>

      {/* Información completa */}
      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Información Completa</h2>
        <pre className="text-xs bg-white p-4 rounded overflow-auto">
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AuthDiagnostic;
