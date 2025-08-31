import { createClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';

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

// Tipos para el perfil de usuario
export interface UserProfile {
  id: string;
  firebase_uid?: string; // Mantenemos esto temporalmente para la migración
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  occupation: string | null;
  interests: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

// Función para obtener el perfil del usuario actual
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    // Si no se proporciona userId, usar el usuario autenticado actual
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

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

// Función para obtener la configuración del usuario
export const getUserSettings = async (profileId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserSettings:', error);
    return null;
  }
};

// Función para crear o actualizar la configuración del usuario
export const upsertUserSettings = async (settings: any) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settings, { onConflict: 'profile_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertUserSettings:', error);
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
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Función para manejar la sesión de autenticación
export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};

export default supabase;
