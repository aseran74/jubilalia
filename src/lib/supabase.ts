import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import { environment } from '../config/environment'

export const supabase = createClient<Database>(
  environment.supabase.url,
  environment.supabase.anonKey
)

// Función para sincronizar la sesión de Firebase con Supabase
export const syncFirebaseSessionWithSupabase = async (firebaseUser: any) => {
  if (!firebaseUser) {
    console.log('❌ No hay usuario de Firebase para sincronizar')
    return null
  }

  console.log('🔄 Verificando usuario en Supabase...', {
    uid: firebaseUser.uid,
    email: firebaseUser.email
  })

  try {
    // Verificar si el usuario existe en la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, firebase_uid, email')
      .eq('firebase_uid', firebaseUser.uid)
      .single()

    if (profileError) {
      console.log('⚠️ Usuario no encontrado en profiles:', profileError.message)
      return null
    }

    if (profile) {
      console.log('✅ Usuario verificado en Supabase:', profile)
      
      // Para las consultas RLS, necesitamos establecer el contexto del usuario
      // Vamos a usar una función personalizada que simule la autenticación
      return { user: profile, session: null }
    }

    return null
  } catch (error) {
    console.error('❌ Error inesperado verificando usuario en Supabase:', error)
    return null
  }
}

// Función para obtener el perfil del usuario por Firebase UID
export const getUserProfile = async (firebaseUid: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('firebase_uid', firebaseUid)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data
}

// Función para crear o actualizar el perfil del usuario
export const upsertUserProfile = async (profile: Database['public']['Tables']['profiles']['Insert']) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'firebase_uid' })
    .select()
    .single()
  
  if (error) {
    console.error('Error upserting user profile:', error)
    return null
  }
  
  return data
}

// Función para obtener la configuración del usuario
export const getUserSettings = async (profileId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('profile_id', profileId)
    .single()
  
  if (error) {
    console.error('Error fetching user settings:', error)
    return null
  }
  
  return data
}

// Función para crear o actualizar la configuración del usuario
export const upsertUserSettings = async (settings: Database['public']['Tables']['user_settings']['Insert']) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(settings, { onConflict: 'profile_id' })
    .select()
    .single()
  
  if (error) {
    console.error('Error upserting user settings:', error)
    return null
  }
  
  return data
}
