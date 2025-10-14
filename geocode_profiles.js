/**
 * Script para geocodificar todas las direcciones de perfiles existentes
 * y guardar las coordenadas (latitude, longitude) en la base de datos
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = 'https://sdmkodriokrpsdegweat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbWtvZHJpb2tycHNkZWd3ZWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0OTUzOTcsImV4cCI6MjA0MDA3MTM5N30.Qs5VPxPHHHPCxCMz7BjLjDTJQfQvLp7x2kzQzQHQzQI'; // Necesitarás la clave real

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para hacer delay entre requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para geocodificar una dirección usando Google Maps API
async function geocodeAddress(address) {
  const apiKey = 'TU_API_KEY_DE_GOOGLE'; // Necesitarás tu API key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results[0]) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        success: true
      };
    } else {
      console.log(`❌ Geocoding falló: ${data.status}`);
      return { success: false };
    }
  } catch (error) {
    console.error('Error en geocoding:', error);
    return { success: false };
  }
}

async function updateProfileCoordinates() {
  console.log('🚀 Iniciando geocodificación de perfiles...\n');
  
  // 1. Obtener perfiles sin coordenadas
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, address, city, state, postal_code, country')
    .is('latitude', null)
    .not('city', 'is', null)
    .limit(234);

  if (error) {
    console.error('❌ Error obteniendo perfiles:', error);
    return;
  }

  console.log(`📊 Total de perfiles a geocodificar: ${profiles.length}\n`);

  let successCount = 0;
  let failCount = 0;

  // 2. Geocodificar cada perfil
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    
    // Construir dirección completa
    let fullAddress = '';
    if (profile.address) fullAddress += profile.address;
    if (profile.city) fullAddress += (fullAddress ? ', ' : '') + profile.city;
    if (profile.state) fullAddress += (fullAddress ? ', ' : '') + profile.state;
    if (profile.postal_code) fullAddress += (fullAddress ? ' ' : '') + profile.postal_code;
    if (profile.country) fullAddress += (fullAddress ? ', ' : '') + profile.country;

    console.log(`[${i + 1}/${profiles.length}] Geocodificando: ${profile.full_name}`);
    console.log(`   Dirección: ${fullAddress}`);

    // Intentar geocodificar
    const result = await geocodeAddress(fullAddress);

    if (result.success) {
      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          latitude: result.latitude,
          longitude: result.longitude
        })
        .eq('id', profile.id);

      if (updateError) {
        console.log(`   ❌ Error actualizando: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`   ✅ Coordenadas guardadas: ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`);
        successCount++;
      }
    } else {
      console.log(`   ⚠️ No se pudo geocodificar`);
      failCount++;
    }

    // Delay para no exceder límites de API (10 requests por segundo)
    await delay(150);
    
    console.log('');
  }

  // 3. Resumen
  console.log('\n📊 RESUMEN:');
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Fallidos: ${failCount}`);
  console.log(`📍 Total procesados: ${successCount + failCount}`);
}

// Ejecutar
updateProfileCoordinates()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });


