import React from 'react';

interface AmenitiesFilterProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
  className?: string;
}

const AMENITIES_OPTIONS = [
  { id: 'parking', label: 'Parking', icon: '🚗' },
  { id: 'elevator', label: 'Ascensor', icon: '🛗' },
  { id: 'balcony', label: 'Balcón', icon: '🏠' },
  { id: 'terrace', label: 'Terraza', icon: '🌿' },
  { id: 'garden', label: 'Jardín', icon: '🌱' },
  { id: 'pool', label: 'Piscina', icon: '🏊' },
  { id: 'gym', label: 'Gimnasio', icon: '💪' },
  { id: 'security', label: 'Seguridad 24h', icon: '🔒' },
  { id: 'air_conditioning', label: 'Aire Acondicionado', icon: '❄️' },
  { id: 'heating', label: 'Calefacción', icon: '🔥' },
  { id: 'furnished', label: 'Amueblado', icon: '🛋️' },
  { id: 'pet_friendly', label: 'Mascotas', icon: '🐕' },
  { id: 'smoking_allowed', label: 'Fumar', icon: '🚬' },
  { id: 'internet', label: 'Internet', icon: '📶' },
  { id: 'dishwasher', label: 'Lavavajillas', icon: '🍽️' },
  { id: 'washing_machine', label: 'Lavadora', icon: '🧺' },
];

const AmenitiesFilter: React.FC<AmenitiesFilterProps> = ({
  selectedAmenities,
  onAmenitiesChange,
  className = ""
}) => {
  const handleAmenityToggle = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onAmenitiesChange(selectedAmenities.filter(id => id !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium text-gray-700">Amenidades</label>
      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
        {AMENITIES_OPTIONS.map(amenity => (
          <label
            key={amenity.id}
            className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
              selectedAmenities.includes(amenity.id)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedAmenities.includes(amenity.id)}
              onChange={() => handleAmenityToggle(amenity.id)}
              className="sr-only"
            />
            <span className="text-sm">{amenity.icon}</span>
            <span className="text-xs font-medium">{amenity.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default AmenitiesFilter;
