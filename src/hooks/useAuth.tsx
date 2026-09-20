import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { startGoogleOAuth } from '../lib/googleAuth';
import { UserProfile } from '../types/supabase';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean; // Nueva propiedad para verificar si es administrador
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
  
  // Calcular si el usuario es administrador
  const isAdmin = profile?.is_admin === true;

  const refreshProfile = async (userToRefresh = user) => {
    if (!userToRefresh) {
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (loading) {
      return;
    }

    try {
      
      // Buscar perfil por auth_user_id con timeout
      // Usar maybeSingle() para evitar errores cuando hay múltiples perfiles
      // y seleccionar el más reciente
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userToRefresh.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La consulta tardó demasiado')), 5000)
      );
      
      const { data: profileData, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (profileData && !error) {
        setProfile(profileData);
      } else {
        const newProfile = createLocalProfile(userToRefresh);
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createdProfile && !createError) {
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
    // Si el email es admin@test.com, crear el perfil como administrador
    const isAdminEmail = userData.email === 'admin@test.com';
    
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
      is_admin: isAdminEmail // Establecer como admin si es el email de admin
      // Nota: location_public y search_radius_km no existen en la tabla actual
    };
  };

  const ensureProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    
    if (profile) return profile;
    
    await refreshProfile();
    return profile;
  };

  const signInWithGoogle = async () => {
    await startGoogleOAuth();
  };

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      console.log('✅ Logout exitoso');
      // Redirigir a la página principal
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Error signing out:', error);
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
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await refreshProfile(session.user);
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
    if (user && !profile && !loading) {
      refreshProfile(user);
    }
  }, [user, profile, loading]); // Agregado loading para evitar llamadas simultáneas

  const value = {
    user,
    profile,
    loading,
    isAdmin,
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
