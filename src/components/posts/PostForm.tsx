import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getUserProfile } from '../../lib/supabase';
import { auth } from '../../lib/firebase';
import { 
  Save, 
  Eye, 
  X, 
  Tag, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface PostCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  category_id: string;
  tags: string[];
  featured_image_url: string;
  is_published: boolean;
  is_featured: boolean;
}

const PostForm: React.FC = () => {
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    tags: [],
    featured_image_url: '',
    is_published: false,
    is_featured: false
  });

  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('post_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es obligatorio';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Debes seleccionar una categoría';
    }

    if (formData.title.length > 255) {
      newErrors.title = 'El título no puede exceder 255 caracteres';
    }

    if (formData.excerpt && formData.excerpt.length > 500) {
      newErrors.excerpt = 'El extracto no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Obtener el usuario actual de Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setErrors({ general: 'No se pudo obtener el usuario actual. Por favor, inicia sesión nuevamente.' });
        return;
      }

      // Obtener el profile_id usando la función helper
      const profile = await getUserProfile(currentUser.uid);
      if (!profile) {
        setErrors({ general: 'No se pudo obtener el perfil del usuario. Por favor, completa tu perfil primero.' });
        return;
      }

      // Crear el post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          profile_id: profile.id,
          category_id: formData.category_id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim() || null,
          featured_image_url: formData.featured_image_url || null,
          is_published: formData.is_published,
          is_featured: formData.is_featured,
          tags: formData.tags,
          published_at: formData.is_published ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (postError) throw postError;

      // Redirigir al post creado
      navigate(`/dashboard/posts/${post.id}`);
      
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ general: 'Error al crear el post. Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      setErrors({ general: 'Para guardar un borrador, debes tener al menos título o contenido' });
      return;
    }

    try {
      setSaving(true);

      // Obtener el usuario actual de Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setErrors({ general: 'No se pudo obtener el usuario actual. Por favor, inicia sesión nuevamente.' });
        return;
      }

      const profile = await getUserProfile(currentUser.uid);
      if (!profile) {
        setErrors({ general: 'No se pudo obtener el perfil del usuario. Por favor, completa tu perfil primero.' });
        return;
      }

      // Crear el post como borrador
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          profile_id: profile.id,
          category_id: formData.category_id || categories[0]?.id,
          title: formData.title.trim() || 'Borrador sin título',
          content: formData.content.trim() || '',
          excerpt: formData.excerpt.trim() || null,
          featured_image_url: formData.featured_image_url || null,
          is_published: false,
          is_featured: false,
          tags: formData.tags,
          published_at: null
        })
        .select()
        .single();

      if (postError) throw postError;

      // Redirigir al post creado
      navigate(`/dashboard/posts/${post.id}`);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({ general: 'Error al guardar el borrador. Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Crear Nuevo Post</h1>
          <p className="text-gray-600 mt-2">Comparte tus ideas y experiencias con la comunidad</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm sm:text-base ${
              previewMode 
                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            <span className="hidden sm:inline">{previewMode ? 'Editar' : 'Vista Previa'}</span>
            <span className="sm:hidden">{previewMode ? 'Editar' : 'Previa'}</span>
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Errores generales */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-700 text-sm sm:text-base">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título del Post *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Escribe un título atractivo para tu post..."
            maxLength={255}
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {formData.title.length}/255 caracteres
          </p>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.category_id ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>
          )}
        </div>

        {/* Extracto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Extracto (opcional)
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            rows={3}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Un breve resumen de tu post..."
            maxLength={500}
          />
          <p className="text-gray-500 text-sm mt-1">
            {formData.excerpt.length}/500 caracteres
          </p>
        </div>

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido del Post *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={12}
            className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
              errors.content ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Escribe tu post aquí... Puedes usar Markdown para formatear el texto."
          />
          {errors.content && (
            <p className="text-red-600 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Agregar etiqueta..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Agregar
            </button>
          </div>
          
          {/* Etiquetas agregadas */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Imagen destacada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen Destacada (URL)
          </label>
          <input
            type="url"
            value={formData.featured_image_url}
            onChange={(e) => handleInputChange('featured_image_url', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        {/* Opciones de publicación */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Opciones de Publicación</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => handleInputChange('is_published', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_published" className="ml-3 text-sm font-medium text-gray-700">
                Publicar inmediatamente
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_featured" className="ml-3 text-sm font-medium text-gray-700">
                Marcar como destacado
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
            ) : (
              <Save className="w-4 h-4 mr-2 inline" />
            )}
            Guardar Borrador
          </button>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/posts')}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2 inline" />
              )}
              {formData.is_published ? 'Publicar Post' : 'Guardar Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
