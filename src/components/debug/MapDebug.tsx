import React, { useState, useEffect, useRef } from 'react';

const MapDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    console.log('MapDebug:', info);
  };

  useEffect(() => {
    // Verificar API Key
    const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    setApiKey(key || 'NO ENCONTRADA');
    addDebugInfo(`API Key: ${key ? 'ENCONTRADA' : 'NO ENCONTRADA'}`);
    
    // Verificar Google Maps
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      addDebugInfo('Google Maps ya está cargado');
    } else {
      addDebugInfo('Google Maps NO está cargado');
      loadGoogleMaps();
    }
  }, []);

  const loadGoogleMaps = () => {
    addDebugInfo('Cargando Google Maps API...');
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      addDebugInfo('✅ Google Maps API cargada exitosamente');
      setGoogleMapsLoaded(true);
      createTestMap();
    };

    script.onerror = (error) => {
      addDebugInfo('❌ Error cargando Google Maps API');
      console.error('Error loading Google Maps:', error);
    };

    document.head.appendChild(script);
  };

  const createTestMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      addDebugInfo('❌ No se puede crear el mapa - referencias faltantes');
      return;
    }

    try {
      addDebugInfo('Creando mapa de prueba...');
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.4168, lng: -3.7038 },
        zoom: 10,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP
      });

      // Agregar marcador de prueba
      const marker = new window.google.maps.Marker({
        position: { lat: 40.4168, lng: -3.7038 },
        map: map,
        title: 'Madrid - Prueba'
      });

      addDebugInfo('✅ Mapa creado exitosamente');
      addDebugInfo('✅ Marcador agregado');
      
    } catch (error: any) {
      addDebugInfo(`❌ Error creando mapa: ${error.message}`);
      console.error('Error creating map:', error);
    }
  };

  const testRoomData = async () => {
    addDebugInfo('Probando carga de datos de habitaciones...');
    
    try {
      // Importar supabase directamente
      const { supabase } = await import('../../lib/supabase');
      addDebugInfo('✅ Supabase importado correctamente');
      
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .eq('listing_type', 'room_rental')
        .limit(5);

      if (error) {
        addDebugInfo(`❌ Error cargando habitaciones: ${error.message}`);
        return;
      }

      addDebugInfo(`✅ Habitaciones encontradas: ${data?.length || 0}`);
      
      if (data && data.length > 0) {
        data.forEach((room, index) => {
          addDebugInfo(`Habitación ${index + 1}: ${room.title} - ${room.city} - Lat: ${room.latitude || 'N/A'} - Lng: ${room.longitude || 'N/A'}`);
        });
      } else {
        addDebugInfo('⚠️ No se encontraron habitaciones');
      }
      
    } catch (error: any) {
      addDebugInfo(`❌ Error en test de datos: ${error.message}`);
      console.error('Error details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug del Mapa</h1>
          
          {/* Información de estado */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">API Key</h3>
              <p className="text-sm text-gray-600">{apiKey}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">Google Maps</h3>
              <p className="text-sm text-gray-600">{googleMapsLoaded ? '✅ Cargado' : '❌ No cargado'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">Window Google</h3>
              <p className="text-sm text-gray-600">{window.google ? '✅ Disponible' : '❌ No disponible'}</p>
            </div>
          </div>

          {/* Botones de prueba */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={loadGoogleMaps}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cargar Google Maps
            </button>
            <button
              onClick={createTestMap}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Crear Mapa de Prueba
            </button>
            <button
              onClick={testRoomData}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Probar Datos de Habitaciones
            </button>
          </div>

          {/* Mapa de prueba */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Mapa de Prueba</h3>
            <div 
              ref={mapRef} 
              className="w-full h-64 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center"
            >
              <p className="text-gray-500">El mapa aparecerá aquí</p>
            </div>
          </div>

          {/* Log de debug */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Log de Debug</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {debugInfo.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay información de debug aún</p>
              ) : (
                debugInfo.map((info, index) => (
                  <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                    {info}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDebug;
