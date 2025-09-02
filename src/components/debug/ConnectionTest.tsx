import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const ConnectionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Probando conexión...');

    try {
      // Obtener variables de entorno
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('Supabase URL:', supabaseUrl);
      console.log('Supabase Key length:', supabaseKey?.length);

      if (!supabaseUrl || !supabaseKey) {
        setTestResult('❌ Variables de entorno no configuradas');
        setIsLoading(false);
        return;
      }

      // Crear cliente Supabase
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Probar conexión simple
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        setTestResult(`❌ Error de conexión: ${error.message}`);
        console.error('Supabase error:', error);
      } else {
        setTestResult(`✅ Conexión exitosa: ${JSON.stringify(data)}`);
        console.log('Supabase success:', data);
      }
    } catch (error) {
      setTestResult(`❌ Error de red: ${error}`);
      console.error('Network error:', error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 Prueba de Conexión Supabase
          </h1>

          <div className="space-y-6">
            {/* Variables de entorno */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Variables de Entorno
              </h2>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'No configurada'}</p>
                <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? `Configurada (${import.meta.env.VITE_SUPABASE_ANON_KEY.length} caracteres)` : 'No configurada'}</p>
              </div>
            </div>

            {/* Botón de prueba */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Prueba de Conexión
              </h2>
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Probando...' : 'Probar Conexión'}
              </button>
            </div>

            {/* Resultado */}
            {testResult && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Resultado
                </h2>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {testResult}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                Información de Configuración
              </h2>
              <div className="text-sm text-yellow-700 space-y-2">
                <p><strong>URL:</strong> https://sdmkodriokrpsdegweat.supabase.co</p>
                <p><strong>Clave esperada:</strong> Debería tener ~150+ caracteres</p>
                <p><strong>Clave actual:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0} caracteres</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;