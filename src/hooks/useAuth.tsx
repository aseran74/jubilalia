import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  supabase, 
  getUserProfile, 
  createUserProfile, 
  upsertUserProfile,
  signInWithGoogle,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
  UserProfile
} from '../lib/supabase';

// Tipos para el contexto de autenticación
interface AuthContextType {
  user: any | null;
  loading: boolean;
  profile: UserProfile | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createLocalProfile: (userData: any) => UserProfile;
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para crear un perfil local
  const createLocalProfile = (userData: any): UserProfile => {
    return {
      id: userData.id,
      email: userData.email || '',
      full_name: userData.user_metadata?.full_name || userData.user_metadata?.name || null,
      avatar_url: userData.user_metadata?.avatar_url || null,
      bio: null,
      phone: null,
      date_of_birth: null,
      gender: null,
      address: null,
      city: null,
      state: null,
      postal_code: null,
      country: null,
      occupation: null,
      interests: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  // Función para iniciar sesión con Google
  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabaseSignOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar el perfil del usuario
  const refreshProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // Si no existe el perfil, crearlo
        const newProfile = createLocalProfile(user);
        const createdProfile = await createUserProfile(newProfile);
        if (createdProfile) {
          setProfile(createdProfile);
        }
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Efecto para manejar el estado de autenticación
  useEffect(() => {
    let mounted = true;

    // Obtener el usuario actual al montar el componente
    const getInitialUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            await refreshProfile();
          }
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialUser();

    // Suscribirse a los cambios de autenticación
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await refreshProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Efecto para refrescar el perfil cuando cambia el usuario
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    profile,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    refreshProfile,
    createLocalProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
