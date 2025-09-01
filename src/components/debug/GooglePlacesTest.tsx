import React, { useState } from 'react';
import LocationSelector from '../common/LocationSelector';

const GooglePlacesTest: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');

  const handleLocationSelect = (location: any) => {
    console.log('Location selected in test component:', location);
    setSelectedLocation(location);
  };

  const checkApiKey = () => {
    const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    setApiKey(key || 'No encontrada');
    console.log('API Key disponible:', key ? 'Sí' : 'No');
    console.log('API Key:', key);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Prueba de Google Places API
          </h1>

          <div className="space-y-6">
            {/* Verificar API Key */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Verificar API Key
              </h2>
              <button
                onClick={checkApiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Verificar API Key
              </button>
              {apiKey && (
                <div className="mt-2">
                  <p className="text-sm text-blue-700">
                    <strong>API Key:</strong> {apiKey}
                  </p>
                </div>
              )}
            </div>

            {/* LocationSelector de prueba */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                LocationSelector de Prueba
              </h2>
              <LocationSelector
                onLocationSelect={handleLocationSelect}
                placeholder="Escribe una dirección para probar..."
                label="Buscar ubicación"
                required={true}
              />
            </div>

            {/* Resultado seleccionado */}
            {selectedLocation && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                  Ubicación Seleccionada
                </h2>
                <pre className="text-sm text-yellow-800 bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(selectedLocation, null, 2)}
                </pre>
              </div>
            )}

            {/* Instrucciones */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Instrucciones de Prueba
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Verifica que tengas la API key configurada en tu archivo .env</li>
                <li>Escribe una dirección en el campo de búsqueda</li>
                <li>Selecciona una sugerencia de la lista</li>
                <li>Verifica que los campos se completen automáticamente</li>
                <li>Revisa la consola del navegador para ver los logs</li>
              </ol>
            </div>

            {/* Variables de entorno */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">
                Variables de Entorno
              </h2>
              <div className="space-y-2 text-sm text-purple-700">
                <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'No configurada'}</p>
                <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada'}</p>
                <p><strong>VITE_GOOGLE_PLACES_API_KEY:</strong> {import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? 'Configurada' : 'No configurada'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GooglePlacesTest;
