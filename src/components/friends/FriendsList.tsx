import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  HeartIcon, 
  UserGroupIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface Friend {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  created_at: string;
}

const FriendsList: React.FC = () => {
  console.log('FriendsList - Component rendering');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('FriendsList - Profile:', profile);
    if (profile) {
      loadFriends();
    } else {
      console.log('FriendsList - No profile, setting loading to false');
      setLoading(false);
    }
  }, [profile]);

  const loadFriends = async () => {
    if (!profile) {
      console.log('FriendsList - No profile, returning');
      return;
    }

    try {
      console.log('FriendsList - Loading friends for profile:', profile.id);
      setLoading(true);
      
      // Obtener las friendships aceptadas
      const { data: friendshipsData, error: friendshipsError } = await supabase
        .from('friendships')
        .select('id, friend_id, user_id')
        .or(`user_id.eq.${profile.id},friend_id.eq.${profile.id}`)
        .eq('status', 'accepted');

      if (friendshipsError) {
        console.error('Error loading friendships:', friendshipsError);
        setError('Error al cargar las amistades');
        setLoading(false);
        return;
      }

      if (friendshipsData && friendshipsData.length > 0) {
        // Extraer los IDs de los amigos
        const friendIds = friendshipsData.map((friendship) => {
          return friendship.user_id === profile.id 
            ? friendship.friend_id 
            : friendship.user_id;
        });

        // Obtener los perfiles de los amigos
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, city, created_at')
          .in('id', friendIds);

        if (friendProfiles) {
          const friendsList: Friend[] = friendProfiles.map((profile) => ({
            id: profile.id,
            full_name: profile.full_name || 'Usuario',
            avatar_url: profile.avatar_url || null,
            city: profile.city ?? null,
            created_at: profile.created_at
          }));
          setFriends(friendsList);
        }
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      setError('Error al cargar los amigos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar amigos por búsqueda
  const filteredFriends = friends.filter((friend) =>
    friend.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.city && friend.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-6"></div>
          <p className="text-white text-lg font-semibold">Cargando tus amigos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-8 h-8 text-red-300" />
          </div>
          <p className="text-red-200 mb-6 text-lg">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md">
          <p className="text-white mb-6 text-lg">No se encontró el perfil del usuario</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Encabezado Simple */}
      <div className="flex items-center gap-3 mb-8">
        <HeartIcon className="w-8 h-8 text-stone-800" />
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800">Mis amigos</h1>
      </div>

      {/* Controles y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        {friends.length > 0 && (
          <>
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Buscar por nombre o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              />
            </div>
            <button
              onClick={() => navigate('/dashboard/users')}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/20 whitespace-nowrap"
            >
              <UserPlusIcon className="w-5 h-5" />
              Buscar más amigos
            </button>
          </>
        )}
      </div>

      {/* Lista de Amigos Mejorada */}
      {friends.length > 0 ? (
        <>
          {filteredFriends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFriends.map((friend, index) => (
                <Link
                  key={friend.id}
                  to={`/dashboard/users/${friend.id}`}
                  className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-white/20 hover:border-white/40 relative overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Efecto de brillo al hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative z-10">
                    {/* Avatar con indicador online */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url}
                            alt={friend.full_name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {friend.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        {/* Indicador online (simulado - puedes conectarlo con datos reales) */}
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-3 border-white rounded-full shadow-md"></div>
                      </div>
                    </div>

                    {/* Información */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-rose-100 transition-colors">
                        {friend.full_name}
                      </h3>
                      
                      {friend.city && (
                        <div className="flex items-center justify-center gap-1 text-white/70 text-sm mb-3">
                          <MapPinIcon className="w-4 h-4" />
                          <span className="truncate">{friend.city}</span>
                        </div>
                      )}

                      {/* Badge de amistad */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/30 backdrop-blur-sm rounded-full border border-rose-400/30">
                        <HeartIcon className="w-4 h-4 text-rose-300" />
                        <span className="text-xs font-semibold text-white">Amigos</span>
                      </div>

                      {/* Botón de acción */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-center gap-2 text-white/80 text-sm group-hover:text-white transition-colors">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span className="font-medium">Ver perfil</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
              <MagnifyingGlassIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No se encontraron amigos
              </h3>
              <p className="text-white/70 mb-4">
                Intenta con otro término de búsqueda
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-white/90 hover:text-white underline text-sm font-medium"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-500/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="w-12 h-12 text-white/60" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Aún no tienes amigos
          </h3>
          <p className="text-white/80 mb-8 text-lg leading-relaxed">
            Explora perfiles y envía solicitudes de amistad para comenzar a construir tu red de conexiones en Jubilalia.
          </p>
          <button
            onClick={() => navigate('/dashboard/users')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Buscar Personas
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
