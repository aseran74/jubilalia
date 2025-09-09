import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Calendar, MapPin, Phone, Mail } from 'lucide-react';

interface Participant {
  id: string;
  profile_id: string;
  activity_id: string;
  status: string;
  joined_at: string;
  notes?: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
  } | null;
}

interface ActivityParticipantsProps {
  activityId: string;
  isOrganizer: boolean;
}

const ActivityParticipants: React.FC<ActivityParticipantsProps> = ({ 
  activityId, 
  isOrganizer 
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('activity_participants')
        .select(`
          id,
          profile_id,
          activity_id,
          status,
          joined_at,
          notes,
          profiles!activity_participants_profile_id_fkey(
            id,
            full_name,
            avatar_url,
            bio,
            city,
            country,
            phone,
            email
          )
        `)
        .eq('activity_id', activityId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // Transformar los datos para convertir profiles de array a objeto
      const transformedData = (data || []).map(participant => ({
        ...participant,
        profiles: participant.profiles[0] || null
      }));

      setParticipants(transformedData);
    } catch (err: any) {
      console.error('Error fetching participants:', err);
      setError(err.message || 'Error al cargar los participantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchParticipants();
    }
  }, [activityId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'attended':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      case 'attended':
        return 'Asistió';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchParticipants}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aún no hay participantes en esta actividad</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Participantes ({participants.length})
        </h3>
        <button
          onClick={fetchParticipants}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {participant.profiles?.avatar_url ? (
                  <img
                    src={participant.profiles.avatar_url}
                    alt={participant.profiles.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Información del participante */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {participant.profiles?.full_name || 'Usuario desconocido'}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(participant.status)}`}
                  >
                    {getStatusText(participant.status)}
                  </span>
                </div>

                {participant.profiles?.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {participant.profiles.bio}
                  </p>
                )}

                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Se unió {formatDate(participant.joined_at)}</span>
                  </div>
                  
                  {participant.profiles?.city && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{participant.profiles.city}</span>
                    </div>
                  )}
                </div>

                {/* Información de contacto (solo para organizadores) */}
                {isOrganizer && participant.profiles && (participant.profiles.phone || participant.profiles.email) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {participant.profiles.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          <span>{participant.profiles.phone}</span>
                        </div>
                      )}
                      {participant.profiles.email && (
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          <span>{participant.profiles.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notas del participante */}
                {participant.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <strong>Notas:</strong> {participant.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityParticipants;
