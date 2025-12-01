import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  FileText, 
  Calendar, 
  Home, 
  Building2, 
  DollarSign,
  Loader2,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';

interface UserContentProps {
  userId: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  published_at: string | null;
  created_at: string | null;
  category: {
    name: string;
    color: string;
  } | null;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  city: string;
  price: number | null;
  is_free: boolean | null;
  images: string[];
}

interface Property {
  id: string;
  title: string;
  listing_type: string;
  city: string;
  price: number | null;
  price_type: string | null;
  property_type: string;
  bedrooms: number | null;
  images: string[];
}

interface Room {
  id: string;
  title: string;
  city: string;
  price: number | null;
  images: string[];
}

const UserContent: React.FC<UserContentProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'activities' | 'properties'>('posts');
  const [loading, setLoading] = useState(true);
  
  // Datos
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [userId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPosts(),
        fetchActivities(),
        fetchProperties(),
        fetchRooms()
      ]);
    } catch (error) {
      console.error('Error fetching user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          category:post_categories(*)
        `)
        .eq('profile_id', userId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data: activitiesData, error } = await supabase
        .from('activities')
        .select('*')
        .eq('profile_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Obtener imágenes de actividades
      if (activitiesData && activitiesData.length > 0) {
        const activityIds = activitiesData.map(a => a.id);
        const { data: imagesData } = await supabase
          .from('activity_images')
          .select('activity_id, image_url, image_order')
          .in('activity_id', activityIds)
          .order('image_order', { ascending: true });

        const imagesByActivity: Record<string, string[]> = {};
        if (imagesData) {
          imagesData.forEach(img => {
            if (!imagesByActivity[img.activity_id]) {
              imagesByActivity[img.activity_id] = [];
            }
            imagesByActivity[img.activity_id].push(img.image_url);
          });
        }

        const activitiesWithImages = activitiesData.map(activity => ({
          ...activity,
          images: imagesByActivity[activity.id] || []
        }));

        setActivities(activitiesWithImages);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .eq('profile_id', userId)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const listingIds = data.map(p => p.id);
        const { data: imagesData } = await supabase
          .from('property_images')
          .select('listing_id, image_url')
          .in('listing_id', listingIds)
          .order('image_order', { ascending: true });

        const imagesByProperty: Record<string, string[]> = {};
        if (imagesData) {
          imagesData.forEach(img => {
            if (!imagesByProperty[img.listing_id]) {
              imagesByProperty[img.listing_id] = [];
            }
            imagesByProperty[img.listing_id].push(img.image_url);
          });
        }

        const propertiesWithImages = data.map(property => ({
          ...property,
          images: imagesByProperty[property.id] || []
        }));

        setProperties(propertiesWithImages);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .eq('profile_id', userId)
        .eq('listing_type', 'room_rental')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const listingIds = data.map(r => r.id);
        const { data: imagesData } = await supabase
          .from('property_images')
          .select('listing_id, image_url')
          .in('listing_id', listingIds)
          .order('image_order', { ascending: true });

        const imagesByRoom: Record<string, string[]> = {};
        if (imagesData) {
          imagesData.forEach(img => {
            if (!imagesByRoom[img.listing_id]) {
              imagesByRoom[img.listing_id] = [];
            }
            imagesByRoom[img.listing_id].push(img.image_url);
          });
        }

        const roomsWithImages = data.map(room => ({
          ...room,
          images: imagesByRoom[room.id] || []
        }));

        setRooms(roomsWithImages);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'posts'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'activities'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Actividades ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'properties'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="w-4 h-4 inline mr-2" />
            Propiedades ({properties.length + rooms.length})
          </button>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="p-6">
        {/* Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No hay posts publicados</p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {post.category && (
                      <span
                        className="px-2 py-1 text-xs font-medium rounded"
                        style={{
                          backgroundColor: post.category.color + '20',
                          color: post.category.color
                        }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(post.published_at || post.created_at || new Date().toISOString())}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  )}
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  </div>
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.view_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comment_count || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Actividades */}
        {activeTab === 'activities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No hay actividades publicadas</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  {activity.images && activity.images.length > 0 && (
                    <img
                      src={activity.images[0]}
                      alt={activity.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {activity.activity_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{activity.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{activity.city}</span>
                      <span className="font-semibold text-green-600">
                        {activity.is_free ? 'Gratis' : `€${activity.price || 0}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Propiedades (Habitaciones, Alquiler, Venta) */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Habitaciones */}
            {rooms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Habitaciones ({rooms.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => navigate(`/dashboard/rooms/${room.id}`)}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {room.images && room.images.length > 0 && (
                        <img
                          src={room.images[0]}
                          alt={room.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{room.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{room.city}</p>
                        <p className="text-lg font-bold text-green-600">€{room.price || 0}/mes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Propiedades de Alquiler */}
            {properties.filter(p => p.listing_type === 'property_rental').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Alquiler ({properties.filter(p => p.listing_type === 'property_rental').length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties
                    .filter(p => p.listing_type === 'property_rental')
                    .map((property) => (
                      <div
                        key={property.id}
                        onClick={() => navigate(`/dashboard/properties/rental/${property.id}`)}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      >
                        {property.images && property.images.length > 0 && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{property.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{property.city}</p>
                          {property.bedrooms && (
                            <p className="text-sm text-gray-500 mb-2">{property.bedrooms} habitaciones</p>
                          )}
                          <p className="text-lg font-bold text-green-600">
                            €{property.price || 0}{property.price_type === 'monthly' ? '/mes' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Propiedades de Venta */}
            {properties.filter(p => p.listing_type === 'property_purchase').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Venta ({properties.filter(p => p.listing_type === 'property_purchase').length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties
                    .filter(p => p.listing_type === 'property_purchase')
                    .map((property) => (
                      <div
                        key={property.id}
                        onClick={() => navigate(`/dashboard/properties/sale/${property.id}`)}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      >
                        {property.images && property.images.length > 0 && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{property.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{property.city}</p>
                          {property.bedrooms && (
                            <p className="text-sm text-gray-500 mb-2">{property.bedrooms} habitaciones</p>
                          )}
                          <p className="text-lg font-bold text-green-600">€{property.price || 0}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {rooms.length === 0 && properties.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No hay propiedades publicadas</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default UserContent;

