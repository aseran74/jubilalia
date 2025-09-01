import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  PlusIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_by: string;
  is_public: boolean;
  max_members: number;
  current_members: number;
  created_at: string;
  is_member?: boolean;
  role?: string;
}

interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  title: string;
  content: string;
  image_urls: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url: string;
  };
  is_liked?: boolean;
}

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', image_urls: [] as string[] });

  // Cargar grupos
  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // Obtener grupos públicos y grupos de los que es miembro
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(profile_id, role)
        `)
        .or('is_public.eq.true,group_members.profile_id.eq.' + (profile?.id || ''))

      if (error) throw error;

      // Procesar los datos para marcar si el usuario es miembro
      const processedGroups = groupsData.map(group => ({
        ...group,
        is_member: group.group_members?.some((member: any) => member.profile_id === profile?.id),
        role: group.group_members?.find((member: any) => member.profile_id === profile?.id)?.role
      }));

      setGroups(processedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar posts de un grupo
  const fetchGroupPosts = async (groupId: string) => {
    try {
      const { data: postsData, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          profiles!author_id(full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Procesar posts para incluir información del autor
      const processedPosts = postsData.map(post => ({
        ...post,
        author: post.profiles
      }));

      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Unirse a un grupo
  const joinGroup = async (groupId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          profile_id: profile.id,
          role: 'member'
        });

      if (error) throw error;

      // Actualizar el contador de miembros
      await supabase
        .from('groups')
        .update({ current_members: groups.find(g => g.id === groupId)?.current_members + 1 })
        .eq('id', groupId);

      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  // Abandonar un grupo
  const leaveGroup = async (groupId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('profile_id', profile.id);

      if (error) throw error;

      // Actualizar el contador de miembros
      await supabase
        .from('groups')
        .update({ current_members: groups.find(g => g.id === groupId)?.current_members - 1 })
        .eq('id', groupId);

      fetchGroups();
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  // Crear un post
  const createPost = async () => {
    if (!selectedGroup || !profile) return;

    try {
      const { error } = await supabase
        .from('group_posts')
        .insert({
          group_id: selectedGroup.id,
          author_id: profile.id,
          title: newPost.title,
          content: newPost.content,
          image_urls: newPost.image_urls
        });

      if (error) throw error;

      setNewPost({ title: '', content: '', image_urls: [] });
      setShowCreatePost(false);
      fetchGroupPosts(selectedGroup.id);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Dar like a un post
  const likePost = async (postId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('group_post_likes')
        .insert({
          post_id: postId,
          profile_id: profile.id
        });

      if (error) throw error;

      // Actualizar contador de likes
      await supabase
        .from('group_posts')
        .update({ likes_count: posts.find(p => p.id === postId)?.likes_count + 1 })
        .eq('id', postId);

      fetchGroupPosts(selectedGroup!.id);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [profile]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupPosts(selectedGroup.id);
    }
  }, [selectedGroup]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grupos</h1>
            <p className="text-gray-600 mt-2">Conecta con personas que comparten tus intereses</p>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear Grupo
          </button>
        </div>

        {/* Lista de grupos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {group.image_url && (
                  <img
                    src={group.image_url}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    group.is_public ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {group.is_public ? 'Público' : 'Privado'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    {group.current_members}/{group.max_members} miembros
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(group.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>

                <div className="flex gap-2">
                  {group.is_member ? (
                    <>
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                      >
                        Ver Grupo
                      </button>
                      <button
                        onClick={() => leaveGroup(group.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Salir
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => joinGroup(group.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Unirse
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vista de grupo seleccionado */}
        {selectedGroup && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                <p className="text-gray-600 mt-2">{selectedGroup.description}</p>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Botón para crear post */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Crear Post
              </button>
            </div>

            {/* Posts del grupo */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        {post.author?.avatar_url ? (
                          <img
                            src={post.author.avatar_url}
                            alt={post.author.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                            {post.author?.full_name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{post.author?.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    {post.is_pinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Fijado
                      </span>
                    )}
                  </div>

                  {post.title && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  )}
                  
                  <p className="text-gray-700 mb-4">{post.content}</p>

                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="mb-4">
                      <img
                        src={post.image_urls[0]}
                        alt="Post image"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => likePost(post.id)}
                        className={`flex items-center space-x-1 ${
                          post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <HeartIcon className="w-5 h-5" />
                        <span>{post.likes_count}</span>
                      </button>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        <span>{post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal para crear post */}
        {showCreatePost && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Crear Post en {selectedGroup.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título (opcional)
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Título del post..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido *
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Escribe tu post..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createPost}
                  disabled={!newPost.content.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
