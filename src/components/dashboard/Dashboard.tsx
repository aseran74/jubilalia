import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  // Iconos
  BellIcon, ChatBubbleLeftRightIcon,
  SparklesIcon, UserGroupIcon, MagnifyingGlassIcon,
  HomeModernIcon, KeyIcon, BuildingLibraryIcon, BuildingOffice2Icon,
  PlusIcon, DocumentTextIcon, MapPinIcon, CalendarIcon, HeartIcon,
  ArrowRightIcon, ClockIcon
} from '@heroicons/react/24/solid';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender: {
    full_name: string;
    avatar_url: string | null;
  };
  is_read: boolean;
}

interface Activity {
  id: string;
  title: string;
  date: string;
  city?: string;
  [key: string]: unknown;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

interface Friend {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city?: string | null;
}

interface GroupMemberResponse {
  group_id: string;
  groups: Group | Group[] | null;
}

interface FriendshipData {
  id: string;
  friend_id: string;
  user_id: string;
}

interface MainCardProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  to?: string;
  children?: React.ReactNode;
}

interface ActionRowProps {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: 'primary' | 'secondary';
}

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [nearbyActivities, setNearbyActivities] = useState<Activity[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [userFriends, setUserFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRealData = React.useCallback(async () => {
    if (!user || !profile) return;
    
    try {
      setLoading(true);

      // 1. Cargar Mensajes Reales (Donde soy el receptor)
      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('id, content, created_at, is_read, sender_id')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (msgs && msgs.length > 0) {
        // Cargar los perfiles de los remitentes por separado
        const senderIds = [...new Set(msgs.map((msg) => msg.sender_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', senderIds);

        // Combinar mensajes con perfiles
        const transformedMessages: Message[] = msgs.map((msg) => {
          const senderProfile = profiles?.find((p) => p.id === msg.sender_id);
          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender_id: msg.sender_id,
            sender: {
              full_name: senderProfile?.full_name || 'Usuario',
              avatar_url: senderProfile?.avatar_url || null
            },
            is_read: msg.is_read
          };
        });
        setMessages(transformedMessages);
      }
      if (msgError) console.error("Error mensajes:", msgError);

      // 2. Cargar Actividades Cercanas
      if (profile.city) {
        const { data: acts } = await supabase
          .from('activities')
          .select('*')
          .eq('city', profile.city)
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(4);
        setNearbyActivities((acts as Activity[]) || []);
      }

      // 3. Cargar Grupos del Usuario
      const { data: groupsData, error: groupsError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name,
            description,
            image_url
          )
        `)
        .eq('profile_id', user.id);

      if (groupsData) {
        const groups: Group[] = (groupsData as GroupMemberResponse[])
          .map((gm) => {
            const group = Array.isArray(gm.groups) ? gm.groups[0] : gm.groups;
            return group;
          })
          .filter((g): g is Group => g !== null && typeof g === 'object' && 'id' in g);
        setUserGroups(groups);
      }
      if (groupsError) console.error("Error grupos:", groupsError);

      // 4. Cargar Amigos del Usuario (amistades aceptadas)
      // Primero obtenemos las friendships
      const { data: friendshipsData, error: friendshipsError } = await supabase
        .from('friendships')
        .select('id, friend_id, user_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendshipsData && friendshipsData.length > 0) {
        // Extraer los IDs de los amigos (puede ser user_id o friend_id dependiendo de quién inició)
        const friendIds = friendshipsData.map((friendship: { user_id: string; friend_id: string }) => {
          return friendship.user_id === user.id 
            ? friendship.friend_id 
            : friendship.user_id;
        });

        // Obtener los perfiles de los amigos
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, city')
          .in('id', friendIds);

        if (friendProfiles) {
          const friends: Friend[] = friendProfiles.map((profile) => ({
            id: profile.id,
            full_name: profile.full_name || 'Usuario',
            avatar_url: profile.avatar_url || null,
            city: profile.city ?? null
          }));
          setUserFriends(friends);
        }
      } else {
        setUserFriends([]);
      }

      if (friendshipsError) {
        console.error("Error amigos:", friendshipsError);
      }

    } catch (error) {
      console.error('Error general carga dashboard', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadRealData();
  }, [loadRealData]);


  // --- Componentes UI Mejorados ---

  // Tarjeta con Gradiente Elegante
  const MainCard: React.FC<MainCardProps> = ({ title, subtitle, icon: Icon, gradient, to, children }) => (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group bg-gradient-to-br ${gradient} h-full flex flex-col border border-white/20`}>
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-md shadow-inner text-white">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
          <p className="text-sm text-white/80 font-medium">{subtitle}</p>
        </div>
      </div>
      
      <div className="mt-auto space-y-2 relative z-10">
        {children || (to ? (
           <Link to={to} className="flex items-center justify-between w-full p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors border border-white/10 group/btn">
             <span className="font-bold text-white">Entrar</span>
             <ArrowRightIcon className="w-4 h-4 text-white/70 group-hover/btn:translate-x-1 transition-transform" />
           </Link>
        ) : (
          <div className="flex items-center justify-between w-full p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            <span className="font-bold text-white">Entrar</span>
            <ArrowRightIcon className="w-4 h-4 text-white/70" />
          </div>
        ))}
      </div>
    </div>
  );

  // Botón de Acción dentro de tarjetas
  const ActionRow: React.FC<ActionRowProps> = ({ label, to, icon: Icon, type = 'secondary' }) => (
    <Link to={to} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all shadow-sm ${
        type === 'primary' 
        ? 'bg-stone-800 text-white hover:bg-black' 
        : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
    }`}>
        <Icon className={`w-4 h-4 ${type === 'primary' ? 'text-white' : 'text-stone-400'}`} />
        <span className="text-sm font-bold flex-1">{label}</span>
    </Link>
  );


  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24">
      
      {/* HEADER: Limpio y minimalista */}
      <header className="pt-10 pb-6 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
            <div>
                 <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                    Hola, <span className="text-indigo-600">{profile?.full_name?.split(' ')[0] || 'Viajero'}</span>
                 </h1>
                 <p className="text-stone-500 font-medium mt-1">¿Qué plan tienes para hoy?</p>
            </div>
            {profile?.avatar_url && (
                <img src={profile.avatar_url} className="w-12 h-12 rounded-full border-2 border-white shadow-md" alt="Perfil" />
            )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 space-y-8">

        {/* --- BLOQUE 1: PLANES (Gradientes cálidos y atractivos) --- */}
        <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <MainCard 
                    title="Grupos" 
                    subtitle="Comunidades activas" 
                    icon={UserGroupIcon} 
                    gradient="from-violet-600 to-indigo-600"
                >
                    <div className="grid grid-cols-2 gap-2">
                        <Link to="/dashboard/groups" className="bg-white/20 backdrop-blur text-white text-sm font-bold p-2 rounded-lg text-center hover:bg-white/30 transition">Mis Grupos</Link>
                        <Link to="/dashboard/groups/explore" className="bg-white text-indigo-600 text-sm font-bold p-2 rounded-lg text-center shadow-sm hover:shadow-md transition">Explorar</Link>
                    </div>
                </MainCard>

                <MainCard 
                    title="Actividades" 
                    subtitle="Ocio y cultura" 
                    icon={SparklesIcon} 
                    gradient="from-orange-500 to-pink-500"
                >
                    <div className="grid grid-cols-2 gap-2">
                         <Link to="/activities/create" className="bg-white/20 backdrop-blur text-white text-sm font-bold p-2 rounded-lg text-center hover:bg-white/30 transition">Crear</Link>
                         <Link to="/activities" className="bg-white text-pink-600 text-sm font-bold p-2 rounded-lg text-center shadow-sm hover:shadow-md transition">Ver Todo</Link>
                    </div>
                </MainCard>

                <MainCard 
                    title="Gente" 
                    subtitle="Conecta cerca de ti" 
                    icon={MagnifyingGlassIcon} 
                    gradient="from-blue-500 to-cyan-500"
                >
                     <Link to="/users" className="block w-full text-center bg-white text-cyan-700 font-bold py-2.5 rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all">
                        Buscar Compañeros
                     </Link>
                </MainCard>
            </div>
        </section>


        {/* --- BLOQUE 2: COLIVING (Diseño limpio y funcional) --- */}
        <section>
            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <HomeModernIcon className="w-5 h-5 text-emerald-600" />
                Vivienda & Coliving
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 2.1 Info Coliving (Destacado) */}
                <div className="group relative bg-emerald-900 rounded-[1.5rem] p-5 text-white overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-emerald-900/30 transition-all">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div>
                        <div className="bg-white/10 w-fit p-2 rounded-lg mb-3">
                             <HomeModernIcon className="w-6 h-6 text-emerald-300" />
                        </div>
                        <h3 className="text-lg font-bold leading-tight mb-3">Jubílate en compañía</h3>
                    </div>
                    <Link to="/coliving" className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors border border-white/10">
                        <span className="text-sm font-bold">Explicación</span>
                        <ArrowRightIcon className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform"/>
                    </Link>
                </div>

                {/* 2.2 Habitaciones */}
                <div className="bg-white rounded-[1.5rem] p-4 border border-stone-200 shadow-sm hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-emerald-700">
                        <KeyIcon className="w-5 h-5" />
                        <h3 className="font-bold">Habitaciones</h3>
                    </div>
                    <div className="space-y-2">
                        <ActionRow label="Buscar" to="/rooms" icon={MagnifyingGlassIcon} type="primary" />
                        <div className="flex gap-2">
                             <Link to="/rooms/create" className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-2 flex justify-center hover:bg-emerald-50 hover:border-emerald-200 transition"><PlusIcon className="w-4 h-4 text-stone-500"/></Link>
                             <Link to="/rooms/posts" className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-2 flex justify-center hover:bg-emerald-50 hover:border-emerald-200 transition"><DocumentTextIcon className="w-4 h-4 text-stone-500"/></Link>
                        </div>
                    </div>
                </div>

                {/* 2.3 Alquiler */}
                <div className="bg-white rounded-[1.5rem] p-4 border border-stone-200 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-blue-700">
                        <BuildingOffice2Icon className="w-5 h-5" />
                        <h3 className="font-bold">Alquiler</h3>
                    </div>
                    <div className="space-y-2">
                        <ActionRow label="Buscar" to="/rentals" icon={MagnifyingGlassIcon} type="primary" />
                         <div className="flex gap-2">
                             <Link to="/rentals/create" className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-2 flex justify-center hover:bg-blue-50 hover:border-blue-200 transition"><PlusIcon className="w-4 h-4 text-stone-500"/></Link>
                             <Link to="/rentals/posts" className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-2 flex justify-center hover:bg-blue-50 hover:border-blue-200 transition"><DocumentTextIcon className="w-4 h-4 text-stone-500"/></Link>
                        </div>
                    </div>
                </div>

                {/* 2.4 Venta */}
                <div className="bg-white rounded-[1.5rem] p-4 border border-stone-200 shadow-sm hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-purple-700">
                        <BuildingLibraryIcon className="w-5 h-5" />
                        <h3 className="font-bold">Venta</h3>
                    </div>
                    <div className="space-y-2">
                        <ActionRow label="Buscar" to="/sales" icon={MagnifyingGlassIcon} type="primary" />
                         <div className="flex gap-2">
                             <Link to="/sales/create" className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-2 flex justify-center hover:bg-purple-50 hover:border-purple-200 transition"><PlusIcon className="w-4 h-4 text-stone-500"/></Link>
                             <Link to="/sales/posts" className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-2 flex justify-center hover:bg-purple-50 hover:border-purple-200 transition"><DocumentTextIcon className="w-4 h-4 text-stone-500"/></Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        {/* --- BLOQUE 3: GRUPOS, AMIGOS Y ALERTAS (Nuevo formato) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Mis Grupos */}
            <Link to="/dashboard/groups" className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <UserGroupIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold">Mis Grupos</h3>
                        {userGroups.length > 0 && (
                            <span className="text-xs text-white/80">{userGroups.length} {userGroups.length === 1 ? 'grupo' : 'grupos'}</span>
                        )}
                    </div>
                </div>
                {userGroups.length > 0 ? (
                    <div className="space-y-2 mb-4">
                        {userGroups.slice(0, 2).map((group) => (
                            <div key={group.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                                <p className="text-sm font-semibold truncate">{group.name}</p>
                                {group.description && (
                                    <p className="text-xs text-white/80 line-clamp-1 mt-1">{group.description}</p>
                                )}
                            </div>
                        ))}
                        {userGroups.length > 2 && (
                            <p className="text-xs text-white/70">+{userGroups.length - 2} más</p>
                        )}
                    </div>
                ) : (
                    <p className="text-white/90 text-sm mb-4">Los grupos en los que estoy integrado</p>
                )}
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>Ver mis grupos</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

            {/* Mis Amigos */}
            <Link to="/dashboard/friends" className="group bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <HeartIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold">Mis Amigos</h3>
                        {userFriends.length > 0 && (
                            <span className="text-xs text-white/80">{userFriends.length} {userFriends.length === 1 ? 'amigo' : 'amigos'}</span>
                        )}
                    </div>
                </div>
                {userFriends.length > 0 ? (
                    <div className="flex -space-x-2 mb-4">
                        {userFriends.slice(0, 4).map((friend) => (
                            <img
                                key={friend.id}
                                src={friend.avatar_url || 'https://via.placeholder.com/40'}
                                alt={friend.full_name}
                                className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
                            />
                        ))}
                        {userFriends.length > 4 && (
                            <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center text-xs font-bold">
                                +{userFriends.length - 4}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-white/90 text-sm mb-4">Las personas con las que ya he conectado</p>
                )}
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>Ver mis amigos</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

            {/* Mis Notificaciones */}
            <Link to="/dashboard/notifications" className="group bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <BellIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">Mis Notificaciones</h3>
                </div>
                <p className="text-white/90 text-sm mb-4">Todas mis notificaciones</p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>Ver notificaciones</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
        </div>


        {/* --- BLOQUE 4: MENSAJES REALES & AGENDA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* 4.1 MIS MENSAJES Y ACTIVIDADES CERCANAS (Columna Ancha - Izquierda) */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                            Mis Mensajes
                        </h2>
                        <Link to="/messages" className="text-sm font-bold text-blue-600 hover:underline">Ver todos</Link>
                    </div>

                <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-stone-100 min-h-[300px]">
                    {loading ? (
                        <div className="p-8 text-center text-stone-400">Cargando conversaciones...</div>
                    ) : messages.length > 0 ? (
                        <div className="space-y-1">
                            {messages.map((msg) => (
                                <Link 
                                    key={msg.id} 
                                    to={`/messages/${msg.sender_id}`} // O a la conversación específica
                                    className={`flex items-center gap-4 p-4 rounded-3xl transition-all hover:bg-blue-50 group ${!msg.is_read ? 'bg-blue-50/50' : 'bg-transparent'}`}
                                >
                                    <div className="relative">
                                        <img 
                                            src={msg.sender?.avatar_url || 'https://via.placeholder.com/40'} 
                                            className="w-12 h-12 rounded-full object-cover border border-stone-200" 
                                            alt={msg.sender?.full_name} 
                                        />
                                        {!msg.is_read && <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className="font-bold text-stone-900 truncate">{msg.sender?.full_name || 'Usuario'}</h4>
                                            <span className="text-xs text-stone-400 font-medium whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: es })}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${!msg.is_read ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}>
                                            {msg.content}
                                        </p>
                                    </div>
                                    <ArrowRightIcon className="w-4 h-4 text-stone-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-10 text-stone-400">
                             <ChatBubbleLeftRightIcon className="w-12 h-12 mb-2 opacity-20" />
                             <p>No tienes mensajes nuevos</p>
                             <Link to="/users" className="text-blue-600 text-sm font-bold mt-2">Buscar gente para hablar</Link>
                        </div>
                    )}
                </div>
                </div>

                {/* Actividades Cercanas al lado de Mensajes */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                            <MapPinIcon className="w-6 h-6 text-orange-500" />
                            Actividades cercanas
                        </h2>
                    </div>
                    
                    <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100">
                        {nearbyActivities.length > 0 ? (
                            <div className="space-y-3">
                                {nearbyActivities.map((act) => (
                                    <Link key={act.id} to={`/activities/${act.id}`} className="flex gap-3 items-start p-3 rounded-2xl hover:bg-orange-50 transition-colors group">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold uppercase">{format(new Date(act.date), 'MMM', { locale: es })}</span>
                                            <span className="text-lg font-bold leading-none">{format(new Date(act.date), 'd')}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-stone-800 leading-snug group-hover:text-orange-700 transition-colors line-clamp-2">
                                                {act.title}
                                            </h4>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-stone-500">
                                                <ClockIcon className="w-3 h-3" />
                                                {format(new Date(act.date), 'HH:mm')}h
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <Link to="/activities" className="block text-center py-2 text-xs font-bold text-stone-400 hover:text-orange-500 uppercase tracking-wide">
                                    Ver Calendario Completo
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8 px-4">
                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CalendarIcon className="w-8 h-8 text-stone-300" />
                                </div>
                                <p className="text-sm text-stone-500 font-medium">No hay actividades cerca hoy.</p>
                                <Link to="/activities/create" className="text-orange-600 text-sm font-bold mt-2 block">
                                    ¡Crea la primera!
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;