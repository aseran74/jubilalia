import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { SUPABASE_BUCKETS } from '../../config/supabase';
import ImageUpload from '../dashboard/ImageUpload';

interface PostFormData {
  title: string;
  content: string;
  category_id: string;
  images: string[];
  tags: string[];
}

const PostForm: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    category_id: '',
    images: [],
    tags: []
  });

  // Cargar categorías al montar el componente
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // Cargar post existente si estamos editando
  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          setFormData({
            title: data.title,
            content: data.content,
            category_id: data.category_id,
            images: data.images || [],
            tags: data.tags || []
          });
        } catch (error) {
          console.error('Error fetching post:', error);
          setError('Error al cargar el post');
        }
      };

      fetchPost();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };



  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Debes estar autenticado para crear un post');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.category_id) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    // Verificar que el usuario tenga un perfil
    if (!profile) {
      setError('Error: No se pudo obtener tu perfil. Por favor, recarga la página e inténtalo de nuevo.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category_id: formData.category_id,
        profile_id: profile.id,
        images: formData.images,
        tags: formData.tags,
        is_published: true
      };

      let result;
      if (id) {
        // Actualizar post existente
        const { data, error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Crear nuevo post
        const { data, error } = await supabase
          .from('posts')
          .insert([postData])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      navigate(`/dashboard/posts/${result.id}`);
    } catch (error: any) {
      console.error('Error saving post:', error);
      setError(error.message || 'Error al guardar el post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso requerido
          </h2>
          <p className="text-gray-600 mb-4">
            Debes iniciar sesión para crear o editar posts
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? 'Editar Post' : 'Crear Nuevo Post'}
            </h1>
            <p className="text-gray-600 mt-2">
              {id ? 'Modifica tu post existente' : 'Comparte tus pensamientos con la comunidad'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Escribe un título atractivo para tu post"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contenido */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Escribe el contenido de tu post..."
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (separados por comas)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="viajes, jubilación, salud, hobbies..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Los tags ayudan a otros usuarios a encontrar tu contenido
              </p>
            </div>

            {/* Subida de imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes
              </label>
              <ImageUpload
                onImagesUploaded={(imageUrls) => {
                  // Agregar todas las imágenes subidas
                  setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...imageUrls]
                  }));
                }}
                maxImages={10}
                bucketName={SUPABASE_BUCKETS.POST_IMAGES}
                className="mb-4"
              />
              
              {/* Mostrar imágenes subidas */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/posts')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : (id ? 'Actualizar Post' : 'Publicar Post')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
