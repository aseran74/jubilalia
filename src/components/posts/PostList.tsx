import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import AdminButtons from '../common/AdminButtons';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Eye, 
  MessageCircle, 
  Heart, 
  Plus,
  Star,
  Loader2
} from 'lucide-react';

interface PostCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  category: PostCategory;
  author: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  is_liked?: boolean;
}

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('published_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [selectedCategory, selectedAuthor, dateFilter, sortBy, sortOrder]);

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

  const fetchPosts = async () => {
    try {
      setLoading(true);

      // Obtener ID de categoría "Busco habitación" para excluirla (pero incluir Coliving alquiler y Venta)
      const { data: colivingCategories } = await supabase
        .from('post_categories')
        .select('id, name')
        .in('name', ['Busco habitación', 'Coliving alquiler', 'Coliving Venta']);

      const excludeCategoryIds = new Set(
        colivingCategories
          ?.filter(cat => cat.name === 'Busco habitación')
          .map(cat => cat.id) || []
      );

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

      // Filtros
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (selectedAuthor) {
        query = query.eq('profile_id', selectedAuthor);
      }

      if (dateFilter !== 'all') {
        const today = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            break;
          case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        }
        
        query = query.gte('published_at', startDate.toISOString());
      }

      // Ordenamiento
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar solo "Busco habitación" pero incluir "Coliving alquiler" y "Coliving Venta"
      const filteredData = (data || []).filter(post => {
        // Excluir solo posts de "Busco habitación", pero incluir los de Coliving alquiler y Venta
        return !excludeCategoryIds.has(post.category_id);
      });

      const postsWithUserData = await Promise.all(
        filteredData.map(async (post) => {
          const { data: { user } } = await supabase.auth.getUser();
          let isLiked = false;

          if (user) {
            const { data: likeData } = await supabase
              .from('post_likes')
              .select('*')
              .eq('post_id', post.id)
              .eq('profile_id', user.id)
              .single();

            isLiked = !!likeData;
          }

          return {
            ...post,
            is_liked: isLiked
          };
        })
      );

      setPosts(postsWithUserData);

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }

      if (isLiked) {
        // Remover like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('profile_id', user.id);
      } else {
        // Agregar like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            profile_id: user.id
          });
      }

      // Actualizar estado local
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !isLiked,
              like_count: isLiked ? post.like_count - 1 : post.like_count + 1
            }
          : post
      ));

    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        alert('Error al eliminar el post');
        return;
      }

      // Actualizar la lista de posts
      setPosts(posts.filter(post => post.id !== postId));
      alert('Post eliminado correctamente');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar el post');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedAuthor('');
    setDateFilter('all');
    setSortBy('published_at');
    setSortOrder('desc');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.author.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
    if (diffDays <= 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays <= 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para determinar la ruta - siempre ir al detalle del post
  const getPostRoute = (post: Post): string => {
    // Siempre ir al detalle del post para ver el contenido completo
    return `/dashboard/posts/${post.id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            <p className="text-gray-600 mt-2">Descubre contenido interesante de la comunidad</p>
          </div>
          
          <button
            onClick={() => navigate('/dashboard/posts/create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Post
          </button>
        </div>

        {/* Búsqueda principal */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar posts, autores, categorías..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </form>

        {/* Botón de filtros */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>

          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros Avanzados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Cualquier fecha</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="published_at">Fecha de publicación</option>
                <option value="title">Título</option>
                <option value="view_count">Vistas</option>
                <option value="like_count">Likes</option>
                <option value="comment_count">Comentarios</option>
              </select>
            </div>

            {/* Orden */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orden</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-gray-600">
          Se encontraron <span className="font-semibold text-blue-600">{filteredPosts.length}</span> posts
        </p>
      </div>

      {/* Lista de posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen destacada */}
            <div className="h-48 bg-gray-200 relative">
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📝</div>
                    <div className="text-sm">Sin imagen</div>
                  </div>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 space-y-2">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: post.category.color }}
                >
                  {post.category.name}
                </span>
                {post.is_featured && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 inline mr-1" />
                    Destacado
                  </span>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
              
              {post.excerpt && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              {/* Autor y fecha */}
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <User className="w-4 h-4 mr-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/users/${post.author.id}`);
                  }}
                  className="mr-3 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {post.author.full_name}
                </button>
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(post.published_at)}</span>
              </div>

              {/* Etiquetas */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{post.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Estadísticas */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.view_count}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comment_count}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.like_count}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    const route = getPostRoute(post);
                    navigate(route);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Leer Post
                </button>
                
                <button
                  onClick={() => handleLikeToggle(post.id, post.is_liked || false)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                    post.is_liked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Botones de administrador */}
              {isAdmin && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <AdminButtons 
                    itemId={post.id}
                    itemType="post"
                    onDelete={handleDeletePost}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron posts</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda o crear un nuevo post</p>
        </div>
      )}
    </div>
  );
};

export default PostList;

