import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

export interface MobileActivity {
  id: string;
  title: string;
  description?: string;
  city?: string;
  location?: string;
  date?: string;
  time?: string;
  price?: number;
  images?: string[];
  category?: string;
}

interface MobileActivityCardProps {
  activity: MobileActivity;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Fecha por confirmar';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Fecha por confirmar';
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const formatPrice = (price?: number) => {
  if (!price) return 'Gratis';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
};

const MobileActivityCard: React.FC<MobileActivityCardProps> = ({ activity }) => {
  const image = activity.images?.[0];
  const place = [activity.location, activity.city].filter(Boolean).join(', ');

  return (
    <Link
      to={`/activities/${activity.id}`}
      className="block overflow-hidden rounded-[1.4rem] bg-white shadow-[0_10px_28px_rgba(40,32,20,0.08)] ring-1 ring-stone-200/80 transition-transform duration-150 active:scale-[0.98]"
    >
      <div className="relative h-40 bg-stone-200">
        {image ? (
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 to-teal-800">
            <Calendar className="h-10 w-10 text-white/80" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-900">
          {formatPrice(activity.price)}
        </span>
        {activity.category && (
          <span className="absolute right-3 top-3 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold capitalize text-white">
            {activity.category}
          </span>
        )}
      </div>

      <div className="space-y-2 px-4 py-3.5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-stone-900">
          {activity.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <Calendar className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <span className="capitalize">
            {formatDate(activity.date)}
            {activity.time ? ` · ${activity.time}` : ''}
          </span>
        </div>
        {place && (
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span className="line-clamp-1">{place}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default MobileActivityCard;
