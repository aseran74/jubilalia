import React from 'react';
import { FunnelIcon, ListBulletIcon, MapIcon } from '@heroicons/react/24/solid';

interface MapViewControlsProps {
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  onFiltersClick: () => void;
  filterCount?: number;
}

export const MapViewControls: React.FC<MapViewControlsProps> = ({
  viewMode,
  onViewModeChange,
  onFiltersClick,
  filterCount = 0,
}) => (
  <div className="pointer-events-auto fixed bottom-[calc(var(--safe-bottom)+5.75rem)] left-1/2 z-40 w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 lg:bottom-6">
    <div className="flex items-stretch overflow-hidden rounded-full border border-white/80 bg-white/95 shadow-[0_12px_32px_rgba(28,25,23,0.18)] ring-1 ring-stone-200/80 backdrop-blur-md">
      <button
        type="button"
        onClick={onFiltersClick}
        className="flex min-h-12 flex-1 items-center justify-center gap-1.5 px-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        aria-label="Abrir filtros"
      >
        <FunnelIcon className="h-4 w-4 text-emerald-700" />
        Filtros
        {filterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-[11px] font-bold text-white">
            {filterCount}
          </span>
        )}
      </button>
      <span className="w-px self-center bg-stone-200" style={{ height: '1.5rem' }} />
      <button
        type="button"
        onClick={() => onViewModeChange('list')}
        className={`flex min-h-12 flex-1 items-center justify-center gap-1.5 px-3 text-sm font-semibold transition-colors ${
          viewMode === 'list' ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-stone-50'
        }`}
        aria-pressed={viewMode === 'list'}
      >
        <ListBulletIcon className="h-4 w-4" />
        Lista
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('map')}
        className={`flex min-h-12 flex-1 items-center justify-center gap-1.5 px-3 text-sm font-semibold transition-colors ${
          viewMode === 'map' ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-stone-50'
        }`}
        aria-pressed={viewMode === 'map'}
      >
        <MapIcon className="h-4 w-4" />
        Mapa
      </button>
    </div>
  </div>
);

interface MapOverlayHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const MapOverlayHeader: React.FC<MapOverlayHeaderProps> = ({ title, subtitle, action }) => (
  <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pb-3 pt-[calc(var(--safe-top)+12px)]">
    <div className="pointer-events-auto flex items-start justify-between gap-2 pl-[4.5rem] md:pl-1">
      <div className="min-w-0 rounded-2xl bg-white/92 px-3 py-2 shadow-md ring-1 ring-black/5 backdrop-blur-md">
        <h1 className="truncate text-base font-bold leading-tight text-stone-900">{title}</h1>
        {subtitle && (
          <div className="mt-0.5 truncate text-xs leading-tight text-stone-500">{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  </div>
);

export default MapViewControls;
