import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Probando...');
  const [testResults, setTestResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    try {
      setConnectionStatus('Probando conexión...');
      setError('');
      setTestResults(null);

      // Test 1: Verificar configuración
      console.log('🔧 Configuración actual:', {
        url: supabase.supabaseUrl,
        anonKey: supabase.supabaseKey ? `${supabase.supabaseKey.substring(0, 20)}...` : 'No configurado'
      });

      // Test 2: Consulta simple
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      setTestResults({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
      setConnectionStatus('✅ Conexión exitosa');

    } catch (err: any) {
      console.error('❌ Error de conexión:', err);
      setError(err.message || 'Error desconocido');
      setConnectionStatus('❌ Error de conexión');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Prueba de Conexión Supabase</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Estado de la conexión</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-medium">Estado:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                connectionStatus.includes('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : connectionStatus.includes('❌') 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {connectionStatus}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="font-medium text-red-800 mb-2">Error:</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {testResults && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-medium text-green-800 mb-2">Resultado exitoso:</h3>
                <pre className="text-sm text-green-700 bg-green-100 p-2 rounded">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <button
            onClick={testConnection}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Probar de nuevo
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Información de configuración</h2>
          <div className="space-y-2 text-sm">
            <p><strong>URL:</strong> {supabase.supabaseUrl}</p>
            <p><strong>Clave anónima:</strong> {supabase.supabaseKey ? `${supabase.supabaseKey.substring(0, 20)}...` : 'No configurada'}</p>
            <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
