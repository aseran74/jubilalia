import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DatabaseDiagnostic: React.FC = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const runDiagnostics = async () => {
      const diagnostics: any = {};

      // 1. Verificar usuario actual
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) {
          diagnostics.user = { error: error.message };
        } else {
          diagnostics.user = {
            isAuthenticated: !!currentUser,
            email: currentUser?.email,
            id: currentUser?.id
          };
          setUser(currentUser);
        }
      } catch (error: any) {
        diagnostics.user = { error: error.message };
      }

      // 2. Verificar sesión
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          diagnostics.session = { error: error.message };
        } else {
          diagnostics.session = {
            hasSession: !!session,
            accessToken: session?.access_token ? 'Presente' : 'Ausente',
            expiresAt: session?.expires_at
          };
        }
      } catch (error: any) {
        diagnostics.session = { error: error.message };
      }

      // 3. Test de tablas principales
      const tables = ['profiles', 'rooms', 'property_listings', 'groups', 'activities', 'messages'];
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(1);
          
          diagnostics[table] = {
            success: !error,
            error: error?.message || null,
            hasData: data && data.length > 0,
            count: count || 0,
            sampleData: data?.[0] || null
          };
        } catch (error: any) {
          diagnostics[table] = {
            success: false,
            error: error.message
          };
        }
      }

      // 4. Test de RLS específico
      if (user) {
        try {
          // Test de inserción en profiles
          const testProfile = {
            auth_user_id: user.id,
            full_name: 'Test User',
            email: user.email,
            bio: 'Test profile for diagnostics'
          };

          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert(testProfile)
            .select()
            .single();

          if (insertError) {
            diagnostics.rlsTest = {
              canInsert: false,
              error: insertError.message
            };
          } else {
            diagnostics.rlsTest = {
              canInsert: true,
              insertedId: insertData.id
            };

            // Limpiar el test
            await supabase.from('profiles').delete().eq('id', insertData.id);
          }
        } catch (error: any) {
          diagnostics.rlsTest = {
            canInsert: false,
            error: error.message
          };
        }
      }

      setResults(diagnostics);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  const testSpecificQuery = async (table: string) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);
      
      if (error) {
        alert(`Error en ${table}: ${error.message}`);
      } else {
        alert(`${table}: ${data.length} registros encontrados`);
        console.log(`${table} data:`, data);
      }
    } catch (error: any) {
      alert(`Error inesperado en ${table}: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-2">Ejecutando diagnósticos de base de datos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Base de Datos</h1>
      
      {/* Usuario actual */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">1. Usuario Actual</h2>
        <div className="text-sm">
          {results.user?.error ? (
            <div className="bg-red-50 p-3 rounded">
              <strong>Error:</strong> {results.user.error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Autenticado:</strong>
                <span className={results.user?.isAuthenticated ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                  {results.user?.isAuthenticated ? '✅ Sí' : '❌ No'}
                </span>
              </div>
              <div>
                <strong>Email:</strong> {results.user?.email || 'N/A'}
              </div>
              <div>
                <strong>ID:</strong> {results.user?.id || 'N/A'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sesión */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">2. Sesión</h2>
        <div className="text-sm">
          {results.session?.error ? (
            <div className="bg-red-50 p-3 rounded">
              <strong>Error:</strong> {results.session.error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Tiene sesión:</strong>
                <span className={results.session?.hasSession ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                  {results.session?.hasSession ? '✅ Sí' : '❌ No'}
                </span>
              </div>
              <div>
                <strong>Access Token:</strong> {results.session?.accessToken || 'N/A'}
              </div>
              <div>
                <strong>Expira:</strong> {results.session?.expiresAt ? new Date(results.session.expiresAt * 1000).toLocaleString() : 'N/A'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test de RLS */}
      {user && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">3. Test de RLS (Row Level Security)</h2>
          <div className="text-sm">
            {results.rlsTest?.error ? (
              <div className="bg-red-50 p-3 rounded">
                <strong>Error:</strong> {results.rlsTest.error}
              </div>
            ) : (
              <div>
                <strong>Puede insertar en profiles:</strong>
                <span className={results.rlsTest?.canInsert ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                  {results.rlsTest?.canInsert ? '✅ Sí' : '❌ No'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado de las tablas */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">4. Estado de las Tablas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['profiles', 'rooms', 'property_listings', 'groups', 'activities', 'messages'].map((table) => (
            <div key={table} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 capitalize">{table}</h3>
              <div className="text-sm space-y-1">
                <div>
                  <strong>Estado:</strong>
                  <span className={results[table]?.success ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                    {results[table]?.success ? '✅ OK' : '❌ Error'}
                  </span>
                </div>
                {results[table]?.error && (
                  <div className="text-red-600 text-xs">
                    {results[table].error}
                  </div>
                )}
                {results[table]?.success && (
                  <>
                    <div>
                      <strong>Registros:</strong> {results[table].count || 0}
                    </div>
                    <div>
                      <strong>Tiene datos:</strong>
                      <span className={results[table]?.hasData ? 'text-green-600 ml-1' : 'text-yellow-600 ml-1'}>
                        {results[table]?.hasData ? '✅ Sí' : '⚠️ No'}
                      </span>
                    </div>
                    <button
                      onClick={() => testSpecificQuery(table)}
                      className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      Test Query
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información completa */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Información Completa</h2>
        <pre className="text-xs bg-white p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DatabaseDiagnostic;
