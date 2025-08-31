import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { supabase, syncFirebaseSessionWithSupabase } from '../lib/supabase';

// Tipos para el perfil
interface UserProfile {
  id?: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string;
  occupation?: string | null;
  bio?: string | null;
  city?: string | null;
  country: string;
  interests: string[];
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  profile: UserProfile | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  syncProfileWithSupabase: (firebaseUser?: FirebaseUser) => Promise<UserProfile | null>;
  createLocalProfile: (firebaseUser: FirebaseUser) => UserProfile;
  ensureProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Crear perfil local basado en datos de Firebase
  const createLocalProfile = (firebaseUser: FirebaseUser): UserProfile => {
    return {
      id: `temp_${firebaseUser.uid}`, // ID temporal para formularios locales
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      full_name: firebaseUser.displayName || 'Usuario Jubilalia',
      avatar_url: firebaseUser.photoURL,
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
  };

  // Sincronizar perfil con Supabase
  const syncProfileWithSupabase = async (firebaseUser?: FirebaseUser) => {
    const targetUser = firebaseUser || user;
    console.log('🔍 syncProfileWithSupabase - targetUser:', targetUser);
    console.log('🔍 syncProfileWithSupabase - user state:', user);
    console.log('🔍 syncProfileWithSupabase - firebaseUser param:', firebaseUser);
    
    if (!targetUser) {
      console.log('❌ No hay usuario de Firebase para sincronizar');
      return null;
    }

    try {
      console.log('🔄 Intentando sincronizar perfil con Supabase...');
      
      // Primero sincronizar la sesión de Firebase con Supabase
      const supabaseSession = await syncFirebaseSessionWithSupabase(targetUser);
      if (supabaseSession) {
        console.log('✅ Sesión de Supabase sincronizada:', supabaseSession);
      }
      
      // Intentar obtener el perfil existente
      let { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', targetUser.uid)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error buscando perfil:', fetchError);
        throw fetchError;
      }

      if (!existingProfile) {
        console.log('📝 Perfil no encontrado en Supabase, creando uno nuevo...');
        
        // Crear nuevo perfil
        const newProfile = createLocalProfile(targetUser);
        delete newProfile.id; // Remover el ID temporal para la inserción
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creando perfil en Supabase:', createError);
          throw createError;
        }

        console.log('✅ Perfil creado exitosamente en Supabase:', createdProfile);
        setProfile(createdProfile);
        return createdProfile;
      } else {
        console.log('✅ Perfil encontrado en Supabase:', existingProfile);
        setProfile(existingProfile);
        return existingProfile;
      }
    } catch (error) {
      console.error('❌ Error sincronizando con Supabase:', error);
      
      // Si falla la sincronización, usar el perfil local
      const localProfile = createLocalProfile(targetUser);
      setProfile(localProfile);
      console.log('📱 Usando perfil local como fallback:', localProfile);
      return localProfile;
    }
  };

  // Actualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      // Actualizar localmente primero
      const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updatedProfile);

      // Intentar sincronizar con Supabase
      if (profile.id) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', profile.id);

        if (error) {
          console.error('❌ Error actualizando perfil en Supabase:', error);
          // El perfil local ya está actualizado, así que no es crítico
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
    }
  };

  // Función para crear/actualizar perfil en Supabase
  const upsertUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      console.log('🔄 Iniciando sincronización del perfil...');
      const result = await syncProfileWithSupabase(firebaseUser);
      
      if (result && result.id) {
        console.log('✅ Perfil sincronizado exitosamente:', result);
        return result;
      } else {
        console.log('⚠️ syncProfileWithSupabase devolvió resultado inválido:', result);
        // Intentar crear un perfil local como fallback
        const localProfile = createLocalProfile(firebaseUser);
        setProfile(localProfile);
        console.log('📱 Usando perfil local como fallback:', localProfile);
        return localProfile;
      }
    } catch (error) {
      console.error('❌ Error en upsertUserProfile:', error);
      // Usar perfil local como fallback
      const localProfile = createLocalProfile(firebaseUser);
      setProfile(localProfile);
      console.log('📱 Usando perfil local como fallback:', localProfile);
      return localProfile;
    }
  };

  // Función de registro
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crear perfil local y sincronizar
      await upsertUserProfile(result.user);
    } catch (error) {
      console.error('Error en signUp:', error);
      throw error;
    }
  };

  // Función de inicio de sesión
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await upsertUserProfile(result.user);
    } catch (error) {
      console.error('Error en signIn:', error);
      throw error;
    }
  };

  // Función de inicio de sesión con Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await upsertUserProfile(result.user);
    } catch (error) {
      console.error('Error en signInWithGoogle:', error);
      throw error;
    }
  };

  // Función de inicio de sesión con Facebook
  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await upsertUserProfile(result.user);
    } catch (error) {
      console.error('Error en signInWithFacebook:', error);
      throw error;
    }
  };

  // Función de cierre de sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      throw error;
    }
  };

  // Efecto para manejar cambios de estado de autenticación
  useEffect(() => {
    console.log('🔄 Configurando listener de autenticación...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Cambio de estado de autenticación detectado:', firebaseUser ? `Usuario: ${firebaseUser.uid}` : 'No hay usuario');
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        console.log('🔐 Usuario autenticado:', firebaseUser.uid);
        console.log('📧 Email del usuario:', firebaseUser.email);
        console.log('🕐 Último login:', firebaseUser.metadata.lastSignInTime);
        
        try {
          // Primero sincronizar con Supabase Auth
          console.log('🔄 Sincronizando sesión de Firebase con Supabase...');
          const supabaseSession = await syncFirebaseSessionWithSupabase(firebaseUser);
          
          if (supabaseSession) {
            console.log('✅ Sesión de Supabase sincronizada exitosamente');
          } else {
            console.log('⚠️ No se pudo sincronizar con Supabase, continuando con perfil local');
          }
          
          // Luego crear/actualizar el perfil
          const profile = await upsertUserProfile(firebaseUser);
          if (profile) {
            console.log('✅ Perfil establecido exitosamente:', profile);
          } else {
            throw new Error('No se pudo establecer el perfil');
          }
        } catch (error) {
          console.error('❌ Error creando/sincronizando perfil:', error);
          // Usar perfil local como fallback
          const localProfile = createLocalProfile(firebaseUser);
          setProfile(localProfile);
          console.log('📱 Usando perfil local como fallback final:', localProfile);
        }
      } else {
        console.log('🚪 Usuario no autenticado, limpiando perfil');
        setProfile(null);
      }
      
      setLoading(false);
    });

    // Verificar estado inicial
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('🔍 Usuario actual encontrado en auth.currentUser:', currentUser.uid);
    } else {
      console.log('🔍 No hay usuario actual en auth.currentUser');
    }

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    profile,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    updateProfile,
    syncProfileWithSupabase,
    createLocalProfile
  };

  // Función para forzar la creación del perfil si es necesario
  const ensureProfile = async () => {
    if (!user) {
      console.log('❌ No hay usuario de Firebase para crear perfil');
      return null;
    }

    // Si ya tenemos un perfil válido (no temporal), usarlo
    if (profile && profile.id && !profile.id.startsWith('temp_')) {
      console.log('✅ Perfil ya existe y es válido:', profile);
      return profile;
    }

    console.log('🔄 Forzando creación/actualización del perfil...');
    try {
      // Intentar sincronizar directamente con Supabase
      const result = await syncProfileWithSupabase(user);
      if (result && result.id && !result.id.startsWith('temp_')) {
        console.log('✅ Perfil sincronizado exitosamente:', result);
        setProfile(result);
        return result;
      } else if (result && result.id && result.id.startsWith('temp_')) {
        console.log('⚠️ Perfil temporal obtenido, intentando sincronizar...');
        // Si tenemos un perfil temporal, intentar sincronizarlo
        const newProfile = await upsertUserProfile(user);
        if (newProfile && newProfile.id && !newProfile.id.startsWith('temp_')) {
          console.log('✅ Perfil temporal sincronizado exitosamente:', newProfile);
          return newProfile;
        }
      }
      
      console.log('⚠️ No se pudo obtener un perfil válido, usando perfil local');
      // Crear perfil local como último recurso
      const localProfile = createLocalProfile(user);
      setProfile(localProfile);
      console.log('📱 Usando perfil local como último recurso:', localProfile);
      return localProfile;
    } catch (error) {
      console.error('❌ Error asegurando perfil:', error);
      // Crear perfil local como último recurso
      const localProfile = createLocalProfile(user);
      setProfile(localProfile);
      console.log('📱 Usando perfil local como último recurso:', localProfile);
      return localProfile;
    }
  };

  // Agregar ensureProfile al contexto
  const contextValue = {
    ...value,
    ensureProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
