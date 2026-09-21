import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/solid';

interface MapFilterButtonProps {
  count?: number;
  onClick: () => void;
}

const MapFilterButton: React.FC<MapFilterButtonProps> = ({ count = 0, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="pointer-events-auto absolute bottom-6 left-1/2 z-30 inline-flex min-h-14 -translate-x-1/2 items-center gap-3 rounded-full bg-emerald-700 px-8 py-4 text-lg font-bold text-white shadow-2xl ring-4 ring-white hover:bg-emerald-800"
  >
    <FunnelIcon className="h-6 w-6" />
    Filtros
    {count > 0 && (
      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2.5 text-sm font-bold text-emerald-800">
        {count}
      </span>
    )}
  </button>
);

export default MapFilterButton;
