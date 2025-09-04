import React, { useState, useEffect } from 'react';

const GoogleMapsDiagnostic: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [mapsStatus, setMapsStatus] = useState<string>('Verificando...');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  useEffect(() => {
    checkApiKey();
    checkGoogleMaps();
  }, []);

  const checkApiKey = () => {
    const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    setApiKey(key || 'No encontrada');
    
    if (key) {
      addTestResult(`✅ API Key encontrada: ${key.substring(0, 10)}...`);
    } else {
      addTestResult('❌ API Key NO encontrada en VITE_GOOGLE_PLACES_API_KEY');
    }
  };

  const checkGoogleMaps = () => {
    if (window.google) {
      addTestResult('✅ Google Maps está disponible');
      
      if (window.google.maps) {
        addTestResult('✅ Google Maps API está disponible');
        setMapsStatus('✅ Google Maps API funcionando');
      } else {
        addTestResult('❌ Google Maps API NO está disponible');
        setMapsStatus('❌ Google Maps API no disponible');
      }
    } else {
      addTestResult('❌ Google Maps NO está disponible');
      setMapsStatus('❌ Google Maps no disponible');
    }
  };

  const loadGoogleMapsAPI = () => {
    addTestResult('🔄 Cargando Google Maps API...');
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      addTestResult('✅ Google Maps API cargada exitosamente');
      checkGoogleMaps();
    };

    script.onerror = () => {
      addTestResult('❌ Error cargando Google Maps API');
    };

    document.head.appendChild(script);
  };

  const testMapCreation = () => {
    if (!window.google || !window.google.maps) {
      addTestResult('❌ Google Maps no está disponible para crear mapa');
      return;
    }

    try {
      const testDiv = document.createElement('div');
      testDiv.style.width = '100px';
      testDiv.style.height = '100px';
      document.body.appendChild(testDiv);

      new window.google.maps.Map(testDiv, {
        center: { lat: 40.4168, lng: -3.7038 },
        zoom: 10
      });

      addTestResult('✅ Mapa de prueba creado exitosamente');
      document.body.removeChild(testDiv);
    } catch (error: any) {
      addTestResult(`❌ Error creando mapa de prueba: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Diagnóstico de Google Maps</h1>
          
          {/* Estado de la API */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">API Key</h2>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Estado:</strong> {apiKey ? '✅ Configurada' : '❌ No configurada'}
              </p>
              <p className="text-xs text-gray-500 break-all">
                {apiKey}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Google Maps</h2>
              <p className="text-sm text-gray-600">
                <strong>Estado:</strong> {mapsStatus}
              </p>
            </div>
          </div>

          {/* Botones de prueba */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={checkApiKey}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔍 Verificar API Key
            </button>
            <button
              onClick={checkGoogleMaps}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🗺️ Verificar Google Maps
            </button>
            <button
              onClick={loadGoogleMapsAPI}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              📥 Cargar Google Maps API
            </button>
            <button
              onClick={testMapCreation}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              🧪 Probar Creación de Mapa
            </button>
          </div>

          {/* Resultados de las pruebas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Resultados de las Pruebas</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay resultados aún</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Información de Debug</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>URL actual:</strong> {window.location.href}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Google Maps disponible:</strong> {window.google ? 'Sí' : 'No'}</p>
              {window.google && (
                <p><strong>Google Maps API disponible:</strong> {window.google.maps ? 'Sí' : 'No'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsDiagnostic;
