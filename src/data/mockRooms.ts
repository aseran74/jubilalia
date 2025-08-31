import type { CreatePropertyListingComplete } from '../types/properties';

export const mockRooms: CreatePropertyListingComplete[] = [
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación luminosa en piso céntrico de Madrid',
      description: 'Hermosa habitación con mucha luz natural, perfecta para personas mayores que buscan compañía y un ambiente tranquilo. El piso está ubicado en una zona muy bien comunicada con transporte público y servicios cercanos.',
      property_type: 'Piso',
      address: 'Calle Gran Vía, 28, 3º Izquierda',
      city: 'Madrid',
      postal_code: '28013',
      country: 'España',
      price: 450,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-01'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 18,
      private_bathroom: true,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 65,
      preferred_age_max: 80,
      smoking_allowed: false,
      pets_allowed: true,
      pet_types: ['Perro pequeño', 'Gato'],
      other_requirements: 'Persona tranquila y respetuosa con el orden'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Ascensor', 'Terraza', 'Parking'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación acogedora en chalet con jardín',
      description: 'Habitación espaciosa en un chalet independiente con jardín privado. Ideal para personas que disfrutan de la naturaleza y buscan un ambiente familiar. Zona residencial muy tranquila.',
      property_type: 'Chalet',
      address: 'Avenida de la Paz, 156',
      city: 'Barcelona',
      postal_code: '08025',
      country: 'España',
      price: 520,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-15'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 16,
      private_bathroom: false,
      has_balcony: false,
      preferred_gender: 'female',
      preferred_age_min: 60,
      preferred_age_max: 75,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Preferiblemente mujer jubilada, ordenada y silenciosa'
    },
    amenities: ['Calefacción', 'Aire acondicionado', 'Internet/WiFi', 'Jardín', 'Piscina', 'Parking'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación moderna en ático con vistas al mar',
      description: 'Espectacular habitación en ático con vistas panorámicas al Mediterráneo. Decoración moderna y funcional. Perfecta para personas activas que aprecian la belleza del mar.',
      property_type: 'Ático',
      address: 'Paseo Marítimo, 45, 8º',
      city: 'Valencia',
      postal_code: '46011',
      country: 'España',
      price: 580,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-03-01'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 20,
      private_bathroom: true,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 70,
      smoking_allowed: true,
      pets_allowed: true,
      pet_types: ['Perro', 'Gato', 'Pájaro'],
      other_requirements: 'Persona activa y sociable, que disfrute de la vida al aire libre'
    },
    amenities: ['Calefacción', 'Aire acondicionado', 'Internet/WiFi', 'Terraza', 'Gimnasio', 'Spa'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación tranquila en residencia senior',
      description: 'Habitación confortable en residencia especializada para personas mayores. Servicios incluidos: limpieza, comidas y actividades sociales. Ambiente seguro y profesional.',
      property_type: 'Residencia',
      address: 'Calle Mayor, 89',
      city: 'Sevilla',
      postal_code: '41001',
      country: 'España',
      price: 680,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-20'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 14,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 70,
      preferred_age_max: 85,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Persona mayor que valore los servicios incluidos y la compañía'
    },
    amenities: ['Calefacción', 'Aire acondicionado', 'Internet/WiFi', 'Lavadora', 'Secadora', 'Cocina equipada', 'Ascensor', 'Rampa de acceso', 'Baño adaptado', 'Puertas anchas'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación familiar en casa de campo',
      description: 'Habitación espaciosa en casa de campo tradicional. Entorno rural muy tranquilo, ideal para personas que buscan paz y naturaleza. Huerta propia y animales de granja.',
      property_type: 'Casa de Campo',
      address: 'Camino Rural, 23',
      city: 'Toledo',
      postal_code: '45001',
      country: 'España',
      price: 380,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-10'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 22,
      private_bathroom: false,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 60,
      preferred_age_max: 78,
      smoking_allowed: true,
      pets_allowed: true,
      pet_types: ['Perro', 'Gato', 'Conejo'],
      other_requirements: 'Persona que disfrute del campo y la vida rural'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Jardín', 'Huerta', 'Establo', 'Parking'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación elegante en piso de lujo',
      description: 'Habitación de lujo en piso de alta gama. Decoración elegante y sofisticada. Servicios premium incluidos. Ubicación exclusiva en zona residencial de alto standing.',
      property_type: 'Piso de Lujo',
      address: 'Paseo de la Castellana, 200',
      city: 'Madrid',
      postal_code: '28046',
      country: 'España',
      price: 850,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-03-15'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 25,
      private_bathroom: true,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 75,
      smoking_allowed: false,
      pets_allowed: true,
      pet_types: ['Perro pequeño', 'Gato'],
      other_requirements: 'Persona con estilo de vida refinado y respetuosa del entorno'
    },
    amenities: ['Calefacción', 'Aire acondicionado', 'Internet/WiFi', 'Lavadora', 'Secadora', 'Cocina equipada', 'Ascensor', 'Terraza', 'Jardín', 'Piscina', 'Parking', 'Gimnasio', 'Spa'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación acogedora en estudio independiente',
      description: 'Estudio completamente independiente con cocina y baño propio. Ideal para personas que buscan privacidad pero también compañía. Zona universitaria muy animada.',
      property_type: 'Estudio',
      address: 'Calle Universidad, 15, 2º',
      city: 'Granada',
      postal_code: '18001',
      country: 'España',
      price: 420,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-25'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 28,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'male',
      preferred_age_min: 65,
      preferred_age_max: 80,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Hombre mayor, preferiblemente ex-profesor o profesional'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Cocina equipada', 'Ascensor'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación histórica en palacete restaurado',
      description: 'Habitación única en palacete del siglo XIX completamente restaurado. Decoración clásica con comodidades modernas. Ubicación histórica en el centro de la ciudad.',
      property_type: 'Palacete',
      address: 'Plaza Mayor, 7',
      city: 'Salamanca',
      postal_code: '37002',
      country: 'España',
      price: 720,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-03-10'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 30,
      private_bathroom: true,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 60,
      preferred_age_max: 75,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Persona que aprecie la historia y la arquitectura clásica'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Ascensor', 'Terraza', 'Jardín', 'Biblioteca'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación moderna en loft industrial',
      description: 'Habitación en loft con diseño industrial moderno. Techos altos y espacios abiertos. Ideal para personas con espíritu creativo y que aprecian el diseño contemporáneo.',
      property_type: 'Loft',
      address: 'Calle Industria, 45',
      city: 'Bilbao',
      postal_code: '48001',
      country: 'España',
      price: 480,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-28'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 19,
      private_bathroom: false,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 70,
      smoking_allowed: true,
      pets_allowed: true,
      pet_types: ['Gato'],
      other_requirements: 'Persona creativa y abierta a estilos de vida alternativos'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Lavadora', 'Secadora', 'Cocina equipada', 'Ascensor', 'Terraza'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación familiar en dúplex espacioso',
      description: 'Habitación en dúplex familiar muy espacioso. Ambiente cálido y acogedor. Ideal para personas que buscan un entorno familiar y compañía. Zona residencial tranquila.',
      property_type: 'Dúplex',
      address: 'Avenida de la Familia, 89',
      city: 'Málaga',
      postal_code: '29001',
      country: 'España',
      price: 390,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-12'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 17,
      private_bathroom: false,
      has_balcony: true,
      preferred_gender: 'female',
      preferred_age_min: 65,
      preferred_age_max: 78,
      smoking_allowed: false,
      pets_allowed: true,
      pet_types: ['Perro pequeño', 'Gato'],
      other_requirements: 'Mujer mayor que disfrute de la compañía familiar'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Lavadora', 'Secadora', 'Cocina equipada', 'Ascensor', 'Terraza', 'Jardín', 'Piscina'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación zen en casa japonesa',
      description: 'Habitación con decoración minimalista inspirada en la filosofía zen japonesa. Ambiente de paz y tranquilidad. Ideal para personas que buscan equilibrio y serenidad.',
      property_type: 'Casa Japonesa',
      address: 'Calle del Zen, 12',
      city: 'Zaragoza',
      postal_code: '50001',
      country: 'España',
      price: 550,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-03-05'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 15,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 60,
      preferred_age_max: 75,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Persona que valore la tranquilidad y el minimalismo'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Jardín japonés', 'Sala de meditación', 'Té verde incluido'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación artística en casa de artistas',
      description: 'Habitación en casa habitada por artistas. Ambiente creativo y bohemio. Ideal para personas con espíritu artístico que buscan inspiración y compañía creativa.',
      property_type: 'Casa de Artistas',
      address: 'Calle del Arte, 67',
      city: 'Valencia',
      postal_code: '46002',
      country: 'España',
      price: 460,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-18'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 16,
      private_bathroom: false,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 72,
      smoking_allowed: true,
      pets_allowed: true,
      pet_types: ['Gato', 'Pájaro'],
      other_requirements: 'Persona con sensibilidad artística y mente abierta'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Estudio de arte', 'Terraza', 'Jardín'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación náutica en barco restaurado',
      description: 'Habitación única en barco histórico restaurado. Experiencia de vida náutica sin moverse del puerto. Ideal para personas que aman el mar y buscan algo diferente.',
      property_type: 'Barco Restaurado',
      address: 'Puerto Deportivo, Muelle 3',
      city: 'Alicante',
      postal_code: '03001',
      country: 'España',
      price: 680,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-03-20'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 12,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 60,
      preferred_age_max: 75,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Persona que ame el mar y no tenga problemas de movilidad'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Cocina equipada', 'Terraza del barco', 'Vistas al mar'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación ecológica en casa sostenible',
      description: 'Habitación en casa completamente sostenible y ecológica. Energía solar, huerta orgánica y materiales naturales. Ideal para personas concienciadas con el medio ambiente.',
      property_type: 'Casa Ecológica',
      address: 'Camino Verde, 34',
      city: 'Vitoria-Gasteiz',
      postal_code: '01001',
      country: 'España',
      price: 520,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-22'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 18,
      private_bathroom: false,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 70,
      smoking_allowed: false,
      pets_allowed: true,
      pet_types: ['Perro', 'Gato'],
      other_requirements: 'Persona concienciada con la sostenibilidad y la vida ecológica'
    },
    amenities: ['Calefacción solar', 'Internet/WiFi', 'Huerta orgánica', 'Compostaje', 'Energía renovable'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación literaria en casa de escritores',
      description: 'Habitación en casa habitada por escritores y amantes de la literatura. Biblioteca extensa y ambiente intelectual. Ideal para personas que aman la lectura y el debate.',
      property_type: 'Casa de Escritores',
      address: 'Calle de las Letras, 23',
      city: 'Oviedo',
      postal_code: '33001',
      country: 'España',
      price: 480,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-03-08'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 16,
      private_bathroom: false,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 60,
      preferred_age_max: 75,
      smoking_allowed: true,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Persona amante de la literatura y el debate intelectual'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Biblioteca extensa', 'Sala de lectura', 'Té y café incluidos'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación musical en casa de músicos',
      description: 'Habitación en casa habitada por músicos profesionales. Instrumentos disponibles y ambiente musical. Ideal para personas que aman la música y buscan inspiración.',
      property_type: 'Casa de Músicos',
      address: 'Calle de la Música, 45',
      city: 'Córdoba',
      postal_code: '14001',
      country: 'España',
      price: 540,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-30'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 17,
      private_bathroom: true,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 70,
      smoking_allowed: false,
      pets_allowed: true,
      pet_types: ['Gato'],
      other_requirements: 'Persona amante de la música, preferiblemente con conocimientos musicales'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Instrumentos disponibles', 'Sala de ensayo', 'Terraza'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación gastronómica en casa de chefs',
      description: 'Habitación en casa habitada por chefs profesionales. Cocina gourmet y ambiente culinario. Ideal para personas que aman la buena comida y la cocina.',
      property_type: 'Casa de Chefs',
      address: 'Calle del Sabor, 78',
      city: 'San Sebastián',
      postal_code: '20001',
      country: 'España',
      price: 720,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-03-25'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 16,
      private_bathroom: false,
      has_balcony: true,
      preferred_gender: 'any',
      preferred_age_min: 60,
      preferred_age_max: 75,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Persona amante de la gastronomía y la buena mesa'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Cocina gourmet', 'Cena incluida', 'Terraza', 'Huerta de hierbas'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación deportiva en casa de atletas',
      description: 'Habitación en casa habitada por atletas y entrenadores. Gimnasio completo y ambiente deportivo. Ideal para personas activas que buscan mantenerse en forma.',
      property_type: 'Casa de Atletas',
      address: 'Avenida del Deporte, 156',
      city: 'Pamplona',
      postal_code: '31001',
      country: 'España',
      price: 580,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-02-14'
    },
    roomRequirements: {
      bed_type: 'double',
      room_area: 18,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 55,
      preferred_age_max: 70,
      smoking_allowed: false,
      pets_allowed: true,
      pet_types: ['Perro activo'],
      other_requirements: 'Persona activa que valore el deporte y la vida saludable'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Gimnasio completo', 'Sala de yoga', 'Piscina', 'Parking'],
    images: []
  },
  {
    listing: {
      listing_type: 'room_rental',
      title: 'Habitación espiritual en monasterio restaurado',
      description: 'Habitación en monasterio histórico restaurado. Ambiente de paz y espiritualidad. Ideal para personas que buscan reflexión y un entorno sereno.',
      property_type: 'Monasterio Restaurado',
      address: 'Camino del Monasterio, 12',
      city: 'Santiago de Compostela',
      postal_code: '15705',
      country: 'España',
      price: 650,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: '2024-03-12'
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 14,
      private_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 65,
      preferred_age_max: 80,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: 'Persona que valore la espiritualidad y la vida contemplativa'
    },
    amenities: ['Calefacción', 'Internet/WiFi', 'Capilla', 'Jardines del monasterio', 'Biblioteca espiritual', 'Meditación incluida'],
    images: []
  }
];
