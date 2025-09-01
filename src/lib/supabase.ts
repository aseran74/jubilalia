import { createClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';
import { UserProfile } from '../types/supabase';

// Configuración de Supabase
const supabaseUrl = environment.supabase.url;
const supabaseAnonKey = environment.supabase.anonKey;

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Función para obtener el perfil del usuario actual
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    // Si no se proporciona userId, usar el usuario autenticado actual
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      userId = user.id;
    }

    // Buscar por auth_user_id (nuevo campo para Supabase Auth)
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    // Si no se encuentra por auth_user_id, intentar por firebase_uid (compatibilidad)
    if (error || !data) {
      const { data: dataByFirebase, error: errorByFirebase } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', userId)
        .single();

      data = dataByFirebase;
      error = errorByFirebase;
    }

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// Función para crear un perfil de usuario
export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};

// Función para crear o actualizar un perfil de usuario
export const upsertUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertUserProfile:', error);
    return null;
  }
};

// Función para actualizar un perfil de usuario
export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in signInWithGoogle:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
