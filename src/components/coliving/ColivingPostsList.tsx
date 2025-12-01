import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  Plus,
  Home,
  Building2,
  DollarSign,
  Loader2,
  FileText
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  author: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

type PostType = 'rooms' | 'rental' | 'sale';

const ColivingPostsList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      title: 'Publicaciones de Habitaciones',
      description: 'Publica lo que buscas: una habitación con características específicas, zona preferida, compañero/a ideal',
      createPath: '/dashboard/rooms/posts/create',
      icon: Home,
      categoryName: 'Busco habitación'
    },
    rental: {
      title: 'Publicaciones de Alquiler',
      description: 'Publica lo que buscas: un alquiler en tal zona para tantas personas, con determinadas características',
      createPath: '/dashboard/properties/rental/posts/create',
      icon: Building2,
      categoryName: 'Coliving alquiler'
    },
    sale: {
      title: 'Publicaciones de Venta',
      description: 'Publica lo que buscas: una futura compra de vivienda coliving con determinadas características',
      createPath: '/dashboard/properties/sale/posts/create',
      icon: DollarSign,
      categoryName: 'Coliving Venta'
    }
  };

  const config = postTypeConfig[type || 'rooms'];
  const Icon = config.icon;

  useEffect(() => {
    fetchPosts();
  }, [type, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const currentConfig = postTypeConfig[type];

      // Primero obtener la categoría correspondiente
      const { data: categoryData, error: categoryError } = await supabase
        .from('post_categories')
        .select('id')
        .eq('name', currentConfig.categoryName)
        .single();

      if (categoryError && categoryError.code !== 'PGRST116') {
        console.error('Error fetching category:', categoryError);
      }

      let query = supabase
        .from('posts')
        .select(`
          *,
          category:post_categories(*),
          author:profiles!posts_profile_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_published', true);

      // Filtrar por categoría si existe
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      } else {
        // Si no existe la categoría, filtrar por tags o título
        query = query.or(`title.ilike.%${currentConfig.categoryName}%,tags.cs.{${currentConfig.categoryName}}`);
      }

      // Búsqueda por término
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(search) ||
      post.excerpt?.toLowerCase().includes(search) ||
      post.content?.toLowerCase().includes(search) ||
      post.tags?.some(tag => tag.toLowerCase().includes(search))
    );
  });

  // Función para obtener la ruta del post - ir al detalle del post
  const getPostRoute = (post: Post): string => {
    // Ir al detalle del post para ver el contenido completo
    return `/dashboard/posts/${post.id}`;
  };

  if (!type || !postTypeConfig[type as PostType]) {
    return (
      <div className="p-6">
        <p className="text-red-600">Tipo de publicación no válido</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600 mt-1">{config.description}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(config.createPath)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear Publicación
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar publicaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de posts */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron publicaciones' : 'Aún no hay publicaciones'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Sé el primero en publicar lo que buscas'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate(config.createPath)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear Primera Publicación
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(getPostRoute(post))}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              {post.featured_image_url && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded"
                    style={{
                      backgroundColor: post.category.color + '20',
                      color: post.category.color
                    }}
                  >
                    {post.category.name}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 150)}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/users/${post.author.id}`);
                    }}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <span>{post.author.full_name}</span>
                  </button>
                  <div className="flex items-center gap-4">
                    <span>{post.view_count || 0} vistas</span>
                    <span>{post.like_count || 0} likes</span>
                  </div>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColivingPostsList;

