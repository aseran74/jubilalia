import React from 'react';
import { DISTANCE_OPTIONS, formatDistanceLabel, isUnlimitedDistance } from '../../utils/geo';

interface DistanceFilterProps {
  value: number;
  onChange: (km: number) => void;
}

const DistanceFilter: React.FC<DistanceFilterProps> = ({ value, onChange }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-700">
      Distancia máxima: {formatDistanceLabel(value)}
    </label>
    <div className="flex flex-wrap gap-2">
      {DISTANCE_OPTIONS.map((option) => {
        const selected = isUnlimitedDistance(option.km)
          ? isUnlimitedDistance(value)
          : value === option.km;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.km)}
            className={`min-h-11 rounded-full px-3.5 py-2 text-sm font-semibold ${
              selected
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

export default DistanceFilter;
