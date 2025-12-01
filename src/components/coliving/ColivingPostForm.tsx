import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

type PostType = 'rooms' | 'rental' | 'sale';

interface PostFormData {
  title: string;
  content: string;
  category_id: string;
  tags: string[];
}

const ColivingPostForm: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    category_id: '',
    tags: []
  });

  // Determinar el tipo desde la ruta actual
  const getTypeFromPath = (): PostType => {
    if (location.pathname.includes('/rooms/posts')) return 'rooms';
    if (location.pathname.includes('/properties/rental/posts')) return 'rental';
    if (location.pathname.includes('/properties/sale/posts')) return 'sale';
    return 'rooms'; // default
  };

  const type = getTypeFromPath();

  const postTypeConfig = {
    rooms: {
      title: 'Nueva Publicación de Habitación',
      description: 'Describe qué habitación buscas: zona, características, compañero/a ideal, presupuesto, etc.',
      backPath: '/dashboard/rooms/posts',
      categoryName: 'Busco habitación',
      placeholder: 'Ejemplo: Busco habitación en zona centro de Madrid, preferiblemente con balcón, para compartir con persona tranquila y respetuosa. Presupuesto máximo 400€/mes...'
    },
    rental: {
      title: 'Nueva Publicación de Alquiler',
      description: 'Describe qué alquiler buscas: zona, número de personas, características, presupuesto, etc.',
      backPath: '/dashboard/properties/rental/posts',
      categoryName: 'Coliving alquiler',
      placeholder: 'Ejemplo: Busco alquiler en zona residencial de Barcelona para 2 personas, mínimo 2 habitaciones, con jardín o terraza. Presupuesto máximo 1200€/mes...'
    },
    sale: {
      title: 'Nueva Publicación de Venta',
      description: 'Describe qué vivienda coliving buscas comprar: zona, características, número de habitaciones, presupuesto, etc.',
      backPath: '/dashboard/properties/sale/posts',
      categoryName: 'Coliving Venta',
      placeholder: 'Ejemplo: Busco vivienda coliving en zona tranquila de Valencia, mínimo 3 habitaciones, con espacios comunes amplios. Presupuesto máximo 250.000€...'
    }
  };

  const config = postTypeConfig[type || 'rooms'];

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchPost();
    }
  }, [id, type]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('post_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Buscar o crear la categoría correspondiente
      let category = data?.find(cat => cat.name === config.categoryName);
      
      if (!category) {
        // Crear la categoría si no existe
        const { data: newCategory, error: createError } = await supabase
          .from('post_categories')
          .insert({
            name: config.categoryName,
            color: '#10b981', // verde
            icon: 'home'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating category:', createError);
        } else {
          category = newCategory;
        }
      }
      
      setCategories(data || []);
      if (category && !id) {
        setFormData(prev => ({ ...prev, category_id: category.id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPost = async () => {
    if (!id) return;
    
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
        tags: data.tags || []
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Error al cargar la publicación');
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      setError('Debes estar autenticado para crear una publicación');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.category_id) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.content.substring(0, 200) + '...',
        category_id: formData.category_id,
        profile_id: profile.id,
        tags: formData.tags,
        is_published: true,
        published_at: new Date().toISOString()
      };

      if (id) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert(postData);
        
        if (error) throw error;
      }

      navigate(config.backPath);
    } catch (error: any) {
      console.error('Error saving post:', error);
      setError(error.message || 'Error al guardar la publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(config.backPath)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{id ? 'Editar' : config.title}</h1>
        <p className="text-gray-600 mt-2">{config.description}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
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
              placeholder="Ejemplo: Busco habitación en zona centro..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Contenido */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Detallada *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder={config.placeholder}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Describe con detalle lo que buscas: ubicación, características, presupuesto, preferencias, etc.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="Ejemplo: centro, balcón, tranquilo, mascotas"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

          {/* Botones */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(config.backPath)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {id ? 'Actualizar' : 'Publicar'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ColivingPostForm;

