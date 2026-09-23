export const UNLIMITED_KM = 999999;

export const DISTANCE_OPTIONS = [
  { km: 50, label: '50 km' },
  { km: 100, label: '100 km' },
  { km: 200, label: '200 km' },
  { km: 500, label: '500 km' },
  { km: 1000, label: '1000 km' },
  { km: UNLIMITED_KM, label: 'Ilimitado' },
] as const;

export const isUnlimitedDistance = (km: number) => km >= UNLIMITED_KM;

export const formatDistanceLabel = (km: number) =>
  isUnlimitedDistance(km) ? 'Ilimitado' : `${km} km`;

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
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
  Vigo: { lat: 42.2406, lng: -8.7207 },
  Valladolid: { lat: 41.6523, lng: -4.7245 },
  'A Coruña': { lat: 43.3623, lng: -8.4115 },
  Gijón: { lat: 43.5357, lng: -5.6615 },
  Vitoria: { lat: 42.8467, lng: -2.6716 },
};

export const haversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getCityCoordinates = (city?: string | null) => {
  if (!city) return null;
  const match = Object.keys(CITY_COORDINATES).find((name) =>
    city.toLowerCase().includes(name.toLowerCase())
  );
  return match ? CITY_COORDINATES[match] : null;
};

export const resolveCoordinates = (
  latitude?: number | null,
  longitude?: number | null,
  city?: string | null
) => {
  if (typeof latitude === 'number' && typeof longitude === 'number' && latitude && longitude) {
    return { lat: latitude, lng: longitude };
  }
  return getCityCoordinates(city);
};

export const resolveProfileOrigin = (profile?: {
  city?: string | null;
  coordinates?: [number, number] | null;
  latitude?: number | null;
  longitude?: number | null;
} | null) =>
  resolveCoordinates(
    profile?.latitude ?? (profile?.coordinates ? profile.coordinates[1] : null),
    profile?.longitude ?? (profile?.coordinates ? profile.coordinates[0] : null),
    profile?.city
  );

export const isWithinDistance = (
  origin: { lat: number; lng: number } | null,
  target: { lat: number; lng: number } | null,
  maxKm: number
) => {
  if (isUnlimitedDistance(maxKm) || !origin || !target) return true;
  return haversineKm(origin.lat, origin.lng, target.lat, target.lng) <= maxKm;
};
