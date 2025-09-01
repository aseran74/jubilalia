import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/supabase';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  ensureProfile: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithFacebook: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      console.log('refreshProfile - No hay usuario, saliendo...');
      return;
    }

    try {
      console.log('refreshProfile - Usuario:', user.id);
      
      // Buscar perfil por auth_user_id
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      console.log('refreshProfile - Perfil encontrado:', profileData, 'Error:', error);

      if (profileData && !error) {
        console.log('refreshProfile - Estableciendo perfil existente:', profileData);
        setProfile(profileData);
      } else {
        console.log('refreshProfile - Creando nuevo perfil...');
        // Si no existe el perfil, crearlo automáticamente
        const newProfile = createLocalProfile(user);
        console.log('refreshProfile - Nuevo perfil a crear:', newProfile);
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        console.log('refreshProfile - Perfil creado:', createdProfile, 'Error:', createError);
        
        if (createdProfile && !createError) {
          console.log('refreshProfile - Estableciendo perfil creado:', createdProfile);
          setProfile(createdProfile);
        } else {
          console.error('refreshProfile - Error al crear perfil:', createError);
        }
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const createLocalProfile = (userData: any): Partial<UserProfile> => {
    return {
      auth_user_id: userData.id, // En Supabase, user.id es el identificador único
      email: userData.email || '',
      full_name: userData.user_metadata?.full_name || userData.user_metadata?.name || 'Usuario',
      avatar_url: userData.user_metadata?.avatar_url || null,
      // Campos básicos con valores por defecto
      phone: null,
      date_of_birth: null,
      gender: null,
      address: null,
      city: null,
      state: null,
      postal_code: null,
      country: null,
      occupation: null,
      interests: [],
      // Campos de ubicación con valores por defecto
      location_public: false,
      search_radius_km: 50
    };
  };

  const ensureProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    
    if (profile) return profile;
    
    await refreshProfile();
    return profile;
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Alias para logout
  const logout = signOut;

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('getInitialSession - Sesión:', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('getInitialSession - Usuario encontrado, llamando a refreshProfile...');
        await refreshProfile();
      }
      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('onAuthStateChange - Evento:', event, 'Sesión:', session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('onAuthStateChange - Usuario encontrado, llamando a refreshProfile...');
          await refreshProfile();
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Efecto adicional para refrescar el perfil cuando cambie el usuario
  useEffect(() => {
    if (user && !profile) {
      console.log('useEffect [user] - Usuario cambiado, refrescando perfil...');
      refreshProfile();
    }
  }, [user, profile]);

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    signInWithGoogle,
    ensureProfile,
    logout,
    signUp,
    signIn,
    signInWithFacebook,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
