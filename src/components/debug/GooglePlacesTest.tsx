import React, { useState, useEffect } from 'react';
import LocationSelector from '../common/LocationSelector';

const GooglePlacesTest: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');
  const [googleStatus, setGoogleStatus] = useState<string>('Verificando...');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const checkApiKey = () => {
    const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    setApiKey(key || 'No encontrada');
    
    if (key) {
      addTestResult(`✅ API Key encontrada: ${key.substring(0, 10)}...`);
    } else {
      addTestResult('❌ API Key NO encontrada en VITE_GOOGLE_PLACES_API_KEY');
    }
    
    console.log('API Key disponible:', key ? 'Sí' : 'No');
    console.log('API Key:', key);
  };

  const checkGoogleMaps = () => {
    if (window.google) {
      addTestResult('✅ Google Maps está disponible');
      
      if (window.google.maps) {
        addTestResult('✅ Google Maps API está disponible');
        
        if (window.google.maps.places) {
          addTestResult('✅ Google Places API está disponible');
          setGoogleStatus('✅ Google Places API funcionando');
        } else {
          addTestResult('❌ Google Places API NO está disponible');
          setGoogleStatus('❌ Google Places API no disponible');
        }
      } else {
        addTestResult('❌ Google Maps API NO está disponible');
        setGoogleStatus('❌ Google Maps API no disponible');
      }
    } else {
      addTestResult('❌ Google Maps NO está disponible');
      setGoogleStatus('❌ Google Maps no disponible');
    }
  };

  const testGooglePlacesDirectly = () => {
    try {
      if (window.google?.maps?.places) {
        const service = new window.google.maps.places.AutocompleteService();
        addTestResult('✅ AutocompleteService creado exitosamente');
        
        // Test simple
        service.getPlacePredictions({
          input: 'Madrid',
          types: ['geocode']
        }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            addTestResult(`✅ Test de búsqueda exitoso: ${predictions?.length || 0} resultados`);
          } else {
            addTestResult(`❌ Test de búsqueda falló: ${status}`);
          }
        });
      } else {
        addTestResult('❌ No se puede probar Google Places - API no disponible');
      }
    } catch (error) {
      addTestResult(`❌ Error al probar Google Places: ${error}`);
    }
  };

  const handleLocationSelect = (location: any) => {
    console.log('Location selected in test component:', location);
    setSelectedLocation(location);
    addTestResult(`✅ Ubicación seleccionada: ${location.address}, ${location.city}`);
  };

  useEffect(() => {
    // Verificar estado inicial
    checkApiKey();
    
    // Verificar Google Maps después de un delay
    const timer = setTimeout(() => {
      checkGoogleMaps();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔍 Diagnóstico de Google Places API
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel Izquierdo - Diagnóstico */}
            <div className="space-y-6">
              {/* Estado de Google */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Estado de Google Places API
                </h2>
                <div className="text-sm text-blue-700 mb-3">
                  <strong>Estado:</strong> {googleStatus}
                </div>
                <button
                  onClick={checkGoogleMaps}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                >
                  Verificar Estado
                </button>
                <button
                  onClick={testGooglePlacesDirectly}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Probar API
                </button>
              </div>

              {/* Verificar API Key */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">
                  Verificar API Key
                </h2>
                <button
                  onClick={checkApiKey}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Verificar API Key
                </button>
                {apiKey && (
                  <div className="mt-2">
                    <p className="text-sm text-purple-700">
                      <strong>API Key:</strong> {apiKey}
                    </p>
                  </div>
                )}
              </div>

              {/* Variables de entorno */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Variables de Entorno
                </h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'No configurada'}</p>
                  <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada'}</p>
                  <p><strong>VITE_GOOGLE_PLACES_API_KEY:</strong> {import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? 'Configurada' : 'No configurada'}</p>
                </div>
              </div>

              {/* Logs de prueba */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                  Logs de Prueba
                </h2>
                <div className="max-h-40 overflow-y-auto bg-white p-3 rounded border text-xs">
                  {testResults.length === 0 ? (
                    <p className="text-gray-500">No hay logs aún. Ejecuta las pruebas para ver resultados.</p>
                  ) : (
                    testResults.map((result, index) => (
                      <div key={index} className="mb-1">
                        {result}
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setTestResults([])}
                  className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Limpiar Logs
                </button>
              </div>
            </div>

            {/* Panel Derecho - Pruebas */}
            <div className="space-y-6">
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
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h2 className="text-lg font-semibold text-green-900 mb-2">
                    ✅ Ubicación Seleccionada
                  </h2>
                  <pre className="text-sm text-green-800 bg-white p-3 rounded border overflow-auto">
                    {JSON.stringify(selectedLocation, null, 2)}
                  </pre>
                </div>
              )}

              {/* Instrucciones */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  📋 Instrucciones de Diagnóstico
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                  <li>Verifica que tengas la API key en tu archivo .env</li>
                  <li>Habilita Places API en Google Cloud Console</li>
                  <li>Verifica restricciones de la API key</li>
                  <li>Ejecuta las pruebas de diagnóstico</li>
                  <li>Revisa la consola del navegador</li>
                  <li>Prueba el LocationSelector escribiendo una dirección</li>
                </ol>
              </div>

              {/* Solución de problemas */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  🚨 Solución de Problemas Comunes
                </h2>
                <div className="text-sm text-red-700 space-y-2">
                  <p><strong>API Key no encontrada:</strong> Verifica VITE_GOOGLE_PLACES_API_KEY en .env</p>
                  <p><strong>Places API no habilitada:</strong> Ve a Google Cloud Console > APIs & Services > Library</p>
                  <p><strong>Restricciones de dominio:</strong> Verifica que localhost esté permitido</p>
                  <p><strong>Cuota excedida:</strong> Verifica el uso de la API en Google Cloud Console</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GooglePlacesTest;
