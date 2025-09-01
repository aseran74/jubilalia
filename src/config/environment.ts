// Configuración de variables de entorno para Jubilalia
// Copia este archivo como .env en la raíz del proyecto

export const environment = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://sdmkodriokrpsdegweat.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbWtvZHJpb2tycHNkZWd3ZWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjkxOTcsImV4cCI6MjA3MTYwNTE5N30.s4i-P6koEZWq1-Vna-LRjKrNZll8tAGeeNaRCLoELrE',
    // Google OAuth Configuration (configurado en Supabase Dashboard)
    googleClientId: import.meta.env.VITE_SUPABASE_GOOGLE_CLIENT_ID || '',
    googleClientSecret: import.meta.env.VITE_SUPABASE_GOOGLE_CLIENT_SECRET || '',
  },

  // Google Places API Configuration
  googlePlaces: {
    apiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '',
    libraries: ['places', 'geometry'],
    defaultLocation: {
      lat: 40.4168, // Madrid, España
      lng: -3.7038
    },
    searchRadius: 50000, // 50km por defecto
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Jubilalia',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://sdmkodriokrpsdegweat.supabase.co',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    locationSharing: import.meta.env.VITE_ENABLE_LOCATION_SHARING === 'true',
  },
};

// Variables de entorno que necesitas configurar en tu archivo .env:
/*
# Supabase Configuration
VITE_SUPABASE_URL=https://sdmkodriokrpsdegweat.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google OAuth (configurado en Supabase Dashboard)
VITE_SUPABASE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_SUPABASE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Google Places API
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# App Configuration
VITE_APP_NAME=Jubilalia
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# API Configuration
VITE_API_BASE_URL=https://sdmkodriokrpsdegweat.supabase.co
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_LOCATION_SHARING=true
*/
