import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { CheckCircle, X } from 'lucide-react';
import RoomDetailMap from '../maps/RoomDetailMap';
import ImageGallery from '../ImageGallery';
import NearbyPlaces from '../common/NearbyPlaces';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  latitude?: number;
  longitude?: number;
  created_at: string;
  status: string;
  author_id: string;
  url?: string;
  recommended_occupants?: number;
  price_per_person?: number;
  coliving_data?: {
    total_spots: number;
    available_spots: number;
    community_description: string;
    housing_type: 'individual_apartments' | 'shared_house';
    price_per_apartment?: number;
    price_per_unit?: number;
    show_members_publicly?: boolean;
    members?: Array<{
      id: string;
      full_name: string;
      avatar_url?: string;
      joined_at: string;
    }>;
  };
}

interface Author {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchRelatedPosts = async () => {
    if (!property) return;

    setLoadingPosts(true);
    try {
      // Determinar categorías según el tipo de propiedad
      const isRental = window.location.pathname.includes('/rental');
      const categoryNames = isRental ? ['Coliving alquiler'] : ['Coliving Venta'];
      
      // Obtener IDs de categorías
      const { data: categories } = await supabase
        .from('post_categories')
        .select('id')
        .in('name', categoryNames);

      if (!categories || categories.length === 0) {
        setRelatedPosts([]);
        return;
      }

      const categoryIds = categories.map(cat => cat.id);

      // Buscar posts relacionados:
      // 1. Que tengan el título de la propiedad en el título del post
      // 2. O que tengan el título de la propiedad en el contenido del post
      // 3. Y que sean de las categorías de Coliving
      const titlePattern = `%${property.title}%`;
      
      // Hacer dos consultas separadas y combinar resultados
      const [titlePosts, contentPosts] = await Promise.all([
        supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            excerpt,
            published_at,
            created_at,
            tags,
            category:post_categories(id, name, color, icon),
            author:profiles!posts_profile_id_fkey(
              id,
              full_name,
              avatar_url
            )
          `)
          .in('category_id', categoryIds)
          .eq('is_published', true)
          .ilike('title', titlePattern)
          .order('published_at', { ascending: false })
          .limit(10),
        supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            excerpt,
            published_at,
            created_at,
            tags,
            category:post_categories(id, name, color, icon),
            author:profiles!posts_profile_id_fkey(
              id,
              full_name,
              avatar_url
            )
          `)
          .in('category_id', categoryIds)
          .eq('is_published', true)
          .ilike('content', titlePattern)
          .order('published_at', { ascending: false })
          .limit(10)
      ]);

      // Combinar resultados y eliminar duplicados
      const allPosts = [...(titlePosts.data || []), ...(contentPosts.data || [])];
      const uniquePosts = Array.from(
        new Map(allPosts.map(post => [post.id, post])).values()
      )
        .sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at).getTime();
          const dateB = new Date(b.published_at || b.created_at).getTime();
          return dateB - dateA;
        })
        .slice(0, 10);

      const error = titlePosts.error || contentPosts.error;
      const posts = uniquePosts;

      if (error) {
        console.error('Error fetching related posts:', error);
        setRelatedPosts([]);
        return;
      }

      setRelatedPosts(posts || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      setRelatedPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    if (property) {
      fetchRelatedPosts();
    }
  }, [property]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      
      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('property_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('image_url')
        .eq('listing_id', id)
        .order('order_index', { ascending: true });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      }

      // Fetch amenities
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from('property_amenities')
        .select('amenity_name')
        .eq('listing_id', id)
        .eq('is_available', true);

      if (amenitiesError) {
        console.error('Error fetching amenities:', amenitiesError);
      }

      // Fetch coliving data if property is Comunidad Coliving
      let colivingData = null;
      if (propertyData.property_type === 'Comunidad Coliving') {
        const { data: coliving, error: colivingError } = await supabase
          .from('coliving_requirements')
          .select('*')
          .eq('listing_id', id)
          .single();

        if (!colivingError && coliving) {
          colivingData = coliving;

          // Cargar miembros si show_members_publicly es true
          if (coliving.show_members_publicly) {
            const { data: membersData, error: membersError } = await supabase
              .from('coliving_members')
              .select('id, profile_id, joined_at')
              .eq('listing_id', id)
              .eq('status', 'active');

            if (!membersError && membersData && membersData.length > 0) {
              // Obtener los perfiles de los miembros
              const profileIds = membersData.map(m => m.profile_id);
              const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', profileIds);

              if (!profilesError && profilesData) {
                const profilesMap = new Map(profilesData.map(p => [p.id, p]));
                colivingData.members = membersData.map(m => {
                  const profile = profilesMap.get(m.profile_id);
                  return {
                    id: m.profile_id,
                    full_name: profile?.full_name || 'Usuario',
                    avatar_url: profile?.avatar_url,
                    joined_at: m.joined_at
                  };
                });
              }
            }
          }
        }
      }

      // Add images, amenities and coliving data to property data
      const propertyWithImages = {
        ...propertyData,
        images: imagesData?.map(img => img.image_url) || [],
        amenities: amenitiesData?.map(amenity => amenity.amenity_name) || [],
        coliving_data: colivingData
      };

      setProperty(propertyWithImages);

      // Fetch author details
      if (propertyData.profile_id) {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', propertyData.profile_id)
          .single();

        if (!authorError) {
          setAuthor(authorData);
        }
      }
    } catch (error: any) {
      console.error('Error fetching property:', error);
      setError(error.message || 'Error al cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando propiedad...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Propiedad no encontrada'}
          </div>
          <button
            onClick={() => navigate('/dashboard/properties/sale')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a Propiedades
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'apartment': 'Apartamento',
      'house': 'Casa',
      'villa': 'Villa',
      'studio': 'Estudio'
    };
    return types[type] || type;
  };

  const handleCreatePost = async () => {
    if (!postText.trim() || !profile || !property) return;

    setIsPosting(true);
    try {
      // Usar una categoría existente según el tipo de propiedad
      // Determinar el tipo de listing desde la URL o propiedad
      const isRental = window.location.pathname.includes('/rental');
      const isSale = window.location.pathname.includes('/sale');
      
      let categoryName = 'Misceláneo'; // Categoría por defecto
      if (isRental) {
        categoryName = 'Coliving alquiler';
      } else if (isSale) {
        categoryName = 'Coliving Venta';
      }

      // Buscar la categoría existente
      let categoryId: string | null = null;
      const { data: category, error: categoryError } = await supabase
        .from('post_categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      if (categoryError || !category) {
        // Si no encontramos la categoría específica, usar Misceláneo
        const { data: miscCategory } = await supabase
          .from('post_categories')
          .select('id')
          .eq('name', 'Misceláneo')
          .single();
        
        if (!miscCategory) {
          throw new Error('No se pudo encontrar una categoría válida para el post');
        }
        
        categoryId = miscCategory.id;
      } else {
        categoryId = category.id;
      }

      // Crear el post en la tabla de posts
      // Incluir información de la propiedad en el contenido del post con el ID para poder hacerlo clickable
      const propertyType = isRental ? 'rental' : 'sale';
      const postContent = `${postText.trim()}\n\n[Propiedad relacionada: ${property.title} - ${property.location} | ID:${property.id} | TYPE:${propertyType}]`;
      
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          profile_id: profile.id,
          title: `Post sobre ${property.title}`,
          content: postContent,
          excerpt: postText.trim().substring(0, 200) + '...',
          category_id: categoryId,
          tags: ['propiedad', 'coliving', property.property_type.toLowerCase()],
          is_published: true,
          published_at: new Date().toISOString()
        });

      if (postError) throw postError;

      // Limpiar el formulario y recargar posts relacionados
      setPostText('');
      await fetchRelatedPosts();
      
      // Mostrar mensaje de éxito
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert('Error al publicar el post: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/properties/sale')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a Propiedades
          </button>
        </div>

        {/* Galería de imágenes - Nuevo componente */}
        {property.images && property.images.length > 0 && (
          <ImageGallery images={property.images} title={property.title} />
        )}

        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                  {getPropertyTypeLabel(property.property_type)}
                </span>
                <span className="flex items-center">
                  <HomeIcon className="w-4 h-4 mr-1" />
                  {property.bedrooms} habitaciones
                </span>
                <span className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  {property.bathrooms} baños
                </span>
                <span className="flex items-center">
                  <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                  {property.area}m²
                </span>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-6">
              <div className="text-3xl font-bold text-blue-600">
                {property.price.toLocaleString('es-ES')}€
              </div>
              <div className="text-sm text-gray-600 text-center">
                Precio
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Coliving Information */}
            {property.property_type === 'Comunidad Coliving' && property.coliving_data && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏘️</span>
                  Información de la Comunidad Coliving
                </h2>
                
                <div className="space-y-6">
                  {/* Plazas disponibles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="text-sm text-gray-600 mb-1">Total de plazas</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {property.coliving_data.total_spots}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="text-sm text-gray-600 mb-1">Plazas disponibles</div>
                      <div className="text-2xl font-bold text-green-600">
                        {property.coliving_data.available_spots}
                      </div>
                    </div>
                  </div>

                  {/* Tipo de estructura */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Tipo de estructura</div>
                    <div className="flex items-center gap-2">
                      {property.coliving_data.housing_type === 'individual_apartments' ? (
                        <>
                          <span className="text-xl">🏢</span>
                          <span className="text-gray-900 font-medium">Apartamentos individuales</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🏠</span>
                          <span className="text-gray-900 font-medium">Casa grupal compartida</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {property.coliving_data.housing_type === 'individual_apartments' 
                        ? 'Cada persona/pareja tiene su propio apartamento completo con cocina y baño privados'
                        : 'Habitaciones privadas con espacios comunes compartidos (cocina, sala, baños)'
                      }
                    </p>
                  </div>

                  {/* Precios por unidad */}
                  {(property.coliving_data.price_per_apartment || property.coliving_data.price_per_unit) && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">💰 Precio por unidad</div>
                      <div className="text-2xl font-bold text-green-600">
                        {property.coliving_data.price_per_apartment 
                          ? `${property.coliving_data.price_per_apartment.toLocaleString('es-ES')}€ / apartamento`
                          : `${property.coliving_data.price_per_unit?.toLocaleString('es-ES')}€ / unidad`
                        }
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {property.coliving_data.price_per_apartment 
                          ? 'Precio de compra de cada apartamento individual'
                          : 'Precio de compra de cada unidad/habitación'
                        }
                      </p>
                    </div>
                  )}

                  {/* Descripción de la comunidad */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="text-sm font-medium text-gray-700 mb-3">Sobre la comunidad</div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {property.coliving_data.community_description}
                    </p>
                  </div>

                  {/* Miembros de la comunidad / Miembros apuntados */}
                  {property.coliving_data.show_members_publicly && property.coliving_data.members && property.coliving_data.members.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                        <span>👥</span>
                        <span>
                          {window.location.pathname.includes('/sale/') 
                            ? `Miembros Apuntados (${property.coliving_data.members.length})`
                            : `Miembros de la Comunidad (${property.coliving_data.members.length})`
                          }
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.coliving_data.members.map(member => (
                          <div 
                            key={member.id}
                            className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            {member.avatar_url ? (
                              <img 
                                src={member.avatar_url} 
                                alt={member.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-300 flex items-center justify-center">
                                <span className="text-purple-700 font-medium">
                                  {member.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {member.full_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Desde {new Date(member.joined_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detalles de la Propiedad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Tipo: {getPropertyTypeLabel(property.property_type)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <HomeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Habitaciones: {property.bedrooms}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Baños: {property.bathrooms}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Superficie: {property.area}m²</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Publicado: {formatDate(property.created_at)}</span>
                </div>
                {property.recommended_occupants && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Personas recomendadas: {property.recommended_occupants}</span>
                  </div>
                )}
                {property.price_per_person && (
                  <div className="flex items-center space-x-3">
                    <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Precio por persona: {property.price_per_person.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€/mes</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    property.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenidades */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Amenidades
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ubicación
              </h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <RoomDetailMap
                  latitude={property.latitude || 40.4168}
                  longitude={property.longitude || -3.7038}
                  title={property.title}
                  location={property.location}
                />
              </div>
            </div>

            {/* Actividades Cercanas */}
            <NearbyPlaces
              latitude={property.latitude || 40.4168}
              longitude={property.longitude || -3.7038}
              radius={1000}
              className="mb-6"
            />

            {/* Posts Relacionados */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Posts relacionados con esta vivienda
              </h2>
              
              {/* Información de la propiedad para contexto */}
              {property.recommended_occupants && property.price_per_person && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Información de la propiedad:</strong> Esta vivienda es apta para {property.recommended_occupants} personas. 
                    El precio por persona es de {property.price_per_person.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€/mes.
                  </p>
                </div>
              )}

              {/* Formulario para crear post */}
              {profile && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escribe un post relacionado con esta vivienda
                  </label>
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Ejemplo: Somos 6, 3 parejas de Bilbao y este palacio señorial del siglo es apto para 8, solo faltan 2 personas o 1 pareja. El precio se quedaría en 130€/mes persona"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={handleCreatePost}
                    disabled={!postText.trim() || isPosting}
                    className="mt-3 w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    {isPosting ? 'Publicando...' : 'Publicar Post'}
                  </button>
                </div>
              )}

              {/* Lista de posts relacionados */}
              <div className="space-y-4">
                {loadingPosts ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Cargando posts...</p>
                  </div>
                ) : relatedPosts.length > 0 ? (
                  relatedPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        {post.author?.avatar_url ? (
                          <img
                            src={post.author.avatar_url}
                            alt={post.author.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {post.author?.full_name || 'Usuario'}
                            </span>
                            <span className="text-sm text-gray-500">
                              • {new Date(post.published_at || post.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                          <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
                            {post.content}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {post.tags.map((tag: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                            className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Leer más →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 italic">
                      Aún no hay posts relacionados con esta vivienda. Sé el primero en publicar uno.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Author */}
            {author && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contactar con el propietario
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    {author.avatar_url ? (
                      <img
                        src={author.avatar_url}
                        alt={author.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {author.full_name || 'Usuario'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Propietario
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {property.url && (
                    <button 
                      onClick={() => window.open(property.url, '_blank')}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                      Visitar Sitio Web
                    </button>
                  )}
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    Llamar
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Enviar Mensaje
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
