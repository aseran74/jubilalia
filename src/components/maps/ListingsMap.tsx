import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

export interface ListingMapItem {
  id: string;
  title: string;
  city?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  price?: number;
  imageUrl?: string;
}

interface ListingsMapProps {
  items: ListingMapItem[];
  onSelect: (item: ListingMapItem) => void;
  actionLabel?: string;
  markerLetter?: string;
  compact?: boolean;
  className?: string;
}

const getDefaultCoordinates = (city?: string) => {
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    Madrid: { lat: 40.4168, lng: -3.7038 },
    Barcelona: { lat: 41.3851, lng: 2.1734 },
    Valencia: { lat: 39.4699, lng: -0.3763 },
    Sevilla: { lat: 37.3891, lng: -5.9845 },
    Bilbao: { lat: 43.2627, lng: -2.9253 },
    Málaga: { lat: 36.7213, lng: -4.4214 },
    Zaragoza: { lat: 41.6488, lng: -0.8891 },
    Murcia: { lat: 37.9922, lng: -1.1307 },
    Palma: { lat: 39.5696, lng: 2.6502 },
    Alicante: { lat: 38.3452, lng: -0.481 },
    Córdoba: { lat: 37.8882, lng: -4.7794 },
    Granada: { lat: 37.1773, lng: -3.5986 },
    Cádiz: { lat: 36.5271, lng: -6.2886 },
  };

  if (!city) return { lat: 40.4168, lng: -3.7038 };
  const match = Object.keys(cityCoordinates).find((name) =>
    city.toLowerCase().includes(name.toLowerCase())
  );
  return match ? cityCoordinates[match] : { lat: 40.4168, lng: -3.7038 };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatPrice = (price?: number) => {
  if (price == null) return '';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
};

const ListingsMap: React.FC<ListingsMapProps> = ({
  items,
  onSelect,
  actionLabel = 'Ver anuncio',
  markerLetter = 'H',
  compact = false,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const { isLoading: mapsLoading, error: mapsError } = useGoogleMaps();

  useEffect(() => {
    if (mapsLoading || mapsError || !window.google?.maps || !mapRef.current) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 7,
      center: { lat: 40.4168, lng: -3.7038 },
      gestureHandling: 'greedy',
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
    });

    setMap(newMap);
    setInfoWindow(new window.google.maps.InfoWindow());
  }, [mapsLoading, mapsError]);

  useEffect(() => {
    if (!map || !infoWindow || !window.google?.maps) return;

    markers.forEach((marker) => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    items.forEach((item) => {
      const fallback = getDefaultCoordinates(item.city);
      const lat = item.latitude || fallback.lat;
      const lng = item.longitude || fallback.lng;
      const price = formatPrice(item.price);
      const location = [item.address, item.city].filter(Boolean).join(' · ');

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: item.title,
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#047857" stroke="#ffffff" stroke-width="2"/>
              <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${markerLetter}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="padding: 8px; max-width: 220px; font-family: system-ui, sans-serif;">
            ${
              item.imageUrl
                ? `<img src="${escapeHtml(item.imageUrl)}" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`
                : ''
            }
            <h3 style="font-weight:600;font-size:14px;margin:0 0 6px;color:#111827;">${escapeHtml(item.title)}</h3>
            ${price ? `<p style="color:#047857;font-size:14px;font-weight:700;margin:0 0 6px;">${price}</p>` : ''}
            ${location ? `<p style="color:#6b7280;font-size:11px;margin:0 0 8px;">${escapeHtml(location)}</p>` : ''}
            <button id="listing-btn-${item.id}" style="width:100%;padding:6px 8px;background:#047857;color:white;font-size:12px;border:none;border-radius:6px;cursor:pointer;">
              ${escapeHtml(actionLabel)}
            </button>
          </div>
        `);
        infoWindow.open(map, marker);
        setTimeout(() => {
          document.getElementById(`listing-btn-${item.id}`)?.addEventListener('click', (event) => {
            event.preventDefault();
            onSelect(item);
            infoWindow.close();
          });
        }, 80);
      });

      newMarkers.push(marker);
      bounds.extend({ lat, lng });
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      const zoom = map.getZoom();
      if (zoom && zoom > 12) map.setZoom(12);
      if (zoom && zoom < 5) map.setZoom(7);
    } else {
      map.setCenter({ lat: 40.4168, lng: -3.7038 });
      map.setZoom(7);
    }
  }, [items, map, infoWindow, onSelect, actionLabel, markerLetter]);

  if (mapsLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${compact ? 'h-full' : 'h-64 rounded-lg'} ${className}`}>
        <p className="text-sm text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  if (mapsError) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${compact ? 'h-full' : 'h-64 rounded-lg'} ${className}`}>
        <p className="text-red-600">Error cargando el mapa</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`w-full ${compact ? 'h-full rounded-none' : 'h-96 rounded-lg'} ${className}`}
    />
  );
};

export default ListingsMap;
