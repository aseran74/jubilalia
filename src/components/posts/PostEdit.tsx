import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Eye, 
  X, 
  Tag, 
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft
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

const PostEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (id) {
      checkCurrentUser();
      fetchCategories();
      fetchPost();
    }
  }, [id]);

  const checkCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error checking current user:', error);
    }
  };

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

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          category:post_categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Verificar que el usuario actual sea el autor del post
      if (currentUser && data.profile_id !== currentUser.uid) {
        navigate('/dashboard/posts');
        return;
      }

      setFormData({
        title: data.title || '',
        content: data.content || '',
        excerpt: data.excerpt || '',
        category_id: data.category_id || '',
        tags: data.tags || [],
        featured_image_url: data.featured_image_url || '',
        is_published: data.is_published || false,
        is_featured: data.is_featured || false
      });

    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/dashboard/posts');
    } finally {
      setLoading(false);
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

      // Actualizar el post
      const { error: postError } = await supabase
        .from('posts')
        .update({
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim() || null,
          category_id: formData.category_id,
          featured_image_url: formData.featured_image_url || null,
          is_published: formData.is_published,
          is_featured: formData.is_featured,
          tags: formData.tags,
          published_at: formData.is_published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (postError) throw postError;

      // Redirigir al post actualizado
      navigate(`/dashboard/posts/${id}`);
      
    } catch (error) {
      console.error('Error updating post:', error);
      setErrors({ general: 'Error al actualizar el post. Inténtalo de nuevo.' });
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/dashboard/posts/${id}`)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Post
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Post</h1>
            <p className="text-gray-600 mt-2">Modifica tu post y actualiza la información</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              previewMode 
                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            {previewMode ? 'Editar' : 'Vista Previa'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Errores generales */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{errors.general}</span>
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            rows={15}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
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
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Agregar etiqueta..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3 mr-1" />
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/posts/${id}`)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2 inline" />
            )}
            {formData.is_published ? 'Actualizar y Publicar' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEdit;

