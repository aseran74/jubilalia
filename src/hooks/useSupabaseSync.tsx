import { useState } from 'react';
import { useAuth } from './useAuth';
import { syncFirebaseSessionWithSupabase } from '../lib/supabase';

export const useSupabaseSync = () => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const forceSync = async () => {
    if (!user) {
      console.log('❌ No hay usuario de Firebase para sincronizar');
      return false;
    }

    setSyncing(true);
    try {
      console.log('🔄 Forzando sincronización de Firebase con Supabase...');
      const result = await syncFirebaseSessionWithSupabase(user);
      
      if (result) {
        setLastSync(new Date());
        console.log('✅ Sincronización forzada exitosa');
        return true;
      } else {
        console.log('❌ Sincronización forzada falló');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en sincronización forzada:', error);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  return {
    forceSync,
    syncing,
    lastSync,
    canSync: !!user
  };
};
