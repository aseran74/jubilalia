import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

import { 
  ArrowLeftIcon,
  UserGroupIcon,
  PhotoIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UsersIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import LocationSelector from '../common/LocationSelector';

interface GroupFormData {
  name: string;
  description: string;
  image_url: string;
  is_public: boolean;
  max_members: number;
  category: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  postal_code: string;
  country: string;
  telegram_group_name: string;
  // Portada
  show_on_landing?: boolean;
}

const GroupForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    image_url: '',
    is_public: true,
    max_members: 50,
    category: '',
    city: '',
    address: '',
    latitude: null,
    longitude: null,
    postal_code: '',
    country: 'España',
    telegram_group_name: '',
    show_on_landing: false
  });

  const isEditing = !!id;

  // Cargar datos del grupo si se está editando
  useEffect(() => {
    if (isEditing && id) {
      const fetchGroup = async () => {
        try {
          const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          setFormData({
            name: data.name || '',
            description: data.description || '',
            image_url: data.image_url || '',
            is_public: data.is_public ?? true,
            max_members: data.max_members || 50,
            category: data.category || '',
            city: data.city || '',
            address: data.address || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            postal_code: data.postal_code || '',
            country: data.country || 'España',
            telegram_group_name: data.telegram_group_name || '',
            show_on_landing: data.show_on_landing || false
          });
        } catch (error) {
          console.error('Error loading group:', error);
          setError('Error al cargar el grupo');
        } finally {
          setLoadingData(false);
        }
      };

      fetchGroup();
    }
  }, [id, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleLocationSelect = (location: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      city: location.city,
      postal_code: location.postal_code,
      country: location.country,
      latitude: location.coordinates?.lat || null,
      longitude: location.coordinates?.lng || null
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      console.log('🔧 Iniciando subida de imagen:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        user: user?.id,
        profile: profile?.id
      });

      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Subir imagen al bucket de grupos
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `group-images/${fileName}`;

      console.log('🔧 Subiendo archivo:', { filePath, bucket: 'group-images' });

      const { error: uploadError } = await supabase.storage
        .from('group-images') // Usar bucket específico para grupos
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Error de subida:', uploadError);
        throw uploadError;
      }

      console.log('✅ Imagen subida exitosamente');

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('group-images')
        .getPublicUrl(filePath);

      console.log('🔗 URL pública generada:', publicUrl);

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError('Debes estar autenticado para crear un grupo');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre del grupo es obligatorio');
      return;
    }

    if (!formData.description.trim()) {
      setError('La descripción del grupo es obligatoria');
      return;
    }

    if (!formData.category) {
      setError('La categoría del grupo es obligatoria');
      return;
    }

    if (!formData.city.trim()) {
      setError('La ciudad del grupo es obligatoria');
      return;
    }

    console.log('🔧 Creando grupo con datos:', {
      user: user.id,
      profile: profile.id,
      profileExists: !!profile,
      formData
    });

    // Verificar que el perfil existe y tiene un ID válido
    if (!profile || !profile.id) {
      setError('Error: Perfil de usuario no encontrado. Por favor, inicia sesión nuevamente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && id) {
        // Actualizar el grupo existente
        const { error: updateError } = await supabase
          .from('groups')
          .update({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            is_public: formData.is_public,
            max_members: formData.max_members,
            category: formData.category,
            city: formData.city,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            postal_code: formData.postal_code,
            country: formData.country,
            show_on_landing: formData.show_on_landing === true,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (updateError) throw updateError;

        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/groups');
        }, 2000);
      } else {
        // Crear el grupo
        console.log('🔧 Insertando grupo en la base de datos...');
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim(),
            image_url: formData.image_url || null,
            is_public: formData.is_public,
            max_members: formData.max_members,
            category: formData.category,
            city: formData.city.trim(),
            address: formData.address || null,
            latitude: formData.latitude,
            longitude: formData.longitude,
            postal_code: formData.postal_code || null,
            country: formData.country,
            show_on_landing: formData.show_on_landing === true,
            created_by: profile.id
          })
          .select()
          .single();

        if (groupError) {
          console.error('❌ Error al crear grupo:', groupError);
          throw groupError;
        }

        console.log('✅ Grupo creado exitosamente:', groupData);

        // Agregar al creador como miembro del grupo
        console.log('🔧 Agregando creador como miembro del grupo...');
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupData.id,
            profile_id: profile.id,
            role: 'admin'
          });

        if (memberError) {
          console.error('❌ Error al agregar miembro:', memberError);
          throw memberError;
        }

        console.log('✅ Miembro agregado exitosamente');

        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/groups');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating/updating group:', error);
      setError(isEditing ? 'Error al actualizar el grupo. Inténtalo de nuevo.' : 'Error al crear el grupo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserGroupIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso restringido</h3>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para crear un grupo</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard/groups')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a Grupos
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
            </h1>
            <p className="text-gray-600">
              {isEditing 
                ? 'Modifica la información del grupo' 
                : 'Crea un grupo para conectar con personas que compartan tus intereses'
              }
            </p>
          </div>

          {loadingData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">Cargando datos del grupo...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                {isEditing ? '¡Grupo actualizado exitosamente!' : '¡Grupo creado exitosamente!'} Redirigiendo...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información básica */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Grupo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Amigos del Golf de Madrid"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe el propósito del grupo, qué actividades realizan, quién puede unirse..."
                  />
                </div>
              </div>
            </div>

            {/* Configuración del grupo */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                Configuración del Grupo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      name="is_public"
                      checked={formData.is_public}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Grupo público</span>
                  </label>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {formData.is_public ? (
                      <>
                        <GlobeAltIcon className="w-4 h-4 text-green-500" />
                        <span>Cualquier persona puede ver y solicitar unirse al grupo</span>
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4 text-orange-500" />
                        <span>Solo los miembros pueden ver el contenido del grupo</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número máximo de miembros
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="max_members"
                      value={formData.max_members}
                      onChange={handleNumberChange}
                      min="2"
                      max="1000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="50"
                    />
                    <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo: 2, Máximo: 1000
                  </p>
                </div>
                
                {/* Mostrar en portada */}
                <div className="md:col-span-2">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="show_on_landing"
                      checked={!!formData.show_on_landing}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Mostrar este grupo en la portada</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Aparecerá en la landing (máximo 4 destacados).</p>
                </div>
              </div>
            </div>

            {/* Categoría y Localización */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                Categoría y Localización
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="Retiros">Retiros</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Hobbies">Hobbies</option>
                    <option value="Comida">Comida</option>
                    <option value="Cartas">Cartas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Madrid, Barcelona, Valencia..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <LocationSelector
                    onLocationSelect={handleLocationSelect}
                    placeholder="Buscar dirección específica (opcional)"
                    label="Dirección"
                  />
                  {formData.address && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Dirección seleccionada:</strong> {formData.address}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {formData.city}, {formData.postal_code}, {formData.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Imagen del grupo */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2" />
                Imagen del Grupo
              </h2>
              <div className="space-y-4">
                {formData.image_url ? (
                  <div className="flex items-center space-x-4">
                    <img
                      src={formData.image_url}
                      alt="Imagen del grupo"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Agrega una imagen para identificar tu grupo
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="group-image-upload"
                    />
                    <label
                      htmlFor="group-image-upload"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
                    >
                      Seleccionar imagen
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Telegram */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Grupo de Telegram (Opcional)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del grupo de Telegram
                  </label>
                  <input
                    type="text"
                    name="telegram_group_name"
                    value={formData.telegram_group_name}
                    onChange={handleInputChange}
                    placeholder="nombre_del_grupo (sin @)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Si tienes un grupo de Telegram para este grupo, introduce solo el nombre (ej: jubilados_san_juan)
                  </p>
                </div>
                
                {formData.telegram_group_name && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Enlace generado:</strong>{' '}
                      <a 
                        href={`https://t.me/${formData.telegram_group_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        https://t.me/{formData.telegram_group_name}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/groups')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Grupo'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupForm;
