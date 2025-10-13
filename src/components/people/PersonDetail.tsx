import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MapPin, Phone, Mail, Home, Users, ArrowLeft, Briefcase } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface Person {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  city?: string;
  address?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  interests?: string[];
  occupation?: string;
  phone?: string;
  whatsapp?: string;
  has_room_to_share?: boolean;
  wants_to_find_roommate?: boolean;
}

const PersonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPerson();
    }
  }, [id]);

  const fetchPerson = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPerson(data);
    } catch (error) {
      console.error('Error fetching person:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Socio no encontrado</h2>
          <button
            onClick={() => navigate('/dashboard/users')}
            className="text-blue-600 hover:text-blue-700"
          >
            Volver a buscar gente
          </button>
        </div>
      </div>
    );
  }

  const age = person.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(person.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleWhatsAppClick = () => {
    if (person.whatsapp) {
      const cleanNumber = person.whatsapp.replace(/\s+/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (person.phone) {
      window.location.href = `tel:${person.phone}`;
    }
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${person.email}`;
  };

  const handleMessageClick = () => {
    window.location.href = `/dashboard/messages?user=${person.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/users')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a buscar gente
          </button>
        </div>

        {/* Perfil */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header con avatar */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {person.avatar_url ? (
                  <img
                    src={person.avatar_url}
                    alt={person.full_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-4xl border-4 border-white shadow-lg">
                    {person.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{person.full_name}</h1>
                {age && <p className="text-xl opacity-90">{age} años</p>}
                {person.gender && (
                  <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                    {person.gender === 'male' ? 'Hombre' : person.gender === 'female' ? 'Mujer' : 'Otro'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8 space-y-6">
            {/* Estado de búsqueda - EXCLUYENTE */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado de búsqueda</h3>
              {person.has_room_to_share && !person.wants_to_find_roommate && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Tiene habitación disponible</p>
                    <p className="text-sm text-green-700">Quiere ser anfitrión y compartir su vivienda</p>
                  </div>
                </div>
              )}
              {person.wants_to_find_roommate && !person.has_room_to_share && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Busca compañero/a</p>
                    <p className="text-sm text-blue-700">Quiere ser huésped y compartir gastos y experiencias</p>
                  </div>
                </div>
              )}
              {!person.has_room_to_share && !person.wants_to_find_roommate && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sin preferencias activas</p>
                    <p className="text-sm text-gray-600">No está buscando activamente compartir vivienda</p>
                  </div>
                </div>
              )}
            </div>

            {/* Biografía */}
            {person.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre mí</h3>
                <p className="text-gray-700 leading-relaxed">{person.bio}</p>
              </div>
            )}

            {/* Ubicación */}
            {(person.address || person.city) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
                <div className="flex items-start text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-400" />
                  <div>
                    {person.address && <div>{person.address}</div>}
                    <div>
                      {person.postal_code && `${person.postal_code}, `}
                      {person.city}
                      {person.state && `, ${person.state}`}
                    </div>
                    {person.country && <div className="text-gray-500 text-sm">{person.country}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Ocupación */}
            {person.occupation && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ocupación</h3>
                <div className="flex items-center text-gray-700">
                  <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                  {person.occupation}
                </div>
              </div>
            )}

            {/* Intereses */}
            {person.interests && person.interests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Intereses</h3>
                <div className="flex flex-wrap gap-2">
                  {person.interests.map(interest => (
                    <span key={interest} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Opciones de contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactar</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {person.whatsapp && (
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaWhatsapp className="w-6 h-6" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>
                )}
                {person.phone && (
                  <button
                    onClick={handlePhoneClick}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Phone className="w-6 h-6" />
                    <span className="text-sm font-medium">Teléfono</span>
                  </button>
                )}
                <button
                  onClick={handleEmailClick}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-6 h-6" />
                  <span className="text-sm font-medium">Email</span>
                </button>
                <button
                  onClick={handleMessageClick}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Mail className="w-6 h-6" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;

