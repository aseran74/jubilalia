import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Eye, 
  MessageCircle, 
  Heart, 
  Share2,
  Edit,
  Trash2,
  Send,
  Loader2,
  Star
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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  like_count: number;
  author: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  is_liked?: boolean;
  replies?: Comment[];
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      checkCurrentUser();
      incrementViewCount();
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

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
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
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      // Verificar si el usuario actual ha dado like
      if (currentUser) {
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('*')
          .eq('post_id', id)
          .eq('profile_id', currentUser.id)
          .single();

        data.is_liked = !!likeData;
      }

      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/dashboard/posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles!post_comments_profile_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', id)
        .eq('is_approved', true)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Procesar comentarios para agregar información de likes del usuario actual
      const commentsWithUserData = await Promise.all(
        (data || []).map(async (comment) => {
          let isLiked = false;

          if (currentUser) {
            const { data: likeData } = await supabase
              .from('comment_likes')
              .select('*')
              .eq('comment_id', comment.id)
              .eq('profile_id', currentUser.id)
              .single();

            isLiked = !!likeData;
          }

          return {
            ...comment,
            is_liked: isLiked,
            replies: []
          };
        })
      );

      setComments(commentsWithUserData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase
        .from('posts')
        .update({ view_count: (post?.view_count || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    try {
      if (post?.is_liked) {
        // Remover like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', id)
          .eq('profile_id', currentUser.id);

        setPost(prev => prev ? {
          ...prev,
          is_liked: false,
          like_count: prev.like_count - 1
        } : null);
      } else {
        // Agregar like
        await supabase
          .from('post_likes')
          .insert({
            post_id: id,
            profile_id: currentUser.id
          });

        setPost(prev => prev ? {
          ...prev,
          is_liked: true,
          like_count: prev.like_count + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim() || !currentUser) return;

    try {
      setSubmittingComment(true);

      // Obtener el profile_id del usuario actual
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .single();

      if (!profile) {
        throw new Error('No se pudo obtener el perfil del usuario');
      }

      // Crear el comentario
      const { data: comment, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: id,
          profile_id: profile.id,
          content: commentContent.trim()
        })
        .select(`
          *,
          author:profiles!post_comments_profile_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Agregar el comentario a la lista
      setComments(prev => [{
        ...comment,
        is_liked: false,
        replies: []
      }, ...prev]);

      // Limpiar el formulario
      setCommentContent('');

      // Actualizar el contador de comentarios del post
      setPost(prev => prev ? {
        ...prev,
        comment_count: prev.comment_count + 1
      } : null);

    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string, isLiked: boolean) => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    try {
      if (isLiked) {
        // Remover like
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('profile_id', currentUser.id);
      } else {
        // Agregar like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            profile_id: currentUser.id
          });
      }

      // Actualizar estado local
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              is_liked: !isLiked,
              like_count: isLiked ? comment.like_count - 1 : comment.like_count + 1
            }
          : comment
      ));

    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      navigate('/dashboard/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Post no encontrado</h3>
        <p className="text-gray-500">El post que buscas no existe o ha sido eliminado</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/dashboard/posts')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Posts
        </button>

        {currentUser && currentUser.id === post.author.id && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/dashboard/posts/${id}/edit`)}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Contenido del post */}
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Imagen destacada */}
        {post.featured_image_url && (
          <div className="h-64 md:h-96 bg-gray-200">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contenido */}
        <div className="p-6">
          {/* Header del post */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </span>
              {post.is_featured && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-4 h-4 inline mr-1" />
                  Destacado
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-4">{post.excerpt}</p>
            )}

            {/* Meta información */}
            <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/dashboard/users/${post.author.id}`)}
                  className="flex items-center hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  {post.author.full_name}
                </button>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(post.published_at)}
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  {post.view_count} vistas
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    post.is_liked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span>{post.like_count}</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comment_count}</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Etiquetas */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Contenido del post */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="whitespace-pre-wrap font-mono text-gray-800 leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>
      </article>

      {/* Sección de comentarios */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Comentarios ({post.comment_count})
        </h3>

        {/* Formulario de comentario */}
        {currentUser && (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Escribe un comentario..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={submittingComment}
                />
              </div>
              <button
                type="submit"
                disabled={!commentContent.trim() || submittingComment}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submittingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Comentar
              </button>
            </div>
          </form>
        )}

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => navigate(`/dashboard/users/${comment.author.id}`)}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {comment.author.avatar_url ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={() => navigate(`/dashboard/users/${comment.author.id}`)}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {comment.author.full_name}
                    </button>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  <p className="text-gray-800 mb-3">{comment.content}</p>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleCommentLike(comment.id, comment.is_liked || false)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        comment.is_liked 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${comment.is_liked ? 'fill-current' : ''}`} />
                      <span>{comment.like_count}</span>
                    </button>

                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>Responder</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePost}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;

