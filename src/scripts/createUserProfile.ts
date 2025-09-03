import { supabase } from '../lib/supabase';

// Función para crear un perfil de usuario
export async function createUserProfile(firebaseUid: string, email: string, fullName: string) {
  try {
    console.log('🔍 Verificando si el perfil ya existe...');
    
    // Primero verificar si ya existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error verificando perfil:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingProfile) {
      console.log('✅ Perfil ya existe:', existingProfile);
      return { success: true, data: existingProfile, message: 'Perfil ya existía' };
    }

    console.log('📝 Creando nuevo perfil...');
    
    // Crear nuevo perfil
    const newProfile = {
      firebase_uid: firebaseUid,
      email: email,
      full_name: fullName,
      avatar_url: null,
      phone: null,
      date_of_birth: null,
      gender: 'other',
      occupation: null,
      bio: null,
      city: null,
      country: 'España',
      interests: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creando perfil:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Perfil creado exitosamente:', profile);
    return { success: true, data: profile, message: 'Perfil creado exitosamente' };

  } catch (error) {
    console.error('❌ Error general:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

// Función para obtener el perfil del usuario
export async function getUserProfile(firebaseUid: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) {
      console.error('❌ Error obteniendo perfil:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Perfil encontrado:', profile);
    return { success: true, data: profile };

  } catch (error) {
    console.error('❌ Error general:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

// Función para listar todos los perfiles (para debugging)
export async function listAllProfiles() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error listando perfiles:', error);
      return { success: false, error: error.message };
    }

    console.log('📋 Perfiles encontrados:', profiles);
    return { success: true, data: profiles };

  } catch (error) {
    console.error('❌ Error general:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  // Solo en Node.js
  console.log('🚀 Script de creación de perfil iniciado...');
  
  // Aquí debes reemplazar con tus datos reales
  const testFirebaseUid = 'TU_FIREBASE_UID_AQUI';
  const testEmail = 'tu@email.com';
  const testFullName = 'Tu Nombre Completo';
  
  if (testFirebaseUid === 'TU_FIREBASE_UID_AQUI') {
    console.log('⚠️  Por favor, edita el script con tus datos reales antes de ejecutarlo');
    process.exit(1);
  }
  
  createUserProfile(testFirebaseUid, testEmail, testFullName).then((result) => {
    console.log('Resultado:', result);
    process.exit(result.success ? 0 : 1);
  }).catch((error) => {
    console.error('Error en script:', error);
    process.exit(1);
  });
}
