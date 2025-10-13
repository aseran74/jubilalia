import React from 'react';
import { MapPin, Phone, MessageCircle, Home, Users } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface PersonCardProps {
  person: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    city?: string;
    address?: string;
    state?: string;
    postal_code?: string;
    bio?: string;
    date_of_birth?: string;
    gender?: string;
    interests?: string[];
    phone?: string;
    whatsapp?: string;
    has_room_to_share?: boolean;
    wants_to_find_roommate?: boolean;
  };
  onClick?: () => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onClick }) => {
  const [showContactOptions, setShowContactOptions] = React.useState(false);

  console.log('PersonCard - person data:', {
    name: person.full_name,
    whatsapp: person.whatsapp,
    phone: person.phone,
    has_room: person.has_room_to_share,
    wants_roommate: person.wants_to_find_roommate
  });

  const age = person.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(person.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (person.whatsapp) {
      const cleanNumber = person.whatsapp.replace(/\s+/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (person.phone) {
      window.location.href = `tel:${person.phone}`;
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/dashboard/messages?user=${person.id}`;
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Mostrar opciones de contacto
    setShowContactOptions(!showContactOptions);
  };

  const handleContactMethod = (method: string, e: React.MouseEvent) => {
    e.stopPropagation();

    switch (method) {
      case 'whatsapp':
        if (person.whatsapp) {
          const cleanNumber = person.whatsapp.replace(/\s+/g, '');
          window.open(`https://wa.me/${cleanNumber}`, '_blank');
        }
        break;
      case 'phone':
        if (person.phone) {
          window.location.href = `tel:${person.phone}`;
        }
        break;
      case 'email':
        window.location.href = `mailto:${person.email}`;
        break;
      case 'chat':
        window.location.href = `/dashboard/messages?user=${person.id}`;
        break;
    }

    setShowContactOptions(false);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* Header con avatar y nombre */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {person.avatar_url ? (
              <img
                src={person.avatar_url}
                alt={person.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                {person.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {person.full_name}
            </h3>
            {age && (
              <p className="text-gray-600 text-sm">{age} años</p>
            )}
            {person.gender && (
              <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                person.gender === 'male' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}>
                {person.gender === 'male' ? 'Hombre' : 'Mujer'}
              </span>
            )}
          </div>
        </div>

        {/* Dirección */}
        {(person.address || person.city) && (
          <div className="mb-4 text-sm">
            <div className="flex items-start text-gray-600">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
              <div>
                {person.address && <div>{person.address}</div>}
                <div>
                  {person.postal_code && `${person.postal_code}, `}
                  {person.city}
                  {person.state && `, ${person.state}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bio */}
        {person.bio && (
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
            {person.bio}
          </p>
        )}

        {/* Estado de búsqueda */}
        <div className="mb-4 flex flex-wrap gap-2">
          {person.has_room_to_share && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Home className="w-3 h-3 mr-1" />
              Tiene habitación disponible
            </span>
          )}
          {person.wants_to_find_roommate && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Users className="w-3 h-3 mr-1" />
              Busca compañero/a
            </span>
          )}
        </div>

        {/* Intereses */}
        {person.interests && person.interests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Intereses</h4>
            <div className="flex flex-wrap gap-2">
              {person.interests.slice(0, 4).map(interest => (
                <span key={interest} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                  {interest}
                </span>
              ))}
              {person.interests.length > 4 && (
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                  +{person.interests.length - 4} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Opciones de contacto */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="relative">
          <button
            onClick={handleContactClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Contactar
          </button>

          {/* Menú desplegable */}
          {showContactOptions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Elige cómo contactar:</h4>
                <div className="space-y-2">
                  {person.whatsapp && (
                    <button
                      onClick={(e) => handleContactMethod('whatsapp', e)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <FaWhatsapp className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">WhatsApp</span>
                    </button>
                  )}
                  {person.phone && (
                    <button
                      onClick={(e) => handleContactMethod('phone', e)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Phone className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-700">Teléfono</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => handleContactMethod('chat', e)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-700">Chat interno</span>
                  </button>
                  <button
                    onClick={(e) => handleContactMethod('email', e)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">Email</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonCard;

