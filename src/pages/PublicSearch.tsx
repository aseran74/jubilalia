import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Search, MapPin, Users, Calendar, Tag, Map, List, 
  UserCircle, Building2, Filter, ChevronDown, Euro, Heart, X, Home, LayoutDashboard, ArrowLeft
} from 'lucide-react';
import ActivityMap from '../components/activities/ActivityMap';
import GroupsMap from '../components/groups/GroupsMap';
import PeopleMap from '../components/people/PeopleMap';

// --- INTERFACES (Sin cambios) ---
interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  city: string;
  max_participants: number;
  current_participants: number;
  price: number;
  is_free: boolean;
  images: string[];
  difficulty_level?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  owner: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  city: string;
  country: string;
  max_members: number;
  current_members: number;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

interface Person {
  id: string;
  full_name: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  bio?: string;
  interests?: string[];
  gender?: string;
  date_of_birth?: string;
  age?: number;
  latitude?: number;
  longitude?: number;
}

type TabType = 'activities' | 'groups' | 'people';

// --- COMPONENTES UI AUXILIARES ---

const FilterButton = ({ 
  label, 
  isActive, 
  onClick, 
  icon: Icon 
}: { 
  label: string, 
  isActive: boolean, 
  onClick: (e: React.MouseEvent) => void, // Agregado evento
  icon?: React.ElementType 
}) => (
  <button
    onClick={onClick}
    type="button" // Importante para prevenir submits accidentales
    className={`
      flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border whitespace-nowrap
      ${isActive 
        ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500/20' 
        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}
    `}
  >
    {Icon && <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />}
    <span>{label}</span>
    <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5 sm:ml-1 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
  </button>
);

interface CustomSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  icon?: React.ElementType;
}

const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon }: CustomSelectProps) => (
  <div className="relative min-w-[100px] sm:min-w-[140px]">
    {Icon && <Icon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" />}
    <select
      value={value}
      onChange={onChange}
      className={`
        w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2 sm:py-2.5 rounded-lg sm:rounded-xl 
        focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs sm:text-sm cursor-pointer
        ${Icon ? 'pl-8 sm:pl-10 pr-6 sm:pr-8' : 'px-3 sm:px-4 pr-6 sm:pr-8'}
      `}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" />
  </div>
);

const CardSkeleton = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-40 sm:h-48 bg-gray-200 w-full"></div>
    <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
      <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const PublicSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Estados Actividades
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [priceButtonPosition, setPriceButtonPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  
  // Estados Grupos
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroupCategory, setSelectedGroupCategory] = useState<string>('');
  const [selectedGroupCity, setSelectedGroupCity] = useState<string>('');
  
  // Estados Personas
  const [people, setPeople] = useState<Person[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [selectedPersonCity, setSelectedPersonCity] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPeopleFilters, setShowPeopleFilters] = useState(false);
  const [showMapFilters, setShowMapFilters] = useState(false);

  // Refs
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const priceButtonRef = useRef<HTMLButtonElement>(null);
  const interestsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target as Node)) {
        setShowPriceRange(false);
      }
      if (interestsDropdownRef.current && !interestsDropdownRef.current.contains(event.target as Node)) {
        setShowPeopleFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FETCH LOGIC ---
  useEffect(() => {
    if (activeTab === 'activities') fetchActivities();
  }, [activeTab, selectedType, selectedCity, priceFilter, minPrice, maxPrice]);

  useEffect(() => {
    if (activeTab === 'groups') fetchGroups();
  }, [activeTab, selectedGroupCategory, selectedGroupCity]);

  useEffect(() => {
    if (activeTab === 'people') fetchPeople();
  }, [activeTab, selectedPersonCity, selectedGender, selectedInterests]);

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      
      // Construir query base
      let query = supabase.from('activities').select('*').eq('is_active', true).order('created_at', { ascending: false });

      if (selectedType) query = query.eq('activity_type', selectedType);
      if (selectedCity) query = query.eq('city', selectedCity);

      if (priceFilter === 'free') {
        query = query.eq('is_free', true);
      } else if (priceFilter === 'paid') {
        query = query.eq('is_free', false);
        if (minPrice > 0) query = query.gte('price', minPrice);
        if (maxPrice > 0 && maxPrice < 5000) query = query.lte('price', maxPrice);
      } else if (priceFilter === 'all') {
        // Si el usuario ha tocado el rango, aplicarlo incluso en 'all'
        if (minPrice > 0 || maxPrice < 5000) {
             query = query.or(`is_free.eq.true,and(is_free.eq.false,price.gte.${minPrice},price.lte.${maxPrice})`);
        }
      }

      // Ejecutar consulta de actividades
      const { data: activitiesData, error } = await query;
      if (error || !activitiesData) { setActivities([]); return; }

      // Obtener IDs únicos para consultas optimizadas
      const activityIds = activitiesData.map(a => a.id);
      const profileIds = [...new Set(activitiesData.map(a => a.profile_id).filter(Boolean))];

      // Ejecutar consultas de imágenes y perfiles en paralelo
      const [imagesData, profilesData] = await Promise.all([
        activityIds.length > 0 
          ? supabase
              .from('activity_images')
              .select('activity_id, image_url, image_order')
              .in('activity_id', activityIds)
              .order('image_order', { ascending: true })
          : Promise.resolve({ data: null, error: null }),
        profileIds.length > 0
          ? supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', profileIds)
          : Promise.resolve({ data: null, error: null })
      ]);

      // Procesar imágenes
      const imagesByActivity: Record<string, string[]> = {};
      if (imagesData.data) {
        imagesData.data.forEach(img => {
          if (!imagesByActivity[img.activity_id]) imagesByActivity[img.activity_id] = [];
          imagesByActivity[img.activity_id].push(img.image_url);
        });
      }

      // Crear mapa de perfiles para acceso rápido
      const profilesMap: Record<string, { full_name: string; avatar_url?: string }> = {};
      if (profilesData.data) {
        profilesData.data.forEach(profile => {
          profilesMap[profile.id] = {
            full_name: profile.full_name || 'Usuario',
            avatar_url: profile.avatar_url
          };
        });
      }

      // Combinar datos de forma eficiente (sin Promise.all innecesario)
      const activitiesWithOwner = activitiesData.map(activity => ({
        ...activity,
        images: imagesByActivity[activity.id] || [],
        owner: activity.profile_id && profilesMap[activity.profile_id]
          ? profilesMap[activity.profile_id]
          : { full_name: 'Usuario', avatar_url: undefined }
      }));

      setActivities(activitiesWithOwner);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } 
    finally { setLoadingActivities(false); }
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      let query = supabase.from('groups').select('*').eq('is_public', true).order('created_at', { ascending: false });
      if (selectedGroupCategory) query = query.eq('category', selectedGroupCategory);
      if (selectedGroupCity) query = query.eq('city', selectedGroupCity);
      const { data } = await query;
      setGroups(data || []);
    } catch { setGroups([]); } 
    finally { setLoadingGroups(false); }
  };

  const fetchPeople = async () => {
    try {
      setLoadingPeople(true);
      let query = supabase.from('profiles').select('*').not('full_name', 'is', null).order('created_at', { ascending: false }).limit(100);
      if (selectedPersonCity) query = query.eq('city', selectedPersonCity);
      if (selectedGender) query = query.eq('gender', selectedGender);
      const { data: peopleData } = await query;
      if (!peopleData) { setPeople([]); return; }

      let filteredPeopleData = peopleData;
      if (selectedInterests.length > 0) {
        filteredPeopleData = filteredPeopleData.filter(person => {
          if (!person.interests || person.interests.length === 0) return false;
          return selectedInterests.some(selInt => 
            person.interests?.some((pInt: string) => pInt.toLowerCase().includes(selInt.toLowerCase()))
          );
        });
      }

      const peopleWithAge = filteredPeopleData.map(person => {
        let age: number | undefined;
        if (person.date_of_birth) {
          const birthDate = new Date(person.date_of_birth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        }
        return { ...person, age };
      });
      setPeople(peopleWithAge);
    } catch { setPeople([]); } 
    finally { setLoadingPeople(false); }
  };

  const filteredActivities = searchTerm ? activities.filter(a => a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || a.city?.toLowerCase().includes(searchTerm.toLowerCase())) : activities;
  const filteredGroups = searchTerm ? groups.filter(g => g.name?.toLowerCase().includes(searchTerm.toLowerCase()) || g.city?.toLowerCase().includes(searchTerm.toLowerCase())) : groups;
  const filteredPeople = searchTerm ? people.filter(p => p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.city?.toLowerCase().includes(searchTerm.toLowerCase())) : people;

  const activityCities = Array.from(new Set(activities.map(a => a.city).filter(Boolean)));
  const groupCities = Array.from(new Set(groups.map(g => g.city).filter(Boolean)));
  const personCities = Array.from(new Set(people.map(p => p.city).filter(Boolean)));

  const interestsList = [
    'Viajes', 'Cultura', 'Deporte', 'Gastronomía', 'Música', 'Arte',
    'Lectura', 'Cine', 'Naturaleza', 'Fotografía', 'Tecnología', 'Jardinería',
    'Senderismo', 'Yoga', 'Voluntariado', 'Animales', 'Cocina', 'Vino'
  ];

  // Determinar si estamos en modo mapa a pantalla completa (especialmente móvil)
  const isFullscreenMap = viewMode === 'map' && (activeTab === 'activities' || activeTab === 'groups' || activeTab === 'people');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* --- HEADER (oculto en modo mapa móvil) --- */}
      {!isFullscreenMap && (
        <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700 hover:text-green-600 transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Inicio</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
            <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder={`Buscar en ${activeTab === 'activities' ? 'actividades' : activeTab === 'groups' ? 'grupos' : 'personas'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>

            <div className="flex p-1 bg-gray-100/80 rounded-lg sm:rounded-xl self-start sm:self-center overflow-x-auto no-scrollbar">
              {[
                { id: 'activities', icon: Calendar, label: 'Actividades', shortLabel: 'Act.' },
                { id: 'groups', icon: Users, label: 'Grupos', shortLabel: 'Grupos' },
                { id: 'people', icon: UserCircle, label: 'Gente', shortLabel: 'Gente' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap
                    ${activeTab === tab.id ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                  `}
                >
                  <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- BARRA DE FILTROS (CORREGIDO) --- */}
        <div className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              
              {/* 
                 CORRECCIÓN CLAVE:
                 - Se agregó 'md:overflow-visible' y 'md:flex-wrap' para que en desktop el popup no se corte.
                 - Se mantiene 'overflow-x-auto' para móvil.
              */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto md:overflow-visible md:flex-wrap pb-2 no-scrollbar mask-linear-fade flex-1">
                <div className="flex items-center text-gray-400 text-xs sm:text-sm font-medium mr-1 sm:mr-2 shrink-0">
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Filtros:</span>
                </div>

                {activeTab === 'activities' && (
                  <>
                    <CustomSelect 
                      value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                      options={['Viajes', 'Cultura', 'Deporte', 'Gastronomía', 'Naturaleza', 'Social'].map(v => ({value: v, label: v}))}
                      placeholder="Tipo" icon={Tag}
                    />
                    <CustomSelect 
                      value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                      options={activityCities.map(c => ({value: c, label: c}))}
                      placeholder="Ciudad" icon={MapPin}
                    />
                    <CustomSelect 
                      value={priceFilter} onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                      options={[{value: 'all', label: 'Todos'}, {value: 'free', label: 'Gratis'}, {value: 'paid', label: 'Pago'}]}
                      placeholder="Coste" icon={Euro}
                    />

                    {/* FILTRO RANGO DE PRECIO */}
                    {(priceFilter === 'paid' || priceFilter === 'all') && (
                      <div className="relative z-50 shrink-0" ref={priceDropdownRef}>
                        <button
                          ref={priceButtonRef}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (priceButtonRef.current) {
                              const rect = priceButtonRef.current.getBoundingClientRect();
                              setPriceButtonPosition({
                                top: rect.bottom + window.scrollY,
                                left: rect.left + window.scrollX,
                                width: rect.width
                              });
                            }
                            setShowPriceRange(!showPriceRange);
                          }}
                          type="button"
                          className={`
                            flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border whitespace-nowrap
                            ${(showPriceRange || minPrice > 0 || maxPrice < 5000)
                              ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500/20' 
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}
                          `}
                        >
                          <Euro className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${(showPriceRange || minPrice > 0 || maxPrice < 5000) ? 'text-green-600' : 'text-gray-500'}`} />
                          <span>Rango Precio</span>
                          <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5 sm:ml-1 ${(showPriceRange || minPrice > 0 || maxPrice < 5000) ? 'text-green-600' : 'text-gray-400'}`} />
                        </button>
                        
                        {showPriceRange && (
                          <div 
                            className="fixed sm:absolute sm:top-full sm:left-0 sm:mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-5 z-[60] animate-in fade-in zoom-in-95 duration-100"
                            style={typeof window !== 'undefined' && window.innerWidth < 640 && priceButtonPosition ? {
                              top: `${Math.min(priceButtonPosition.top + 8, window.innerHeight - 300)}px`,
                              left: `${Math.max(16, Math.min(priceButtonPosition.left, window.innerWidth - (window.innerWidth * 0.9) - 16))}px`,
                            } : undefined}
                          >
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900">Rango de Precio</h3>
                            </div>
                            <div className="space-y-4 sm:space-y-6">
                              <div className="space-y-3 sm:space-y-4">
                                {/* Sliders */}
                                <div>
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                     <span>Min: {minPrice}€</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="5000" step="50" 
                                    value={minPrice} 
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      if(val <= maxPrice) setMinPrice(val);
                                    }} 
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                     <span>Max: {maxPrice}€</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="5000" step="50" 
                                    value={maxPrice} 
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      if(val >= minPrice) setMaxPrice(val);
                                    }} 
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <button 
                                  onClick={() => { setMinPrice(0); setMaxPrice(5000); }}
                                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  Resetear
                                </button>
                                <button 
                                  onClick={() => setShowPriceRange(false)}
                                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium text-xs sm:text-sm hover:bg-green-700"
                                >
                                  Aplicar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'groups' && (
                  <>
                     <CustomSelect 
                      value={selectedGroupCategory} onChange={(e) => setSelectedGroupCategory(e.target.value)}
                      options={['Viajes', 'Cultura', 'Deporte', 'Social'].map(v => ({value: v, label: v}))}
                      placeholder="Categoría" icon={Tag}
                    />
                    <CustomSelect 
                      value={selectedGroupCity} onChange={(e) => setSelectedGroupCity(e.target.value)}
                      options={groupCities.map(c => ({value: c, label: c}))}
                      placeholder="Ciudad" icon={MapPin}
                    />
                  </>
                )}

                {activeTab === 'people' && (
                  <>
                    <CustomSelect 
                      value={selectedPersonCity} onChange={(e) => setSelectedPersonCity(e.target.value)}
                      options={personCities.filter((c): c is string => Boolean(c)).map(c => ({value: c, label: c}))}
                      placeholder="Ciudad" icon={MapPin}
                    />
                    <CustomSelect 
                      value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}
                      options={[{value: 'male', label: 'Hombre'}, {value: 'female', label: 'Mujer'}, {value: 'other', label: 'Otro'}]}
                      placeholder="Género" icon={Users}
                    />
                    
                    <div className="relative z-50" ref={interestsDropdownRef}>
                      <FilterButton 
                        label="Intereses" icon={Heart}
                        isActive={showPeopleFilters || selectedInterests.length > 0} 
                        onClick={(e) => { e.stopPropagation(); setShowPeopleFilters(!showPeopleFilters); }} 
                      />
                      
                      {showPeopleFilters && (
                        <div className="absolute top-full left-0 mt-2 w-[calc(100vw-2rem)] sm:w-[300px] md:w-[400px] max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-5 z-50 animate-in fade-in zoom-in-95 duration-100">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Intereses</h3>
                            {selectedInterests.length > 0 && (
                              <button onClick={() => setSelectedInterests([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Borrar todo</button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                            {interestsList.map(interest => (
                              <button
                                key={interest}
                                onClick={() => {
                                  if (selectedInterests.includes(interest)) {
                                    setSelectedInterests(prev => prev.filter(i => i !== interest));
                                  } else {
                                    setSelectedInterests(prev => [...prev, interest]);
                                  }
                                }}
                                className={`
                                  px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all border
                                  ${selectedInterests.includes(interest)
                                    ? 'bg-green-100 border-green-200 text-green-800' 
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}
                                `}
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* --- VISTA MAPA PANTALLA COMPLETA (móvil) --- */}
      {isFullscreenMap ? (
        <div className="fixed inset-0 z-40 bg-white" style={{ marginTop: 0, paddingTop: 0 }}>
          {/* Botón para volver a lista */}
          <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className="bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-white shadow-lg rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 inline mr-1" />
              Inicio
            </button>
          </div>

          {/* Botón flotante de filtros */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setShowMapFilters(!showMapFilters)}
              className="bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>

          {/* Panel de filtros flotante */}
          {showMapFilters && (
            <div className="absolute top-20 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-xs w-[calc(100vw-2rem)] max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filtros</h3>
                <button
                  onClick={() => setShowMapFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeTab === 'activities' && (
                <div className="space-y-3">
                  <CustomSelect 
                    value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                    options={['Viajes', 'Cultura', 'Deporte', 'Gastronomía', 'Naturaleza', 'Social'].map(v => ({value: v, label: v}))}
                    placeholder="Tipo" icon={Tag}
                  />
                  <CustomSelect 
                    value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                    options={activityCities.map(c => ({value: c, label: c}))}
                    placeholder="Ciudad" icon={MapPin}
                  />
                  <CustomSelect 
                    value={priceFilter} onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                    options={[{value: 'all', label: 'Todos'}, {value: 'free', label: 'Gratis'}, {value: 'paid', label: 'Pago'}]}
                    placeholder="Coste" icon={Euro}
                  />
                  {(priceFilter === 'paid' || priceFilter === 'all') && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Rango de Precio</p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Min: {minPrice}€</span>
                          </div>
                          <input 
                            type="range" min="0" max="5000" step="50" 
                            value={minPrice} 
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if(val <= maxPrice) setMinPrice(val);
                            }} 
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Max: {maxPrice}€</span>
                          </div>
                          <input 
                            type="range" min="0" max="5000" step="50" 
                            value={maxPrice} 
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if(val >= minPrice) setMaxPrice(val);
                            }} 
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                          />
                        </div>
                        <button 
                          onClick={() => { setMinPrice(0); setMaxPrice(5000); }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Resetear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'groups' && (
                <div className="space-y-3">
                  <CustomSelect 
                    value={selectedGroupCategory} onChange={(e) => setSelectedGroupCategory(e.target.value)}
                    options={['Viajes', 'Cultura', 'Deporte', 'Social'].map(v => ({value: v, label: v}))}
                    placeholder="Categoría" icon={Tag}
                  />
                  <CustomSelect 
                    value={selectedGroupCity} onChange={(e) => setSelectedGroupCity(e.target.value)}
                    options={groupCities.map(c => ({value: c, label: c}))}
                    placeholder="Ciudad" icon={MapPin}
                  />
                </div>
              )}

              {activeTab === 'people' && (
                <div className="space-y-3">
                  <CustomSelect 
                    value={selectedPersonCity} onChange={(e) => setSelectedPersonCity(e.target.value)}
                    options={personCities.filter((c): c is string => Boolean(c)).map(c => ({value: c, label: c}))}
                    placeholder="Ciudad" icon={MapPin}
                  />
                  <CustomSelect 
                    value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}
                    options={[{value: 'male', label: 'Hombre'}, {value: 'female', label: 'Mujer'}, {value: 'other', label: 'Otro'}]}
                    placeholder="Género" icon={Users}
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Intereses</p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {interestsList.map(interest => (
                        <button
                          key={interest}
                          onClick={() => {
                            if (selectedInterests.includes(interest)) {
                              setSelectedInterests(prev => prev.filter(i => i !== interest));
                            } else {
                              setSelectedInterests(prev => [...prev, interest]);
                            }
                          }}
                          className={`
                            px-2.5 py-1 rounded-full text-xs font-medium transition-all border
                            ${selectedInterests.includes(interest)
                              ? 'bg-green-100 border-green-200 text-green-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}
                          `}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    {selectedInterests.length > 0 && (
                      <button 
                        onClick={() => setSelectedInterests([])} 
                        className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Borrar todo
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mapa a pantalla completa */}
          <div className="w-full h-full">
            {activeTab === 'activities' && (
              <ActivityMap 
                activities={filteredActivities.map(a => ({ ...a, difficulty_level: a.difficulty_level || '', tags: a.tags || [] }))} 
                onActivitySelect={(activity: Activity) => navigate(`/activities/${activity.id}`)}
                className="w-full h-full"
              />
            )}
            {activeTab === 'groups' && (
              <GroupsMap 
                groups={filteredGroups.map(g => ({ 
                  ...g, 
                  created_by: '', 
                  is_public: true 
                }))} 
                onGroupSelect={(group) => navigate(`/groups/${group.id}`)}
                className="w-full h-full"
              />
            )}
            {activeTab === 'people' && (
              <PeopleMap 
                people={filteredPeople} 
                onPersonSelect={(person) => navigate(`/users/${person.id}`)}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* --- RESULTADOS (vista normal) --- */}
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Contador de resultados */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-xs sm:text-sm font-medium">
              {activeTab === 'activities' && (
                <>
                  {loadingActivities ? (
                    <span className="text-gray-400">Cargando...</span>
                  ) : (
                    <span>
                      <span className="font-bold text-gray-900">{filteredActivities.length}</span> 
                      {filteredActivities.length === 1 ? ' actividad encontrada' : ' actividades encontradas'}
                    </span>
                  )}
                </>
              )}
              {activeTab === 'groups' && (
                <>
                  {loadingGroups ? (
                    <span className="text-gray-400">Cargando...</span>
                  ) : (
                    <span>
                      <span className="font-bold text-gray-900">{filteredGroups.length}</span> 
                      {filteredGroups.length === 1 ? ' grupo encontrado' : ' grupos encontrados'}
                    </span>
                  )}
                </>
              )}
              {activeTab === 'people' && (
                <>
                  {loadingPeople ? (
                    <span className="text-gray-400">Cargando...</span>
                  ) : (
                    <span>
                      <span className="font-bold text-gray-900">{filteredPeople.length}</span> 
                      {filteredPeople.length === 1 ? ' persona encontrada' : ' personas encontradas'}
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
          {activeTab === 'activities' && viewMode === 'list' && !loadingActivities && filteredActivities.length > 0 && (
            <div className="text-sm text-gray-500">
              Vista de lista
            </div>
          )}
        </div>
        
        {activeTab === 'activities' && (
          <>
            {viewMode === 'map' ? (
              <div className="space-y-4">
                {/* Filtros para escritorio en modo mapa */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Filter className="w-4 h-4" />
                      <span>Filtros:</span>
                    </div>
                    
                    <CustomSelect 
                      value={selectedType} 
                      onChange={(e) => setSelectedType(e.target.value)}
                      options={['Viajes', 'Cultura', 'Deporte', 'Gastronomía', 'Naturaleza', 'Social'].map(v => ({value: v, label: v}))}
                      placeholder="Tipo" 
                      icon={Tag}
                    />
                    
                    <CustomSelect 
                      value={selectedCity} 
                      onChange={(e) => setSelectedCity(e.target.value)}
                      options={activityCities.map(c => ({value: c, label: c}))}
                      placeholder="Ciudad" 
                      icon={MapPin}
                    />
                    
                    <CustomSelect 
                      value={priceFilter} 
                      onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                      options={[{value: 'all', label: 'Todos'}, {value: 'free', label: 'Gratis'}, {value: 'paid', label: 'Pago'}]}
                      placeholder="Coste" 
                      icon={Euro}
                    />
                    
                    {(priceFilter === 'paid' || priceFilter === 'all') && (
                      <div className="relative" ref={priceDropdownRef}>
                        <button
                          ref={priceButtonRef}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (priceButtonRef.current) {
                              const rect = priceButtonRef.current.getBoundingClientRect();
                              setPriceButtonPosition({
                                top: rect.bottom + window.scrollY,
                                left: rect.left + window.scrollX,
                                width: rect.width
                              });
                            }
                            setShowPriceRange(!showPriceRange);
                          }}
                          type="button"
                          className={`
                            flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border whitespace-nowrap
                            ${(showPriceRange || minPrice > 0 || maxPrice < 5000)
                              ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500/20' 
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}
                          `}
                        >
                          <Euro className={`w-4 h-4 ${(showPriceRange || minPrice > 0 || maxPrice < 5000) ? 'text-green-600' : 'text-gray-500'}`} />
                          <span>Rango Precio</span>
                          <ChevronDown className={`w-3 h-3 ml-1 ${(showPriceRange || minPrice > 0 || maxPrice < 5000) ? 'text-green-600' : 'text-gray-400'}`} />
                        </button>
                        
                        {showPriceRange && (
                          <div 
                            className="absolute top-full left-0 mt-2 w-80 max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 p-5 z-50"
                          >
                            <p className="text-sm font-medium text-gray-700 mb-3">Rango de Precio</p>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                  <span>Mínimo: {minPrice}€</span>
                                </div>
                                <input 
                                  type="range" min="0" max="5000" step="50" 
                                  value={minPrice} 
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if(val <= maxPrice) setMinPrice(val);
                                  }} 
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                  <span>Máximo: {maxPrice}€</span>
                                </div>
                                <input 
                                  type="range" min="0" max="5000" step="50" 
                                  value={maxPrice} 
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if(val >= minPrice) setMaxPrice(val);
                                  }} 
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                              </div>
                              <button 
                                onClick={() => { setMinPrice(0); setMaxPrice(5000); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Resetear
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(selectedType || selectedCity || priceFilter !== 'all' || minPrice > 0 || maxPrice < 5000) && (
                      <button
                        onClick={() => {
                          setSelectedType('');
                          setSelectedCity('');
                          setPriceFilter('all');
                          setMinPrice(0);
                          setMaxPrice(5000);
                        }}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)] lg:h-[calc(100vh-320px)] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                  <ActivityMap 
                    activities={filteredActivities.map(a => ({ ...a, difficulty_level: a.difficulty_level || '', tags: a.tags || [] }))} 
                    onActivitySelect={(activity: Activity) => navigate(`/activities/${activity.id}`)}
                  />
                </div>
              </div>
            ) : (
              <>
                {loadingActivities ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">{[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}</div>
                ) : filteredActivities.length === 0 ? (
                  <EmptyState icon={Calendar} text="No se encontraron actividades" subtext="Intenta ajustar los filtros." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {filteredActivities.map(activity => (
                      <div key={activity.id} onClick={() => navigate(`/activities/${activity.id}`)} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 flex flex-col h-full">
                        <div className="relative h-52 overflow-hidden rounded-t-2xl">
                          {activity.images && activity.images.length > 0 ? (
                            <img src={activity.images[0]} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-green-50 flex items-center justify-center"><Calendar className="w-12 h-12 text-green-300" /></div>
                          )}
                          <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${activity.is_free ? 'bg-green-500/90 text-white' : 'bg-white/90 text-gray-900'}`}>
                             {activity.is_free ? 'Gratis' : `€${activity.price}`}
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{activity.title}</h3>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{activity.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-50">
                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {activity.city}</div>
                            <div className="flex items-center ml-auto text-green-600 font-medium"><Users className="w-4 h-4 mr-1" /> {activity.current_participants}/{activity.max_participants}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'groups' && (
          <>
            {viewMode === 'map' ? (
              <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <GroupsMap 
                  groups={filteredGroups.map(g => ({ 
                    ...g, 
                    created_by: '', 
                    is_public: true 
                  }))} 
                  onGroupSelect={(group) => navigate(`/groups/${group.id}`)}
                />
              </div>
            ) : (
              <>
                {loadingGroups ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
                ) : filteredGroups.length === 0 ? (
                  <EmptyState icon={Users} text="No se encontraron grupos" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredGroups.map(group => (
                  <div key={group.id} onClick={() => navigate(`/groups/${group.id}`)} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 overflow-hidden">
                    <div className="relative h-44">
                      {group.image_url ? <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-50 flex items-center justify-center"><Building2 className="w-12 h-12 text-purple-200" /></div>}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1 text-gray-900">{group.name}</h3>
                      <div className="flex items-center justify-between text-xs font-medium text-gray-400 mt-4">
                         <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {group.city}</span>
                         <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{group.current_members} miembros</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'people' && (
          <>
            {viewMode === 'map' ? (
              <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <PeopleMap 
                  people={filteredPeople} 
                  onPersonSelect={(person) => navigate(`/users/${person.id}`)}
                />
              </div>
            ) : (
              <>
                {loadingPeople ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
                ) : filteredPeople.length === 0 ? (
                  <EmptyState icon={UserCircle} text="No se encontraron personas" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredPeople.map(person => (
                  <div key={person.id} onClick={() => navigate(`/users/${person.id}`)} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100 hover:border-green-100 cursor-pointer flex items-start gap-4">
                    <div className="relative shrink-0">
                      {person.avatar_url ? (
                        <img src={person.avatar_url} alt={person.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xl border-2 border-white shadow-sm">{person.full_name?.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{person.full_name}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5 mb-2"><MapPin className="w-3 h-3 mr-1" /> {person.city}</div>
                      <div className="flex flex-wrap gap-1">
                        {person.interests?.slice(0, 2).map((int, idx) => <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">{int}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                )}
              </>
            )}
          </>
        )}

        <div className="mt-8 sm:mt-12 flex justify-center pb-6 sm:pb-10">
           <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl p-1 shadow-lg max-w-3xl w-full">
              <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">¿Quieres unirte a la comunidad?</h2>
                <button onClick={() => navigate('/login')} className="bg-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-green-700 transition-all shadow-md mt-4">
                  Iniciar sesión o Regístrate
                </button>
              </div>
           </div>
        </div>
      </div>
        </>
      )}

      {/* Mobile/Tablet Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Inicio */}
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Inicio</span>
          </button>

          {/* Buscar */}
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Buscar</span>
          </button>

          {/* Mi Panel / Dashboard */}
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs font-medium">Mi Panel</span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => navigate(user ? '/dashboard/profile' : '/login')}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <UserCircle className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Spacer para evitar que el contenido quede oculto detrás del navbar inferior en móvil */}
      {!isFullscreenMap && <div className="h-16 lg:hidden"></div>}

      {/* Botón flotante de cambio de vista (Lista/Mapa) */}
      {(activeTab === 'activities' || activeTab === 'groups' || activeTab === 'people') && !isFullscreenMap && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 lg:hidden">
          <div className="flex items-center bg-white rounded-full shadow-2xl border-2 border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 flex items-center gap-2 transition-all ${
                viewMode === 'list' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-6 h-6" />
              <span className="font-semibold text-sm">Lista</span>
            </button>
            <div className="w-px h-8 bg-gray-200"></div>
            <button
              onClick={() => setViewMode('map')}
              className={`px-6 py-3 flex items-center gap-2 transition-all ${
                viewMode === 'map' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Map className="w-6 h-6" />
              <span className="font-semibold text-sm">Mapa</span>
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante de cambio de vista para desktop (en la barra de filtros) */}
      {(activeTab === 'activities' || activeTab === 'groups' || activeTab === 'people') && !isFullscreenMap && (
        <div className="hidden lg:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center bg-white rounded-full shadow-2xl border-2 border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 flex items-center gap-2 transition-all ${
                viewMode === 'list' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="font-semibold">Lista</span>
            </button>
            <div className="w-px h-8 bg-gray-200"></div>
            <button
              onClick={() => setViewMode('map')}
              className={`px-6 py-3 flex items-center gap-2 transition-all ${
                viewMode === 'map' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Map className="w-5 h-5" />
              <span className="font-semibold">Mapa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ElementType;
  text: string;
  subtext?: string;
}

const EmptyState = ({ icon: Icon, text, subtext }: EmptyStateProps) => (
  <div className="text-center py-12 sm:py-20 flex flex-col items-center justify-center">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-3 sm:mb-4"><Icon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" /></div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{text}</h3>
    {subtext && <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-xs px-4">{subtext}</p>}
  </div>
);

export default PublicSearch;
