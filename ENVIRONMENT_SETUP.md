# Configuración de Variables de Entorno - Jubilalia

## Archivo .env

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://sdmkodriokrpsdegweat.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbWtvZHJpb2tycHNkZWd3ZWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjkxOTcsImV4cCI6MjA3MTYwNTE5N30.s4i-P6koEZWq1-Vna-LRjKrNZll8tAGeeNaRCLoELrE

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCNUrv77koEb8ncO3L8gTZhAUcQ7IHEg0s
VITE_FIREBASE_AUTH_DOMAIN=jubilalia-d60c8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jubilalia-d60c8
VITE_FIREBASE_STORAGE_BUCKET=jubilalia-d60c8.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=770858998366
VITE_FIREBASE_APP_ID=1:770858998366:web:cebe2e26b026a68d57b2cf
VITE_FIREBASE_MEASUREMENT_ID=G-E2XLN83Z1H

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
```

## Pasos para configurar:

1. **Copia el archivo `.env.example`** (si existe) a `.env`
2. **O crea manualmente** el archivo `.env` en la raíz del proyecto
3. **Pega las variables** de arriba en el archivo
4. **Reinicia el servidor** de desarrollo después de crear el archivo

## Variables importantes:

### Supabase
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

### Firebase
- `VITE_FIREBASE_API_KEY`: Clave API de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: Dominio de autenticación
- `VITE_FIREBASE_PROJECT_ID`: ID del proyecto Firebase
- `VITE_FIREBASE_STORAGE_BUCKET`: Bucket de almacenamiento
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: ID del remitente de mensajes
- `VITE_FIREBASE_APP_ID`: ID de la aplicación
- `VITE_FIREBASE_MEASUREMENT_ID`: ID de Analytics

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca subas el archivo `.env` a Git
- El archivo `.env` ya está en `.gitignore`
- Las variables con prefijo `VITE_` son visibles en el cliente
- Para variables sensibles del servidor, usa un prefijo diferente

## Verificación

Para verificar que las variables están configuradas correctamente:

1. Reinicia el servidor de desarrollo
2. Abre la consola del navegador
3. Verifica que no hay errores de configuración
4. Comprueba que Firebase y Supabase se conectan correctamente
