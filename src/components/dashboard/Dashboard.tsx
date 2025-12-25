import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  UserIcon,
  Cog6ToothIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  HomeModernIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface FeedItem {
  id: string;
  type: 'post' | 'group' | 'message' | 'activity';
  title: string;
  description: string;
  author?: string;
  avatar?: string;
  timestamp: string;
  link: string;
  metadata?: any;
}

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [nearbyActivities, setNearbyActivities] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadRecentPosts(),
        loadGroupActivity(),
        loadNearbyActivities(),
        loadUnreadMessages()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          created_at,
          profile_id,
          category_id,
          post_categories:category_id (
            name
          ),
          profiles:profile_id (
            full_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Función para determinar la ruta - siempre ir al detalle del post
      const getPostRoute = (post: any): string => {
        // Siempre ir al detalle del post para ver el contenido completo
        return `/dashboard/posts/${post.id}`;
      };

      const postItems: FeedItem[] = (posts || []).map((post: any) => {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        return {
          id: post.id,
          type: 'post' as const,
          title: post.title,
          description: post.excerpt || '',
          author: profile?.full_name || 'Usuario',
          avatar: profile?.avatar_url,
          timestamp: post.created_at,
          link: getPostRoute(post)
        };
      });

      setFeedItems(prev => [...prev, ...postItems]);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadGroupActivity = async () => {
    try {
      // Obtener posts de grupos
      const { data: groupPosts, error } = await supabase
        .from('group_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          group_id,
          groups:group_id (
            name
          ),
          author_id,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const groupItems: FeedItem[] = (groupPosts || []).map((post: any) => {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        const group = Array.isArray(post.groups) ? post.groups[0] : post.groups;
        return {
          id: post.id,
          type: 'group' as const,
          title: post.title || `Publicación en ${group?.name || 'grupo'}`,
          description: post.content?.substring(0, 150) + '...' || '',
          author: profile?.full_name || 'Usuario',
          avatar: profile?.avatar_url,
          timestamp: post.created_at,
          link: `/dashboard/groups/${post.group_id}`,
          metadata: { groupName: group?.name }
        };
      });

      setFeedItems(prev => [...prev, ...groupItems]);
    } catch (error) {
      console.error('Error loading group activity:', error);
    }
  };

  const loadNearbyActivities = async () => {
    try {
      if (!profile?.city) return;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('city', profile.city)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;

      setNearbyActivities(activities || []);

      // Añadir actividades al feed
      const activityItems: FeedItem[] = (activities || []).map(activity => ({
        id: activity.id,
        type: 'activity' as const,
        title: activity.title,
        description: `${activity.city} • ${new Date(activity.date).toLocaleDateString('es-ES')}`,
        timestamp: activity.created_at,
        link: `/dashboard/activities/${activity.id}`,
        metadata: { 
          date: activity.date,
          city: activity.city,
          price: activity.price,
          is_free: activity.is_free
        }
      }));

      setFeedItems(prev => [...prev, ...activityItems]);
    } catch (error) {
      console.error('Error loading nearby activities:', error);
    }
  };

  const loadUnreadMessages = async () => {
    try {
      if (!profile?.id) return;

      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;

      setUnreadMessages(count || 0);
    } catch (error) {
      console.error('Error loading unread messages:', error);
    }
  };

  // Ordenar feed por timestamp
  const sortedFeed = [...feedItems].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 10);

  const getIcon = (type: string) => {
    switch (type) {
      case 'post': return DocumentTextIcon;
      case 'group': return UserGroupIcon;
      case 'activity': return CalendarIcon;
      case 'message': return ChatBubbleLeftRightIcon;
      default: return BellIcon;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-indigo-100 text-indigo-600';
      case 'group': return 'bg-purple-100 text-purple-600';
      case 'activity': return 'bg-green-100 text-green-600';
      case 'message': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Bloque 1: Coliving
  const colivingCards = [
    {
      title: 'Coliving',
      description: 'Descubre las diferentes formas de compartir vivienda y crear comunidad',
      icon: HomeModernIcon,
      href: '/coliving',
      color: 'bg-emerald-500',
      actions: [
        { name: 'Ver explicación', href: '/coliving', icon: InformationCircleIcon }
      ]
    },
    {
      title: 'Habitaciones',
      description: 'Busca y publica habitaciones para alquilar y compartir gastos con un compañero/a',
      icon: BuildingOfficeIcon,
      href: '/dashboard/rooms',
      color: 'bg-yellow-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/rooms', icon: MagnifyingGlassIcon },
        { name: 'Publicar', href: '/dashboard/rooms/create', icon: PlusIcon },
        { name: 'Ver post', href: '/dashboard/rooms/posts', icon: DocumentTextIcon }
      ]
    },
    {
      title: 'Alquiler',
      description: 'Busca y publica propiedades para alquilar y jubilarte tranquilamente',
      icon: BuildingOfficeIcon,
      href: '/dashboard/properties/rental',
      color: 'bg-green-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/properties/rental', icon: MagnifyingGlassIcon },
        { name: 'Publicar', href: '/dashboard/properties/rental/create', icon: PlusIcon },
        { name: 'Ver post', href: '/dashboard/properties/rental/posts', icon: DocumentTextIcon }
      ]
    },
    {
      title: 'Venta',
      description: 'Busca y publica propiedades para comprar y jubilarte tranquilamente',
      icon: BuildingOfficeIcon,
      href: '/dashboard/properties/sale',
      color: 'bg-blue-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/properties/sale', icon: MagnifyingGlassIcon },
        { name: 'Publicar', href: '/dashboard/properties/sale/create', icon: PlusIcon },
        { name: 'Ver post', href: '/dashboard/properties/sale/posts', icon: DocumentTextIcon }
      ]
    }
  ];

  // Bloque 2: Planes (Gente, Grupos, Actividades)
  const planesCards = [
    {
      title: 'Buscar Gente',
      description: 'Conecta con personas afines en tu área',
      icon: UserIcon,
      href: '/dashboard/users',
      color: 'bg-pink-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/users', icon: MagnifyingGlassIcon }
      ]
    },
    {
      title: 'Buscar Grupos',
      description: 'Encuentra grupos de personas con intereses similares para proyectos colaborativos',
      icon: UserGroupIcon,
      href: '/dashboard/groups',
      color: 'bg-cyan-500',
      actions: [
        { name: 'Ver grupos', href: '/dashboard/groups', icon: MagnifyingGlassIcon }
      ]
    },
    {
      title: 'Actividades',
      description: 'Organiza y participa en actividades comunitarias',
      icon: CalendarIcon,
      href: '/dashboard/activities',
      color: 'bg-purple-500',
      actions: [
        { name: 'Buscar', href: '/dashboard/activities', icon: MagnifyingGlassIcon },
        { name: 'Crear', href: '/dashboard/activities/create', icon: PlusIcon }
      ]
    }
  ];

  // Bloque 3: Mi Panel (Notificaciones, Mensajes, Perfil)
  const miPanelCards = [
    {
      title: 'Notificaciones',
      description: 'Gestiona tus notificaciones y alertas',
      icon: BellIcon,
      href: '/dashboard/notifications',
      color: 'bg-amber-500',
      actions: [
        { name: 'Ver todas', href: '/dashboard/notifications', icon: BellIcon }
      ]
    },
    {
      title: 'Mensajes',
      description: 'Gestiona tus conversaciones',
      icon: ChatBubbleLeftRightIcon,
      href: '/dashboard/messages',
      color: 'bg-teal-500',
      actions: [
        { name: 'Ver todos', href: '/dashboard/messages', icon: MagnifyingGlassIcon },
        { name: 'Buscar gente', href: '/dashboard/users', icon: UserIcon }
      ]
    },
    {
      title: 'Mi Perfil',
      description: 'Gestiona tu información personal y preferencias',
      icon: UserIcon,
      href: '/dashboard/profile',
      color: 'bg-orange-500',
      actions: [
        { name: 'Editar', href: '/dashboard/profile', icon: UserIcon },
        { name: 'Configuración', href: '/dashboard/settings', icon: Cog6ToothIcon }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido a Jubilalia!
          </h1>
          <p className="mt-2 text-gray-600">
            Tu plataforma para conectar, compartir y disfrutar de la jubilación
          </p>
        </div>

        {/* User Welcome */}
        {profile && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Usuario'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Hola, {profile.full_name || user?.email || 'Usuario'}!
                </h2>
                <p className="text-gray-600">
                  ¿Qué te gustaría hacer hoy?
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bloque 1: Planes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Planes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {planesCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
                >
                  <div className={`${card.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold mb-1 truncate">{card.title}</h3>
                        <p className="text-white/90 text-xs leading-snug line-clamp-2">{card.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="space-y-2">
                      {card.actions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                          <Link
                            key={action.name}
                            to={action.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-200 hover:border-gray-300 hover:shadow-sm group/action"
                          >
                            <ActionIcon className="w-5 h-5 text-gray-500 group-hover/action:text-gray-700 group-hover/action:scale-110 transition-transform flex-shrink-0" />
                            <span className="flex-1 text-left">{action.name}</span>
                            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/action:text-gray-600 group-hover/action:translate-x-1 transition-transform" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloque 2: Coliving */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Coliving</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {colivingCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
                >
                  <div className={`${card.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold mb-1 truncate">{card.title}</h3>
                        <p className="text-white/90 text-xs leading-snug line-clamp-2">{card.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="space-y-2">
                      {card.actions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                          <Link
                            key={action.name}
                            to={action.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-200 hover:border-gray-300 hover:shadow-sm group/action"
                          >
                            <ActionIcon className="w-5 h-5 text-gray-500 group-hover/action:text-gray-700 group-hover/action:scale-110 transition-transform flex-shrink-0" />
                            <span className="flex-1 text-left">{action.name}</span>
                            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/action:text-gray-600 group-hover/action:translate-x-1 transition-transform" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloque 3: Mi Panel */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Panel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {miPanelCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
                >
                  <div className={`${card.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold mb-1 truncate">{card.title}</h3>
                        <p className="text-white/90 text-xs leading-snug line-clamp-2">{card.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="space-y-2">
                      {card.actions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                          <Link
                            key={action.name}
                            to={action.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-200 hover:border-gray-300 hover:shadow-sm group/action"
                          >
                            <ActionIcon className="w-5 h-5 text-gray-500 group-hover/action:text-gray-700 group-hover/action:scale-110 transition-transform flex-shrink-0" />
                            <span className="flex-1 text-left">{action.name}</span>
                            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/action:text-gray-600 group-hover/action:translate-x-1 transition-transform" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feed de Noticias y Actividades Cercanas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Principal */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                Últimas Noticias
              </h3>
              {unreadMessages > 0 && (
                <Link 
                  to="/dashboard/messages"
                  className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  {unreadMessages} mensajes nuevos
                </Link>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedFeed.length > 0 ? (
              <div className="space-y-4">
                {sortedFeed.map((item) => {
                  const Icon = getIcon(item.type);
                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={item.link}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getColor(item.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {item.avatar && (
                              <img
                                src={item.avatar}
                                alt={item.author}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            {item.author && (
                              <span className="text-sm font-medium text-gray-700">
                                {item.author}
                              </span>
                            )}
                            {item.metadata?.groupName && (
                              <span className="text-sm text-gray-500">
                                en {item.metadata.groupName}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <ClockIcon className="w-4 h-4" />
                            {new Date(item.timestamp).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay noticias recientes</p>
                <p className="text-sm text-gray-500 mt-1">
                  Únete a grupos y sigue posts para ver actualizaciones aquí
                </p>
              </div>
            )}
          </div>

          {/* Actividades Cercanas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              Actividades Cercanas
            </h3>
            
            {nearbyActivities.length > 0 ? (
              <div className="space-y-4">
                {nearbyActivities.map((activity) => (
                  <Link
                    key={activity.id}
                    to={`/dashboard/activities/${activity.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {activity.title}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        {activity.city}
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(activity.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        {activity.time}
                      </div>
                    </div>
                    <div className="mt-3">
                      {activity.is_free ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Gratis
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          €{activity.price}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                <Link
                  to="/dashboard/activities"
                  className="block text-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver todas las actividades →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  No hay actividades cercanas
                </p>
                <Link
                  to="/dashboard/activities"
                  className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Explorar actividades
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">
            ¿Primera vez en Jubilalia?
          </h3>
          <p className="text-blue-100 mb-4">
            Completa tu perfil y comienza a explorar todas las funcionalidades disponibles
          </p>
          <div className="flex space-x-3">
            <Link
              to="/dashboard/profile"
              className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Completar Perfil
            </Link>
            <Link
              to="/dashboard/activities"
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Explorar Actividades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
