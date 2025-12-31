import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhotoIcon,

} from '@heroicons/react/24/outline';

interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  title?: string;
  content: string;
  image_url?: string;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

interface GroupPostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface GroupPostsProps {
  groupId: string;
}

const GroupPosts: React.FC<GroupPostsProps> = ({ groupId }) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: null as File | null
  });
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [comments, setComments] = useState<{ [postId: string]: GroupPostComment[] }>({});
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});

  // Cargar posts del grupo
  const fetchPosts = async () => {
    try {
      console.log('🔍 GroupPosts: Cargando posts para groupId:', groupId);
      
      const { data, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          profiles!group_posts_author_id_fkey(full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      console.log('📝 GroupPosts: Datos de posts:', data, 'Error:', error);

      if (error) throw error;

      // Obtener likes para cada post
      const postsWithLikes = await Promise.all(
        (data || []).map(async (post) => {
          const { data: likesData } = await supabase
            .from('group_post_likes')
            .select('profile_id')
            .eq('post_id', post.id);

          const isLiked = likesData?.some(like => like.profile_id === profile?.id) || false;

          return {
            ...post,
            author: post.profiles,
            likes_count: likesData?.length || 0,
            is_liked: isLiked
          };
        })
      );

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar comentarios de un post
  const fetchComments = async (postId: string) => {
    try {
      console.log('🔍 Cargando comentarios para post:', postId);
      
      const { data, error } = await supabase
        .from('group_post_comments')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      console.log('💬 Datos de comentarios:', { data, error });

      if (error) {
        console.error('❌ Error al cargar comentarios:', error);
        console.error('❌ Error completo:', JSON.stringify(error, null, 2));
        console.error('❌ Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      setComments(prev => ({
        ...prev,
        [postId]: data?.map(comment => ({
          ...comment,
          author: comment.profiles
        })) || []
      }));
      
      console.log('✅ Comentarios cargados exitosamente');
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
    }
  };

  // Crear un nuevo post
  const createPost = async () => {
    if (!profile || !newPost.content.trim()) return;

    try {
      let imageUrl = null;

      // Subir imagen si existe
      if (newPost.image) {
        const fileExt = newPost.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `group-posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, newPost.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      console.log('📝 GroupPosts: Creando post para groupId:', groupId, 'authorId:', profile.id);
      
      const { error } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          author_id: profile.id,
          title: newPost.title || null,
          content: newPost.content,
          image_url: imageUrl
        });

      if (error) throw error;

      setNewPost({ title: '', content: '', image: null });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Dar like a un post
  const toggleLike = async (postId: string) => {
    if (!profile) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Quitar like
        const { error } = await supabase
          .from('group_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('profile_id', profile.id);

        if (error) throw error;
      } else {
        // Dar like
        const { error } = await supabase
          .from('group_post_likes')
          .insert({
            post_id: postId,
            profile_id: profile.id
          });

        if (error) throw error;
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Crear comentario
  const createComment = async (postId: string) => {
    if (!profile || !newComment[postId]?.trim()) {
      console.log('❌ No se puede crear comentario:', { profile: !!profile, comment: newComment[postId] });
      return;
    }

    try {
      console.log('💬 Creando comentario para post:', postId, 'contenido:', newComment[postId]);
      
      const { data, error } = await supabase
        .from('group_post_comments')
        .insert({
          post_id: postId,
          author_id: profile.id,
          content: newComment[postId]
        })
        .select();

      console.log('📝 Resultado de crear comentario:', { data, error });

      if (error) {
        console.error('❌ Error al crear comentario:', error);
        console.error('❌ Error completo:', JSON.stringify(error, null, 2));
        console.error('❌ Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Comentario creado exitosamente');
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch (error) {
      console.error('❌ Error creating comment:', error);
    }
  };

  // Toggle mostrar comentarios
  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    if (!showComments[postId] && !comments[postId]) {
      fetchComments(postId);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario para crear post */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Post</h3>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Título (opcional)"
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <textarea
            placeholder="¿Qué quieres compartir?"
            value={newPost.content}
            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <PhotoIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Subir imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPost(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                className="hidden"
              />
            </label>
            
            <button
              onClick={createPost}
              disabled={!newPost.content.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publicar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            {/* Header del post */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {post.author?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{post.author?.full_name || 'Usuario'}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Contenido del post */}
            {post.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
            )}
            <p className="text-gray-700 mb-4">
              {renderPostContent(post.content, navigate).map((part, index) => 
                typeof part === 'string' ? <span key={index}>{part}</span> : part
              )}
            </p>

            {/* Imagen del post */}
            {post.image_url && (
              <div className="mb-4">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Acciones del post */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center space-x-2 ${
                  post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <HeartIcon className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
                <span>{post.likes_count || 0}</span>
              </button>

              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>{comments[post.id]?.length || 0}</span>
              </button>
            </div>

            {/* Comentarios */}
            {showComments[post.id] && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {/* Formulario de comentario */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => createComment(post.id)}
                    disabled={!newComment[post.id]?.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Lista de comentarios */}
                <div className="space-y-3">
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-semibold">
                          {comment.author?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-semibold text-gray-900">
                            {comment.author?.full_name || 'Usuario'}
                          </p>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay posts en este grupo aún. ¡Sé el primero en publicar!</p>
        </div>
      )}
    </div>
  );
};

export default GroupPosts;
