# Jubilalia - Plataforma de Alojamiento y Comunidad

Jubilalia es una plataforma integral de alojamiento y comunidad desarrollada con **React, TypeScript y Tailwind CSS**, basada en el template TailAdmin. La aplicación proporciona una solución completa para la gestión de alojamientos, habitaciones, propiedades y comunidades.

## 🏠 Características Principales

### Alojamiento y Propiedades
- **Habitaciones**: Búsqueda y publicación de habitaciones en alquiler
- **Propiedades en Venta**: Listado y gestión de propiedades para venta
- **Propiedades en Alquiler**: Sistema completo de alquiler de viviendas
- **Integración con Google Places**: Búsqueda de ubicaciones con autocompletado

### Comunidad y Social
- **Grupos**: Creación y gestión de grupos temáticos
- **Posts y Comentarios**: Sistema de publicaciones dentro de grupos
- **Mensajería**: Chat integrado entre usuarios
- **Búsqueda de Personas**: Encuentra personas por ubicación y preferencias

### Tecnologías Utilizadas
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: Google Places API, Google Maps
- **Autenticación**: Supabase Auth con OAuth (Google, Facebook)

## 🚀 Instalación

### Prerrequisitos
- Node.js 18.x o superior (recomendado 20.x)
- Cuenta de Supabase
- API Key de Google Places

### Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/aseran74/jubilalia.git
   cd jubilalia/dashboard
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crear archivo `.env` en la carpeta `dashboard`:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   VITE_GOOGLE_PLACES_API_KEY=tu_api_key_de_google_places
   ```

4. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
dashboard/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── accommodations/  # Componentes de habitaciones
│   │   ├── groups/         # Componentes de grupos
│   │   ├── messaging/      # Componentes de mensajería
│   │   ├── properties/     # Componentes de propiedades
│   │   └── people/         # Componentes de búsqueda de personas
│   ├── pages/              # Páginas principales
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Configuración de Supabase
│   └── types/              # Definiciones de TypeScript
├── migrations/             # Migraciones de base de datos
└── public/                 # Archivos estáticos
```

## 🗄️ Base de Datos

La aplicación utiliza Supabase con las siguientes tablas principales:
- `profiles` - Perfiles de usuario
- `rooms` - Habitaciones en alquiler
- `property_listings` - Propiedades en venta/alquiler
- `groups` - Grupos de la comunidad
- `group_posts` - Posts dentro de grupos
- `conversations` - Conversaciones de mensajería

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build

## 📱 Funcionalidades

### Para Usuarios
- Registro e inicio de sesión
- Creación y edición de perfil
- Búsqueda de alojamientos
- Publicación de habitaciones/propiedades
- Participación en grupos
- Sistema de mensajería

### Para Administradores
- Panel de administración completo
- Gestión de usuarios y contenido
- Estadísticas y reportes
- Configuración del sistema

## 🚀 Despliegue

La aplicación está preparada para despliegue en Vercel:

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente desde la rama `main`

## 📄 Licencia

Este proyecto está basado en TailAdmin React (MIT License) y está disponible bajo la misma licencia.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, por favor abre un issue en GitHub.

---

**Jubilalia** - Conectando personas, creando comunidades 🏠✨
