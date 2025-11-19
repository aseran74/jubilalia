import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Search, MapPin, Users, Calendar, Tag, Map, List, 
  UserCircle, Building2, Filter, ChevronDown, Euro, Heart 
} from 'lucide-react';
import ActivityMap from '../components/activities/ActivityMap';

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
      flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border whitespace-nowrap
      ${isActive 
        ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500/20' 
        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}
    `}
  >
    {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />}
    <span>{label}</span>
    <ChevronDown className={`w-3 h-3 ml-1 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
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
  <div className="relative min-w-[140px]">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />}
    <select
      value={value}
      onChange={onChange}
      className={`
        w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl 
        focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm cursor-pointer
        ${Icon ? 'pl-10 pr-8' : 'px-4 pr-8'}
      `}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
  </div>
);

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 w-full"></div>
    <div className="p-5 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const PublicSearch: React.FC = () => {
  const navigate = useNavigate();
  
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

  // Refs
  const priceDropdownRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* --- HEADER --- */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
              <Search className="w-6 h-6 text-green-600 mr-2" />
              Explorar
            </h1>
            <button onClick={() => navigate('/')} className="text-sm font-medium text-gray-500 hover:text-green-600 transition-colors">
              Volver al inicio
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Buscar en ${activeTab === 'activities' ? 'actividades' : activeTab === 'groups' ? 'grupos' : 'personas'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>

            <div className="flex p-1 bg-gray-100/80 rounded-xl self-start lg:self-center overflow-x-auto">
              {[
                { id: 'activities', icon: Calendar, label: 'Actividades' },
                { id: 'groups', icon: Users, label: 'Grupos' },
                { id: 'people', icon: UserCircle, label: 'Gente' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                    ${activeTab === tab.id ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- BARRA DE FILTROS (CORREGIDO) --- */}
        <div className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              
              {/* 
                 CORRECCIÓN CLAVE:
                 - Se agregó 'md:overflow-visible' y 'md:flex-wrap' para que en desktop el popup no se corte.
                 - Se mantiene 'overflow-x-auto' para móvil.
              */}
              <div className="flex items-center gap-3 overflow-x-auto md:overflow-visible md:flex-wrap pb-2 no-scrollbar mask-linear-fade flex-1">
                <div className="flex items-center text-gray-400 text-sm font-medium mr-2 shrink-0">
                  <Filter className="w-4 h-4 mr-1" />
                  Filtros:
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
                      <div className="relative z-50" ref={priceDropdownRef}>
                        <FilterButton 
                          label="Rango Precio" 
                          isActive={showPriceRange || minPrice > 0 || maxPrice < 5000} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPriceRange(!showPriceRange);
                          }} 
                        />
                        
                        {showPriceRange && (
                          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Rango de Precio</h3>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-4">
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
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  Resetear
                                </button>
                                <button 
                                  onClick={() => setShowPriceRange(false)}
                                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-green-700"
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
                        <div className="absolute top-full left-0 mt-2 w-[300px] sm:w-[400px] bg-white rounded-xl shadow-xl border border-gray-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-100">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-900">Intereses</h3>
                            {selectedInterests.length > 0 && (
                              <button onClick={() => setSelectedInterests([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Borrar todo</button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
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
                                  px-3 py-1.5 rounded-full text-xs font-medium transition-all border
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

              {activeTab === 'activities' && (
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1 shrink-0">
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}><List className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md ${viewMode === 'map' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}><Map className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- RESULTADOS (Sin cambios visuales) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Contador de resultados */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-sm font-medium">
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
              <div className="h-[calc(100vh-250px)] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <ActivityMap 
                  activities={filteredActivities.map(a => ({ ...a, difficulty_level: a.difficulty_level || '', tags: a.tags || [] }))} 
                  onActivitySelect={(activity) => navigate(`/activities/${activity.id}`)}
                />
              </div>
            ) : (
              <>
                {loadingActivities ? (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}</div>
                ) : filteredActivities.length === 0 ? (
                  <EmptyState icon={Calendar} text="No se encontraron actividades" subtext="Intenta ajustar los filtros." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            {loadingGroups ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            ) : filteredGroups.length === 0 ? (
              <EmptyState icon={Users} text="No se encontraron grupos" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {activeTab === 'people' && (
          <>
            {loadingPeople ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
            ) : filteredPeople.length === 0 ? (
              <EmptyState icon={UserCircle} text="No se encontraron personas" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <div className="mt-12 flex justify-center pb-10">
           <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-1 shadow-lg max-w-3xl w-full">
              <div className="bg-white rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Quieres unirte a la comunidad?</h2>
                <button onClick={() => navigate('/login')} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md mt-4">
                  Iniciar sesión o Regístrate
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ElementType;
  text: string;
  subtext?: string;
}

const EmptyState = ({ icon: Icon, text, subtext }: EmptyStateProps) => (
  <div className="text-center py-20 flex flex-col items-center justify-center">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Icon className="w-10 h-10 text-gray-300" /></div>
    <h3 className="text-lg font-semibold text-gray-900">{text}</h3>
    {subtext && <p className="text-gray-500 text-sm mt-1 max-w-xs">{subtext}</p>}
  </div>
);

export default PublicSearch;
