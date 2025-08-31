import { supabase } from '../lib/supabase';
import { mockRooms } from '../data/mockRooms';

// Usuario de prueba para las habitaciones
const mockUser = {
  firebase_uid: 'mock-user-jubilalia',
  email: 'mock@jubilalia.com',
  full_name: 'Usuario de Prueba Jubilalia',
  avatar_url: null,
  phone: '+34 600 000 000',
  date_of_birth: '1950-01-01',
  gender: 'other',
  occupation: 'Jubilado',
  bio: 'Usuario de prueba para mostrar habitaciones de ejemplo',
  city: 'Madrid',
  country: 'España',
  interests: ['Compañía', 'Ahorro', 'Vida social'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export async function insertMockData() {
  try {
    console.log('🚀 Iniciando inserción de datos de prueba...');

    // 1. Crear usuario de prueba
    console.log('📝 Creando usuario de prueba...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(mockUser, { onConflict: 'firebase_uid' })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      return;
    }

    console.log('✅ Usuario de prueba creado:', profile.id);

    // 2. Insertar habitaciones
    console.log('🏠 Insertando habitaciones de prueba...');
    
    for (let i = 0; i < mockRooms.length; i++) {
      const room = mockRooms[i];
      
      try {
        // Insertar listing principal
        const { data: listing, error: listingError } = await supabase
          .from('property_listings')
          .insert({
            listing_type: room.listing.listing_type,
            title: room.listing.title,
            description: room.listing.description,
            property_type: room.listing.property_type,
            address: room.listing.address,
            city: room.listing.city,
            postal_code: room.listing.postal_code,
            country: room.listing.country,
            price: room.listing.price,
            price_type: room.listing.price_type,
            currency: room.listing.currency,
            available_from: room.listing.available_from,
            user_id: mockUser.firebase_uid,
            profile_id: profile.id,
            status: 'active'
          })
          .select()
          .single();

        if (listingError) {
          console.error(`❌ Error insertando listing ${i + 1}:`, listingError);
          continue;
        }

        console.log(`✅ Listing ${i + 1} creado:`, listing.id);

        // Insertar requisitos de habitación
        if (room.roomRequirements) {
          const { error: requirementsError } = await supabase
            .from('room_rental_requirements')
            .insert({
              listing_id: listing.id,
              bed_type: room.roomRequirements.bed_type,
              room_area: room.roomRequirements.room_area,
              private_bathroom: room.roomRequirements.private_bathroom,
              has_balcony: room.roomRequirements.has_balcony,
              preferred_gender: room.roomRequirements.preferred_gender,
              preferred_age_min: room.roomRequirements.preferred_age_min,
              preferred_age_max: room.roomRequirements.preferred_age_max,
              smoking_allowed: room.roomRequirements.smoking_allowed,
              pets_allowed: room.roomRequirements.pets_allowed,
              pet_types: room.roomRequirements.pet_types,
              other_requirements: room.roomRequirements.other_requirements
            });

          if (requirementsError) {
            console.error(`❌ Error insertando requisitos ${i + 1}:`, requirementsError);
          } else {
            console.log(`✅ Requisitos ${i + 1} insertados`);
          }
        }

        // Insertar amenidades
        if (room.amenities && room.amenities.length > 0) {
          const amenityRecords = room.amenities.map(amenity => ({
            listing_id: listing.id,
            amenity_name: amenity
          }));

          const { error: amenitiesError } = await supabase
            .from('property_amenities')
            .insert(amenityRecords);

          if (amenitiesError) {
            console.error(`❌ Error insertando amenidades ${i + 1}:`, amenitiesError);
          } else {
            console.log(`✅ Amenidades ${i + 1} insertadas`);
          }
        }

        // Crear imágenes de placeholder
        const placeholderImages = [
          {
            listing_id: listing.id,
            image_url: `https://picsum.photos/800/600?random=${i + 1}`,
            image_name: `placeholder-${i + 1}.jpg`,
            display_order: 0
          },
          {
            listing_id: listing.id,
            image_url: `https://picsum.photos/800/600?random=${i + 100}`,
            image_name: `placeholder-${i + 1}-2.jpg`,
            display_order: 1
          }
        ];

        const { error: imagesError } = await supabase
          .from('property_images')
          .insert(placeholderImages);

        if (imagesError) {
          console.error(`❌ Error insertando imágenes ${i + 1}:`, imagesError);
        } else {
          console.log(`✅ Imágenes ${i + 1} insertadas`);
        }

      } catch (error) {
        console.error(`❌ Error general en habitación ${i + 1}:`, error);
      }
    }

    console.log('🎉 ¡Datos de prueba insertados correctamente!');
    console.log(`📊 Total de habitaciones creadas: ${mockRooms.length}`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Función para limpiar datos de prueba
export async function clearMockData() {
  try {
    console.log('🧹 Limpiando datos de prueba...');

    // Eliminar en orden para evitar problemas de foreign key
    await supabase.from('property_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('property_amenities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('room_rental_requirements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('property_listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().eq('firebase_uid', 'mock-user-jubilalia');

    console.log('✅ Datos de prueba eliminados');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  // Solo en Node.js
  insertMockData().then(() => {
    console.log('Script completado');
    process.exit(0);
  }).catch((error) => {
    console.error('Error en script:', error);
    process.exit(1);
  });
}
