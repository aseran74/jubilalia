import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import RoomCard from './RoomCard';
import PropertySaleCard from './PropertySaleCard';
import PropertyRentalCard from './PropertyRentalCard';
import GroupCard from './GroupCard';
import ActivityCard from './ActivityCard';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const FeaturedContent: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [saleProperties, setSaleProperties] = useState<any[]>([]);
  const [rentalProperties, setRentalProperties] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true);

      // Fetch featured rooms (limit 3)
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch featured sale properties (limit 3)
      const { data: saleData } = await supabase
        .from('property_listings')
        .select('*')
        .eq('listing_type', 'property_purchase')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch featured rental properties (limit 3)
      const { data: rentalData } = await supabase
        .from('property_listings')
        .select('*')
        .eq('listing_type', 'property_rental')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch featured groups (limit 3)
      const { data: groupsData } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch featured activities (limit 3)
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(3);

      setRooms(roomsData || []);
      setSaleProperties(saleData || []);
      setRentalProperties(rentalData || []);
      setGroups(groupsData || []);
      setActivities(activitiesData || []);

    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando contenido destacado...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Habitaciones Destacadas */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <HomeIcon className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Habitaciones Destacadas</h2>
            </div>
            <Link
              to="/dashboard/rooms"
              className="flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              Ver todas
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay habitaciones disponibles en este momento</p>
            </div>
          )}
        </section>

        {/* Propiedades en Venta */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Propiedades en Venta</h2>
            </div>
            <Link
              to="/dashboard/properties/sale"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {saleProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saleProperties.map((property) => (
                <PropertySaleCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay propiedades en venta disponibles en este momento</p>
            </div>
          )}
        </section>

        {/* Propiedades en Alquiler */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Propiedades en Alquiler</h2>
            </div>
            <Link
              to="/dashboard/properties/rental"
              className="flex items-center text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver todas
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {rentalProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentalProperties.map((property) => (
                <PropertyRentalCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay propiedades en alquiler disponibles en este momento</p>
            </div>
          )}
        </section>

        {/* Grupos Destacados */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Grupos Destacados</h2>
            </div>
            <Link
              to="/dashboard/groups"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay grupos disponibles en este momento</p>
            </div>
          )}
        </section>

        {/* Actividades Destacadas */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Actividades Destacadas</h2>
            </div>
            <Link
              to="/dashboard/activities"
              className="flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              Ver todas
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay actividades disponibles en este momento</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default FeaturedContent;
