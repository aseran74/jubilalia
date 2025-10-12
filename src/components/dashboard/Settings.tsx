import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

interface SettingsData {
  is_public: boolean;
  share_contact_info: boolean;
  has_room_to_share: boolean;
  wants_to_find_roommate: boolean;
}

const Settings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({
    is_public: true,
    share_contact_info: false,
    has_room_to_share: false,
    wants_to_find_roommate: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar configuración actual
  useEffect(() => {
    if (profile) {
      setSettings({
        is_public: (profile as any).is_public ?? true,
        share_contact_info: (profile as any).share_contact_info ?? false,
        has_room_to_share: (profile as any).has_room_to_share ?? false,
        wants_to_find_roommate: (profile as any).wants_to_find_roommate ?? false
      });
    }
  }, [profile]);

  const handleSettingChange = (key: keyof SettingsData, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!user || !profile) {
      setError('Usuario no autenticado o perfil no cargado.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_public: settings.is_public,
          share_contact_info: settings.share_contact_info,
          has_room_to_share: settings.has_room_to_share,
          wants_to_find_roommate: settings.wants_to_find_roommate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Refrescar el perfil para obtener los datos actualizados
      await refreshProfile();
      
      setSuccessMessage('Configuración guardada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Cog6ToothIcon className="w-8 h-8 mr-3 text-blue-500" />
          Configuración
        </h1>
        <p className="text-gray-600 mt-2">Gestiona tu privacidad y preferencias de cuenta</p>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Configuración de Privacidad */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <ShieldCheckIcon className="w-6 h-6 mr-3 text-green-500" />
          Privacidad
        </h2>

        <div className="space-y-8">
          {/* Perfil Público/Privado */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {settings.is_public ? (
                  <EyeIcon className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500 mr-2" />
                )}
                <h3 className="text-lg font-medium text-gray-900">Mi perfil es público</h3>
              </div>
              <p className="text-sm text-gray-600">
                {settings.is_public 
                  ? 'Otros usuarios pueden ver tu perfil, encontrar tu información y contactarte'
                  : 'Tu perfil es privado y solo tú puedes verlo. Otros usuarios no podrán encontrarte en búsquedas'
                }
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_public}
                onChange={(e) => handleSettingChange('is_public', e.target.checked)}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Compartir Datos de Contacto */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <PhoneIcon className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Compartir mis datos de contacto</h3>
              </div>
              <p className="text-sm text-gray-600">
                {settings.share_contact_info 
                  ? 'Otros usuarios pueden ver tu teléfono y email cuando tu perfil es público'
                  : 'Tu información de contacto (teléfono y email) permanece privada'
                }
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.share_contact_info}
                onChange={(e) => handleSettingChange('share_contact_info', e.target.checked)}
                className="sr-only peer"
                disabled={loading || !settings.is_public}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 ${!settings.is_public ? 'opacity-50' : ''}`}></div>
            </label>
          </div>

          {/* Compañero de Habitación - Opción 1 */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <HomeIcon className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Vivo solo y me gustaría compartir mi vivienda</h3>
              </div>
              <p className="text-sm text-gray-600">
                {settings.has_room_to_share 
                  ? 'Tienes una habitación disponible y quieres encontrar un compañero/a para compartir gastos y experiencias'
                  : 'No tienes una habitación disponible para compartir actualmente'
                }
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.has_room_to_share}
                onChange={(e) => handleSettingChange('has_room_to_share', e.target.checked)}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Compañero de Habitación - Opción 2 */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <UserPlusIcon className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Me gustaría ir a vivir con un compañero/a</h3>
              </div>
              <p className="text-sm text-gray-600">
                {settings.wants_to_find_roommate 
                  ? 'Buscas compartir gastos y vivir experiencias con alguien que tenga una habitación disponible'
                  : 'No estás buscando activamente un compañero de habitación'
                }
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.wants_to_find_roommate}
                onChange={(e) => handleSettingChange('wants_to_find_roommate', e.target.checked)}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <EnvelopeIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Información importante</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Si tu perfil es privado, otros usuarios no podrán encontrarte en búsquedas ni ver tu información</li>
                  <li>• Los datos de contacto solo se comparten si activas esta opción Y tu perfil es público</li>
                  <li>• Puedes cambiar estas configuraciones en cualquier momento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            'Guardar Configuración'
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
