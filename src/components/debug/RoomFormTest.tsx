import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const RoomFormTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testRoomInsert = async () => {
    setIsLoading(true);
    setTestResult('Probando inserción de habitación...');

    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTestResult('❌ No hay usuario autenticado');
        setIsLoading(false);
        return;
      }

      // Obtener el perfil del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) {
        setTestResult('❌ No se encontró el perfil del usuario');
        setIsLoading(false);
        return;
      }

      // Crear un listing de prueba
      const { data: listingData, error: listingError } = await supabase
        .from('property_listings')
        .insert({
          title: 'Habitación de Prueba',
          description: 'Descripción de prueba',
          address: 'Calle de Prueba 123',
          city: 'Madrid',
          postal_code: '28001',
          price: 500,
          listing_type: 'room_rental',
          profile_id: profile.id,
          available_from: new Date().toISOString().split('T')[0],
          images: []
        })
        .select()
        .single();

      if (listingError) {
        setTestResult(`❌ Error creando listing: ${listingError.message}`);
        setIsLoading(false);
        return;
      }

      // Crear los requisitos de la habitación
      const { error: requirementsError } = await supabase
        .from('room_rental_requirements')
        .insert({
          listing_id: listingData.id,
          bed_type: 'single',
          room_area: 15,
          private_bathroom: true,
          has_balcony: false,
          preferred_gender: 'no_preference',
          preferred_age_min: 55,
          preferred_age_max: 75,
          smoking_allowed: false,
          pets_allowed: false,
          pet_types: [],
          other_requirements: 'Ninguno'
        });

      if (requirementsError) {
        setTestResult(`❌ Error creando requisitos: ${requirementsError.message}`);
        setIsLoading(false);
        return;
      }

      setTestResult('✅ Habitación de prueba creada correctamente');

    } catch (error) {
      setTestResult(`❌ Error general: ${error}`);
    }

    setIsLoading(false);
  };

  const testValidBedTypes = async () => {
    setIsLoading(true);
    setTestResult('Probando tipos de cama válidos...');

    const bedTypes = ['single', 'double', 'queen', 'king', 'bunk', 'sofa'];
    const results = [];

    for (const bedType of bedTypes) {
      try {
        // Obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) continue;

        // Obtener el perfil del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (!profile) continue;

        // Crear un listing de prueba
        const { data: listingData, error: listingError } = await supabase
          .from('property_listings')
          .insert({
            title: `Prueba ${bedType}`,
            description: 'Descripción de prueba',
            address: 'Calle de Prueba 123',
            city: 'Madrid',
            postal_code: '28001',
            price: 500,
            listing_type: 'room_rental',
            profile_id: profile.id,
            available_from: new Date().toISOString().split('T')[0],
            images: []
          })
          .select()
          .single();

        if (listingError) {
          results.push(`❌ ${bedType}: Error en listing`);
          continue;
        }

        // Probar el tipo de cama
        const { error: requirementsError } = await supabase
          .from('room_rental_requirements')
          .insert({
            listing_id: listingData.id,
            bed_type: bedType,
            room_area: 15,
            private_bathroom: true,
            has_balcony: false,
            preferred_gender: 'no_preference',
            preferred_age_min: 55,
            preferred_age_max: 75,
            smoking_allowed: false,
            pets_allowed: false,
            pet_types: [],
            other_requirements: 'Ninguno'
          });

        if (requirementsError) {
          results.push(`❌ ${bedType}: ${requirementsError.message}`);
        } else {
          results.push(`✅ ${bedType}: Válido`);
        }

      } catch (error) {
        results.push(`❌ ${bedType}: Error general`);
      }
    }

    setTestResult(results.join('\n'));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🏠 Prueba de Formulario de Habitaciones
          </h1>

          <div className="space-y-6">
            {/* Botón de prueba de inserción */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Probar Inserción de Habitación
              </h2>
              <button
                onClick={testRoomInsert}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Probando...' : 'Probar Inserción'}
              </button>
            </div>

            {/* Botón de prueba de tipos de cama */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Probar Tipos de Cama Válidos
              </h2>
              <button
                onClick={testValidBedTypes}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Probando...' : 'Probar Tipos de Cama'}
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

export default RoomFormTest;
