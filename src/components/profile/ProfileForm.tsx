import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../dashboard/ImageUpload';
import LocationSelector from '../people/LocationSelector';
import {
  UserIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface ProfileFormData {
  full_name: string;
  email: string;
  avatar_url: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  occupation: string;
  interests: string[];
  latitude?: number;
  longitude?: number;
}

const ProfileForm: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    avatar_url: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'España',
    occupation: '',
    interests: []
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profilePhotos, setProfilePhotos] = useState<Array<{ id: string; image_url: string; image_order: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('ProfileForm - useEffect profile:', profile);
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'España',
        occupation: profile.occupation || '',
        interests: profile.interests || []
      });
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
      fetchProfilePhotos();
      console.log('ProfileForm - formData inicializado:', formData);
    }
  }, [profile]);

  const fetchProfilePhotos = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('profile_id', profile.id)
        .order('image_order', { ascending: true });

      if (error) throw error;
      setProfilePhotos(data || []);
    } catch (error) {
      console.error('Error fetching profile photos:', error);
    }
  };

  const handleProfilePhotosUpload = async (urls: string[]) => {
    if (!profile?.id || urls.length === 0) return;

    try {
      const currentCount = profilePhotos.length;
      const remainingSlots = 20 - currentCount;
      
      if (remainingSlots <= 0) {
        setError('Ya has alcanzado el máximo de 20 fotos. Elimina alguna antes de agregar más.');
        return;
      }

      const photosToAdd = urls.slice(0, remainingSlots);
      const photosData = photosToAdd.map((url, index) => ({
        profile_id: profile.id,
        image_url: url,
        image_order: currentCount + index + 1
      }));

      const { error } = await supabase
        .from('profile_photos')
        .insert(photosData);

      if (error) throw error;

      await fetchProfilePhotos();
      setSuccessMessage(`${photosToAdd.length} foto(s) agregada(s) exitosamente`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error uploading profile photos:', error);
      setError(error.message || 'Error al subir las fotos');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('profile_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      // Reordenar las fotos restantes
      const remainingPhotos = profilePhotos.filter(p => p.id !== photoId);
      for (let i = 0; i < remainingPhotos.length; i++) {
        await supabase
          .from('profile_photos')
          .update({ image_order: i + 1 })
          .eq('id', remainingPhotos[i].id);
      }

      await fetchProfilePhotos();
      setSuccessMessage('Foto eliminada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      setError(error.message || 'Error al eliminar la foto');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentInterests = prev.interests || [];
      if (checked) {
        return { ...prev, interests: [...currentInterests, value] };
      } else {
        return { ...prev, interests: currentInterests.filter(interest => interest !== value) };
      }
    });
  };

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
  };

  const handleLocationSelect = (location: any) => {
    console.log('ProfileForm - handleLocationSelect called with:', location);
    
    // Actualizar los campos de dirección con los datos de la ubicación seleccionada
    if (location.address_components && location.geometry) {
      const components = location.address_components;
      const getComponent = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || '';

      // Obtener coordenadas
      const lat = typeof location.geometry.location.lat === 'function' 
        ? location.geometry.location.lat() 
        : location.geometry.location.lat;
      const lng = typeof location.geometry.location.lng === 'function' 
        ? location.geometry.location.lng() 
        : location.geometry.location.lng;

      const newFormData = {
        ...formData,
        address: location.formatted_address || '',
        city: getComponent('locality') || getComponent('administrative_area_level_3') || getComponent('administrative_area_level_2') || '',
        state: getComponent('administrative_area_level_1') || '',
        postal_code: getComponent('postal_code') || '',
        country: getComponent('country') || 'España',
        latitude: lat,
        longitude: lng
      };

      console.log('ProfileForm - Actualizando formData con coordenadas:', {
        ...newFormData,
        lat,
        lng
      });
      setFormData(newFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError('Usuario no autenticado o perfil no cargado.');
      return;
    }
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile?.id, // Usar el ID del perfil existente, no user.id
          auth_user_id: user.id, // Agregar auth_user_id para nuevos perfiles
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          postal_code: formData.postal_code || null,
          country: formData.country,
          occupation: formData.occupation || null,
          interests: formData.interests,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSuccessMessage('Perfil actualizado exitosamente!');
      refreshProfile(); // Refresh the profile in context
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Error al actualizar el perfil.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Editar Perfil</h2>

      {successMessage && (
        <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 animate-fade-in">
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                <UserIcon className="w-16 h-16" />
              </div>
            )}
          </div>
          <ImageUpload
            bucketName="avatars"
            onImagesUploaded={(urls) => handleAvatarUpload(urls[0])}
            maxImages={1}
            className="w-full max-w-xs"
          />
        </div>

        {/* Ubicación con Google Places */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            placeholder="Buscar tu dirección..."
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Usa el selector de ubicación para autocompletar tu dirección
          </p>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu nombre completo"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                placeholder="tu@email.com"
                disabled
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: +34 612 345 678"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
            <div className="relative">
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth || ''}
                onChange={handleChange}
                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <div className="relative">
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
            <div className="relative">
              <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation || ''}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu ocupación actual"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 flex items-center">
          <GlobeAltIcon className="w-6 h-6 mr-3 text-blue-500" /> Información de Dirección
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <div className="relative">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Calle, número, piso"
              />
            </div>
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <div className="relative">
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu ciudad"
              />
            </div>
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Provincia/Estado</label>
            <div className="relative">
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu provincia o estado"
              />
            </div>
          </div>
          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
            <div className="relative">
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleChange}
                className="pl-3 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu código postal"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <div className="relative">
              <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu país"
              />
            </div>
          </div>
        </div>

        {/* Profile Photos */}
        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 flex items-center">
          <PhotoIcon className="w-6 h-6 mr-3 text-blue-500" /> Fotos del Perfil
        </h3>
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Puedes subir hasta 20 fotos para tu perfil. Estas fotos aparecerán en tu galería de perfil.
          </p>
          
          {/* Fotos existentes */}
          {profilePhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {profilePhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.image_url}
                    alt={`Foto ${photo.image_order}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subir nuevas fotos */}
          {profilePhotos.length < 20 && (
            <ImageUpload
              bucketName="avatars"
              onImagesUploaded={handleProfilePhotosUpload}
              maxImages={20}
              currentImageCount={profilePhotos.length}
              className="w-full"
            />
          )}

          {profilePhotos.length >= 20 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Has alcanzado el límite de 20 fotos. Elimina alguna foto para agregar nuevas.
              </p>
            </div>
          )}
        </div>

        {/* Interests */}
        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 flex items-center">
          <TagIcon className="w-6 h-6 mr-3 text-blue-500" /> Intereses
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {['Lectura', 'Viajes', 'Jardinería', 'Cocina', 'Deportes', 'Música', 'Arte', 'Voluntariado', 'Tecnología', 'Baile'].map(interest => (
            <div key={interest} className="flex items-center">
              <input
                type="checkbox"
                id={`interest-${interest}`}
                name="interests"
                value={interest}
                checked={formData.interests?.includes(interest) || false}
                onChange={handleInterestsChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`interest-${interest}`} className="ml-2 block text-sm text-gray-900">
                {interest}
              </label>
            </div>
          ))}
        </div>


        <div className="pt-6">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
