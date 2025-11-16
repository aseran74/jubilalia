import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Activity,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ImageUpload from '../dashboard/ImageUpload';
import { SUPABASE_BUCKETS } from '../../config/supabase';

interface ActivityFormData {
  title: string;
  description: string;
  activity_type: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  city: string;
  address: string;
  max_participants: string;
  price: string;
  is_free: boolean;
  contact_phone: string;
  contact_email: string;
  website: string;
  age_min: string;
  age_max: string;
  difficulty_level: string;
  tags: string[];
  images: string[];
  // Campos de recurrencia
  is_recurring: boolean;
  recurrence_type: 'weekly' | 'daily' | 'monthly';
  recurrence_days: number[]; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  recurrence_start_date: string;
  recurrence_end_date: string;
  // Portada
  show_on_landing?: boolean;
}

const ActivityForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ensureProfile, profile, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id); // Loading si estamos editando
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const isEditMode = !!id;
  const [canEdit, setCanEdit] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    activity_type: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    city: '',
    address: '',
    max_participants: '',
    price: '0',
    is_free: true,
    contact_phone: '',
    contact_email: '',
    website: '',
    age_min: '0',
    age_max: '120',
    difficulty_level: 'Principiante',
    tags: [],
    images: [],
    // Campos de recurrencia
    is_recurring: false,
    recurrence_type: 'weekly',
    recurrence_days: [],
    recurrence_start_date: '',
    recurrence_end_date: '',
    // Portada
    show_on_landing: false
  });

  const activityTypes = [
    'Deportes',
    'Cultura',
    'Música',
    'Arte',
    'Gastronomía',
    'Naturaleza',
    'Viajes',
    'Tecnología',
    'Educación',
    'Social',
    'Voluntariado',
    'Fitness',
    'Yoga',
    'Baile',
    'Fotografía',
    'Jardinería',
    'Manualidades',
    'Juegos',
    'Lectura',
    'Meditación',
    'Senderismo',
    'Ciclismo',
    'Natación',
    'Pintura',
    'Escritura',
    'Teatro',
    'Cine',
    'Museos',
    'Conciertos',
    'Festivales',
    'Talleres',
    'Seminarios',
    'Grupos de conversación',
    'Clubes de lectura',
    'Excursiones',
    'Paseos culturales'
  ];

  const difficultyLevels = [
    'Principiante',
    'Intermedio',
    'Avanzado',
    'Todos los niveles'
  ];

  const cities = [
    'Madrid',
    'Barcelona',
    'Valencia',
    'Sevilla',
    'Zaragoza',
    'Málaga',
    'Murcia',
    'Palma',
    'Las Palmas',
    'Bilbao',
    'Alicante',
    'Córdoba',
    'Valladolid',
    'Vigo',
    'Gijón',
    'Oviedo',
    'Granada',
    'A Coruña',
    'Vitoria',
    'San Sebastián'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImagesUploaded = (imageUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: imageUrls
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Función para generar actividades recurrentes
  const generateRecurringActivities = async (
    parentActivityId: string,
    activityData: any,
    formData: ActivityFormData
  ) => {
    if (!formData.recurrence_start_date || !formData.recurrence_days.length) {
      return;
    }

    const startDate = new Date(formData.recurrence_start_date);
    const endDate = formData.recurrence_end_date 
      ? new Date(formData.recurrence_end_date)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 año por defecto

    const instances: any[] = [];
    const currentDate = new Date(startDate);

    // Generar instancias hasta la fecha de fin
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0=Domingo, 6=Sábado
      
      // Si el día de la semana está en los días seleccionados
      if (formData.recurrence_days.includes(dayOfWeek)) {
        const instanceDate = currentDate.toISOString().split('T')[0];
        
        instances.push({
          ...activityData,
          parent_activity_id: parentActivityId,
          is_recurring: false, // Las instancias no son recurrentes
          date: instanceDate,
          recurrence_type: null,
          recurrence_days: null,
          recurrence_start_date: null,
          recurrence_end_date: null
        });
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Limitar a 100 instancias para evitar sobrecarga
      if (instances.length >= 100) break;
    }

    // Insertar todas las instancias de una vez
    if (instances.length > 0) {
      const { error } = await supabase
        .from('activities')
        .insert(instances);

      if (error) {
        console.error('Error generando actividades recurrentes:', error);
        throw error;
      }

      console.log(`✅ Generadas ${instances.length} instancias de actividad recurrente`);
    }
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.activity_type) newErrors.activity_type = 'Selecciona el tipo de actividad';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria';
    if (!formData.time) newErrors.time = 'La hora es obligatoria';
    if (!formData.duration) newErrors.duration = 'La duración es obligatoria';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es obligatoria';
    if (!formData.city) newErrors.city = 'Selecciona la ciudad';
    if (!formData.max_participants) newErrors.max_participants = 'El número máximo de participantes es obligatorio';
    if (!formData.is_free && !formData.price) newErrors.price = 'El precio es obligatorio para actividades de pago';
    if (!formData.contact_phone && !formData.contact_email) {
      newErrors.contact_phone = 'Debes proporcionar al menos un método de contacto';
    }
    if (parseInt(formData.age_min) > parseInt(formData.age_max)) {
      newErrors.age_max = 'La edad máxima debe ser mayor que la edad mínima';
    }
    
    // Validación de recurrencia
    if (formData.is_recurring) {
      if (!formData.recurrence_start_date) {
        newErrors.recurrence_start_date = 'La fecha de inicio es obligatoria para actividades recurrentes';
      }
      if (formData.recurrence_type === 'weekly' && formData.recurrence_days.length === 0) {
        newErrors.recurrence_days = 'Debes seleccionar al menos un día de la semana';
      }
      if (formData.recurrence_end_date && formData.recurrence_end_date < formData.recurrence_start_date) {
        newErrors.recurrence_end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    // Solo validar imágenes si estamos creando una nueva actividad
    if (!isEditMode && formData.images.length === 0) {
      newErrors.images = 'Debes subir al menos una imagen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cargar datos de la actividad si estamos en modo edición
  useEffect(() => {
    const loadActivityData = async () => {
      // Si no hay ID, no estamos editando
      if (!id) {
        setLoadingData(false);
        return;
      }

      // Si ya cargamos los datos, no hacerlo de nuevo
      if (hasLoadedData) {
        return;
      }

      try {
        setLoadingData(true);
        setHasLoadedData(true);
        
        console.log('🔄 Cargando actividad para editar:', id);
        
        // Obtener la actividad (no necesitamos esperar el perfil para cargar los datos)
        const { data: activity, error: activityError } = await supabase
          .from('activities')
          .select('*')
          .eq('id', id)
          .single();

        if (activityError) {
          console.error('❌ Error cargando actividad:', activityError);
          throw activityError;
        }

        console.log('✅ Actividad cargada:', activity);

        // Obtener imágenes
        const { data: imagesData, error: imagesError } = await supabase
          .from('activity_images')
          .select('image_url')
          .eq('activity_id', id)
          .order('image_order');

        if (imagesError) console.error('Error loading images:', imagesError);

        console.log('🖼️ Imágenes cargadas:', imagesData?.length || 0);

        // Cargar datos en el formulario
        setFormData({
          title: activity.title || '',
          description: activity.description || '',
          activity_type: activity.activity_type || '',
          date: activity.date || '',
          time: activity.time || '',
          duration: activity.duration?.toString() || '',
          location: activity.location || '',
          city: activity.city || '',
          address: activity.address || '',
          max_participants: activity.max_participants?.toString() || '',
          price: activity.price?.toString() || '0',
          is_free: activity.is_free ?? true,
          contact_phone: activity.contact_phone || '',
          contact_email: activity.contact_email || '',
          website: activity.website || '',
          age_min: activity.age_min?.toString() || '0',
          age_max: activity.age_max?.toString() || '120',
          difficulty_level: activity.difficulty_level || 'Principiante',
          tags: activity.tags || [],
          images: imagesData?.map(img => img.image_url) || [],
          // Campos de recurrencia
          is_recurring: (activity as any).is_recurring || false,
          recurrence_type: (activity as any).recurrence_type || 'weekly',
          recurrence_days: (activity as any).recurrence_days || [],
          recurrence_start_date: (activity as any).recurrence_start_date || '',
          recurrence_end_date: (activity as any).recurrence_end_date || '',
          // Portada
          show_on_landing: (activity as any).show_on_landing || false
        });

        console.log('✅ Datos cargados en el formulario');

      } catch (error) {
        console.error('❌ Error loading activity:', error);
        setErrors({ general: 'Error al cargar la actividad' });
        setLoadingData(false);
        setHasLoadedData(false); // Permitir reintentar
      } finally {
        setLoadingData(false);
      }
    };

    loadActivityData();
  }, [id, hasLoadedData]);

  // Verificar permisos cuando el perfil esté disponible y los datos ya estén cargados
  useEffect(() => {
    if (!isEditMode || !id || !hasLoadedData) return;

    const checkPermissions = async () => {
      // Si no hay perfil aún, esperar
      if (!profile?.id) {
        console.log('⏳ Esperando perfil para verificar permisos...');
        return;
      }

      try {
        const { data: activity } = await supabase
          .from('activities')
          .select('profile_id')
          .eq('id', id)
          .single();

        if (!activity) {
          console.error('❌ No se encontró la actividad para verificar permisos');
          return;
        }

        const isOwner = activity.profile_id === profile.id;
        const canEditActivity = isAdmin || isOwner;

        console.log('🔍 Verificación de permisos:', { 
          profileId: profile.id, 
          activityProfileId: activity.profile_id,
          isOwner, 
          isAdmin, 
          canEditActivity 
        });

        if (!canEditActivity) {
          setErrors({ general: 'No tienes permisos para editar esta actividad' });
          setTimeout(() => navigate('/dashboard/activities'), 2000);
          setCanEdit(false);
          return;
        }

        setCanEdit(true);
      } catch (error) {
        console.error('❌ Error checking permissions:', error);
      }
    };

    checkPermissions();
  }, [id, profile?.id, isAdmin, isEditMode, hasLoadedData, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Asegurar que tenemos un perfil válido
      const currentProfile = await ensureProfile();
      if (!currentProfile?.id) {
        setErrors({ general: 'No se pudo obtener el perfil del usuario. Por favor, inicia sesión de nuevo.' });
        setLoading(false);
        return;
      }

      console.log('✅ Usando perfil:', currentProfile);

      let activityId = id;

      if (isEditMode && id) {
        // Verificar permisos antes de actualizar
        if (currentProfile?.id) {
          // Obtener la actividad para verificar permisos
          const { data: activity } = await supabase
            .from('activities')
            .select('profile_id')
            .eq('id', id)
            .single();

          if (activity) {
            const isOwner = activity.profile_id === currentProfile.id;
            const canEditActivity = isAdmin || isOwner;

            if (!canEditActivity) {
              setErrors({ general: 'No tienes permisos para editar esta actividad' });
              setLoading(false);
              return;
            }
          }
        }

        // Modo edición: actualizar actividad existente
        const updateData: any = {
          title: formData.title,
          description: formData.description,
          activity_type: formData.activity_type,
          date: formData.date,
          time: formData.time,
          duration: parseInt(formData.duration),
          location: formData.location,
          city: formData.city,
          address: formData.address,
          max_participants: parseInt(formData.max_participants),
          price: formData.is_free ? 0 : parseFloat(formData.price),
          is_free: formData.is_free,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          website: formData.website,
          age_min: parseInt(formData.age_min),
          age_max: parseInt(formData.age_max),
          difficulty_level: formData.difficulty_level,
          tags: formData.tags,
          updated_at: new Date().toISOString()
        };
        // Añadir portada si existe la columna
        (updateData as any).show_on_landing = formData.show_on_landing === true;

        const { error: updateError } = await supabase
          .from('activities')
          .update(updateData)
          .eq('id', id);

        if (updateError) throw updateError;

        // Manejar imágenes: eliminar las antiguas y agregar las nuevas
        if (formData.images.length > 0) {
          // Eliminar imágenes antiguas
          const { error: deleteImagesError } = await supabase
            .from('activity_images')
            .delete()
            .eq('activity_id', id);

          if (deleteImagesError) console.error('Error deleting old images:', deleteImagesError);
        }

      } else {
        // Modo creación: crear nueva actividad
        const activityData: any = {
          profile_id: currentProfile.id,
          title: formData.title,
          description: formData.description,
          activity_type: formData.activity_type,
          date: formData.date,
          time: formData.time,
          duration: parseInt(formData.duration),
          location: formData.location,
          city: formData.city,
          address: formData.address,
          max_participants: parseInt(formData.max_participants),
          price: formData.is_free ? 0 : parseFloat(formData.price),
          is_free: formData.is_free,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          website: formData.website,
          age_min: parseInt(formData.age_min),
          age_max: parseInt(formData.age_max),
          difficulty_level: formData.difficulty_level,
          tags: formData.tags,
          // Portada
          show_on_landing: formData.show_on_landing === true,
          // Campos de recurrencia
          is_recurring: formData.is_recurring,
          recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
          recurrence_days: formData.is_recurring && formData.recurrence_type === 'weekly' ? formData.recurrence_days : null,
          recurrence_start_date: formData.is_recurring ? formData.recurrence_start_date : null,
          recurrence_end_date: formData.is_recurring && formData.recurrence_end_date ? formData.recurrence_end_date : null
        };

        const { data: activity, error: activityError } = await supabase
          .from('activities')
          .insert([activityData])
          .select()
          .single();

        if (activityError) throw activityError;
        activityId = activity.id;

        // Si es recurrente, generar las instancias
        if (formData.is_recurring && formData.recurrence_type === 'weekly' && formData.recurrence_days.length > 0) {
          await generateRecurringActivities(activity.id, activityData, formData);
        }
      }

      // 2. Crear/actualizar las imágenes (solo si hay imágenes nuevas)
      if (formData.images.length > 0 && activityId) {
        const imagesData = formData.images.map((imageUrl, index) => ({
          activity_id: activityId,
          image_url: imageUrl,
          image_order: index + 1,
          is_primary: index === 0
        }));

        const { error: imagesError } = await supabase
          .from('activity_images')
          .insert(imagesData);

        if (imagesError) throw imagesError;

        // Si es recurrente, también agregar imágenes a las instancias generadas
        if (formData.is_recurring && formData.recurrence_type === 'weekly' && formData.recurrence_days.length > 0) {
          // Obtener todas las instancias generadas
          const { data: instances } = await supabase
            .from('activities')
            .select('id')
            .eq('parent_activity_id', activityId);

          if (instances && instances.length > 0) {
            // Crear imágenes para todas las instancias
            const allImagesData = instances.flatMap(instance =>
              formData.images.map((imageUrl, index) => ({
                activity_id: instance.id,
                image_url: imageUrl,
                image_order: index + 1,
                is_primary: index === 0
              }))
            );

            if (allImagesData.length > 0) {
              const { error: instancesImagesError } = await supabase
                .from('activity_images')
                .insert(allImagesData);

              if (instancesImagesError) {
                console.error('Error agregando imágenes a instancias:', instancesImagesError);
              }
            }
          }
        }
      }

      setSuccessMessage(isEditMode 
        ? '¡Actividad actualizada exitosamente! Redirigiendo...' 
        : '¡Actividad creada exitosamente! Redirigiendo...');
      
      setTimeout(() => {
        navigate('/dashboard/activities');
      }, 2000);

    } catch (error) {
      console.error('Error saving activity:', error);
      setErrors({ general: `Error al ${isEditMode ? 'actualizar' : 'crear'} la actividad: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se carga la autenticación o los datos
  if (authLoading || (isEditMode && loadingData)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Cargando sesión...' : 'Cargando actividad...'}
          </p>
        </div>
      </div>
    );
  }

  // Si no puede editar Y hay un error de permisos explícito, mostrar mensaje
  // Pero si no hay perfil aún, permitir ver el formulario (se verificará en submit)
  if (isEditMode && !canEdit && !loadingData && profile?.id && errors.general?.includes('permisos')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sin permisos</h2>
          <p className="text-gray-600 mb-6">No tienes permisos para editar esta actividad.</p>
          <button
            onClick={() => navigate('/dashboard/activities')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver a actividades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {isEditMode ? 'Editar Actividad' : 'Crear Nueva Actividad'}
                </h1>
                <p className="text-blue-100">
                  {isEditMode 
                    ? 'Actualiza la información de tu actividad' 
                    : 'Comparte tu pasión y conecta con otros jubilados'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Información básica */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                1. Información básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la actividad *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: Clase de yoga para principiantes"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de actividad *
                  </label>
                  <select
                    name="activity_type"
                    value={formData.activity_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selecciona el tipo</option>
                    {activityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.activity_type && <p className="text-red-500 text-sm mt-1">{errors.activity_type}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Describe tu actividad, qué aprenderán los participantes, qué necesitan traer..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                2. Fecha y hora
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (minutos) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="15"
                    max="480"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="60"
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>
              </div>

              {/* Opciones de recurrencia */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        is_recurring: e.target.checked,
                        recurrence_start_date: e.target.checked ? formData.date : '',
                        recurrence_end_date: ''
                      });
                    }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Actividad recurrente (ej: todos los viernes)
                  </label>
                </div>

                {formData.is_recurring && (
                  <div className="space-y-4 mt-4 pl-2 border-l-2 border-blue-300">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de recurrencia
                      </label>
                      <select
                        name="recurrence_type"
                        value={formData.recurrence_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="weekly">Semanal</option>
                        <option value="daily">Diaria</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>

                    {formData.recurrence_type === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Días de la semana *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 0, label: 'Dom' },
                            { value: 1, label: 'Lun' },
                            { value: 2, label: 'Mar' },
                            { value: 3, label: 'Mié' },
                            { value: 4, label: 'Jue' },
                            { value: 5, label: 'Vie' },
                            { value: 6, label: 'Sáb' }
                          ].map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                const newDays = formData.recurrence_days.includes(day.value)
                                  ? formData.recurrence_days.filter(d => d !== day.value)
                                  : [...formData.recurrence_days, day.value];
                                setFormData({ ...formData, recurrence_days: newDays });
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.recurrence_days.includes(day.value)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                        {errors.recurrence_days && (
                          <p className="text-red-500 text-sm mt-1">{errors.recurrence_days}</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de inicio *
                        </label>
                        <input
                          type="date"
                          name="recurrence_start_date"
                          value={formData.recurrence_start_date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.recurrence_start_date && (
                          <p className="text-red-500 text-sm mt-1">{errors.recurrence_start_date}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de fin (opcional)
                        </label>
                        <input
                          type="date"
                          name="recurrence_end_date"
                          value={formData.recurrence_end_date}
                          onChange={handleInputChange}
                          min={formData.recurrence_start_date || new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Sin fecha de fin"
                        />
                        {errors.recurrence_end_date && (
                          <p className="text-red-500 text-sm mt-1">{errors.recurrence_end_date}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Dejar vacío para actividad sin fin
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                3. Ubicación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selecciona la ciudad</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación específica *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: Centro cultural, Parque, Gimnasio..."
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección completa
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Calle y número"
                  />
                </div>
              </div>
            </div>

            {/* Participantes y precio */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                4. Participantes y precio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de participantes *
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="10"
                  />
                  {errors.max_participants && <p className="text-red-500 text-sm mt-1">{errors.max_participants}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="is_free"
                        checked={formData.is_free}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Actividad gratuita</span>
                    </label>
                    
                    {!formData.is_free && (
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="15.00"
                      />
                    )}
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
              </div>
            </div>

            {/* Detalles adicionales */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                5. Detalles adicionales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad mínima
                  </label>
                  <input
                    type="number"
                    name="age_min"
                    value={formData.age_min}
                    onChange={handleInputChange}
                    min="0"
                    max="120"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="18"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad máxima
                  </label>
                  <input
                    type="number"
                    name="age_max"
                    value={formData.age_max}
                    onChange={handleInputChange}
                    min="0"
                    max="120"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="80"
                  />
                  {errors.age_max && <p className="text-red-500 text-sm mt-1">{errors.age_max}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de dificultad
                  </label>
                  <select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {difficultyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Mostrar en portada */}
              <div className="pt-2">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="show_on_landing"
                    checked={!!formData.show_on_landing}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mostrar esta actividad en la portada</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Aparecerá en la landing (máximo 4 destacadas).</p>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                6. Información de contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://www.tusitio.com"
                  />
                </div>
              </div>
              {errors.contact_phone && <p className="text-red-500 text-sm">{errors.contact_phone}</p>}
            </div>

            {/* Etiquetas */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                7. Etiquetas
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar etiqueta..."
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Imágenes */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                8. Imágenes de la actividad
              </h3>
              
              <ImageUpload 
                onImagesUploaded={handleImagesUploaded}
                maxImages={10}
                bucketName={SUPABASE_BUCKETS.ACTIVITY_PHOTOS}
                className="mb-4"
              />
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mensajes de estado */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {isEditMode ? 'Actualizando actividad...' : 'Creando actividad...'}
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    {isEditMode ? 'Actualizar Actividad' : 'Crear Actividad'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityForm;
