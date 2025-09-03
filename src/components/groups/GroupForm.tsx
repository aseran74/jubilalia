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
  UsersIcon
} from '@heroicons/react/24/outline';

interface GroupFormData {
  name: string;
  description: string;
  image_url: string;
  is_public: boolean;
  max_members: number;
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
    max_members: 50
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
            max_members: data.max_members || 50
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
      
      // Subir imagen al bucket de grupos
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `group-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images') // Usamos el bucket post-images por ahora
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

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
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .insert({
          name: formData.name.trim(),
          description: formData.description.trim(),
          image_url: formData.image_url || null,
          is_public: formData.is_public,
          max_members: formData.max_members,
          created_by: profile.id,
          current_members: 1
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Agregar al creador como miembro del grupo
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          profile_id: profile.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/groups');
      }, 2000);

    } catch (error) {
      console.error('Error creating group:', error);
      setError('Error al crear el grupo. Inténtalo de nuevo.');
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
