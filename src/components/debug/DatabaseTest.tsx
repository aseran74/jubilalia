import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testTables = async () => {
    setIsLoading(true);
    setTestResult('Probando tablas...');

    try {
      // Probar tabla profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (profilesError) {
        setTestResult(`❌ Error en tabla profiles: ${profilesError.message}`);
        setIsLoading(false);
        return;
      }

      // Probar tabla property_listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('property_listings')
        .select('count')
        .limit(1);

      if (listingsError) {
        setTestResult(`❌ Error en tabla property_listings: ${listingsError.message}`);
        setIsLoading(false);
        return;
      }

      // Probar tabla room_rentals
      const { data: roomsData, error: roomsError } = await supabase
        .from('room_rentals')
        .select('count')
        .limit(1);

      if (roomsError) {
        setTestResult(`❌ Error en tabla room_rentals: ${roomsError.message}`);
        setIsLoading(false);
        return;
      }

      setTestResult(`✅ Todas las tablas funcionan correctamente:
- profiles: ${profilesData?.length || 0} registros
- property_listings: ${listingsData?.length || 0} registros  
- room_rentals: ${roomsData?.length || 0} registros`);

    } catch (error) {
      setTestResult(`❌ Error general: ${error}`);
    }

    setIsLoading(false);
  };

  const createSampleData = async () => {
    setIsLoading(true);
    setTestResult('Creando datos de prueba...');

    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTestResult('❌ No hay usuario autenticado');
        setIsLoading(false);
        return;
      }

      // Crear perfil de prueba si no existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            auth_user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Usuario de Prueba',
            phone: '600000000',
            address: 'Calle de Prueba 123',
            city: 'Madrid',
            postal_code: '28001',
            country: 'España',
            is_location_public: false,
            max_age: 75,
            min_age: 55
          });

        if (profileError) {
          setTestResult(`❌ Error creando perfil: ${profileError.message}`);
          setIsLoading(false);
          return;
        }
      }

      setTestResult('✅ Datos de prueba creados correctamente');

    } catch (error) {
      setTestResult(`❌ Error creando datos: ${error}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🗄️ Prueba de Base de Datos
          </h1>

          <div className="space-y-6">
            {/* Botón de prueba de tablas */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Probar Tablas
              </h2>
              <button
                onClick={testTables}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Probando...' : 'Probar Tablas'}
              </button>
            </div>

            {/* Botón de crear datos de prueba */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Crear Datos de Prueba
              </h2>
              <button
                onClick={createSampleData}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Creando...' : 'Crear Datos de Prueba'}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;
