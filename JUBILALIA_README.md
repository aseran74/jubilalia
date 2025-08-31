# 🏠 Jubilalia - Aplicación para Personas Jubiladas

Jubilalia es una aplicación web diseñada específicamente para personas jubiladas (55+) que buscan compartir vivienda, crear amistades y disfrutar de la vida en comunidad.

## ✨ Características Principales

### 🏠 Compartir Habitación
- Buscador de compañeros de habitación compatibles
- Filtros por edad, género, gustos y preferencias
- Chat interno para conocerse antes de decidir
- Perfiles detallados con fotos y biografías

### 🏘️ Alojamientos Grandes
- Marketplace de casas y residencias
- Opción de unirse varias parejas para vivir juntos
- Filtros por precio, ubicación y tipo de alojamiento
- Información detallada de cada propiedad

### 🌟 Red Social de Ocio
- Muro de publicaciones para planes y actividades
- Grupos temáticos (ajedrez, caminatas, viajes, etc.)
- Calendario de eventos con opción de apuntarse
- Notificaciones de actividades cercanas

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Autenticación**: Firebase Authentication
- **Base de Datos**: Supabase (PostgreSQL)
- **Iconos**: Lucide React
- **Enrutamiento**: React Router DOM

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd dashboard
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase
La aplicación ya está configurada con Firebase. Si necesitas cambiar la configuración, edita `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id",
  measurementId: "tu-measurement-id"
};
```

### 4. Configurar Supabase
La aplicación ya está configurada con Supabase. Si necesitas cambiar la configuración, edita `src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'tu-url-de-supabase'
const supabaseAnonKey = 'tu-clave-anonima'
```

### 5. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📱 Estructura de la Aplicación

### Páginas Principales
- **`/jubilalia`** - Página de inicio/landing
- **`/jubilalia/login`** - Página de inicio de sesión
- **`/jubilalia/register`** - Página de registro
- **`/jubilalia/dashboard`** - Dashboard principal (requiere autenticación)

### Componentes Principales
- `AuthProvider` - Contexto de autenticación global
- `ProtectedRoute` - Componente para proteger rutas privadas
- `useAuth` - Hook personalizado para manejar autenticación

### Características de Accesibilidad
- Botones grandes y fáciles de usar
- Tipografía clara y legible
- Colores con buen contraste
- Navegación intuitiva con iconos reconocibles
- Diseño responsive para diferentes dispositivos

## 🎨 Paleta de Colores

La aplicación utiliza una paleta de colores cálidos y acogedores:
- **Verde**: `#10B981` - Representa crecimiento y vida
- **Azul**: `#3B82F6` - Representa confianza y estabilidad
- **Naranja**: `#F59E0B` - Representa energía y entusiasmo
- **Gradientes**: Combinaciones suaves entre estos colores

## 🔐 Autenticación

### Métodos de Login
- Email y contraseña
- Google (OAuth)
- Facebook (OAuth)

### Funcionalidades de Seguridad
- Validación de formularios en el frontend
- Protección de rutas privadas
- Manejo de errores de autenticación
- Sincronización automática con Supabase

## 📊 Base de Datos

### Tablas Principales
- **`profiles`** - Perfiles de usuario
- **`user_settings`** - Configuraciones del usuario
- **`user_sessions`** - Sesiones de usuario

### Características
- Row Level Security (RLS) habilitado
- Políticas de seguridad por usuario
- Triggers automáticos para timestamps
- Relaciones entre tablas bien definidas

## 🚧 Funcionalidades en Desarrollo

Las siguientes funcionalidades están marcadas como "próximamente":
- Sistema de chat interno
- Búsqueda avanzada de compañeros
- Marketplace de alojamientos
- Sistema de grupos temáticos
- Calendario de eventos
- Sistema de notificaciones

## 🧪 Pruebas

Para ejecutar las pruebas:
```bash
npm test
```

## 📦 Build de Producción

Para crear una versión de producción:
```bash
npm run build
```

## 🌐 Despliegue

La aplicación está optimizada para despliegue en:
- Vercel
- Netlify
- Firebase Hosting
- Cualquier servidor estático

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Consulta la documentación de Firebase y Supabase

## 🎯 Roadmap

### Versión 1.1
- [ ] Sistema de chat interno
- [ ] Búsqueda avanzada de compañeros
- [ ] Filtros adicionales

### Versión 1.2
- [ ] Marketplace de alojamientos
- [ ] Sistema de pagos
- [ ] Verificación de identidad

### Versión 1.3
- [ ] Aplicación móvil
- [ ] Notificaciones push
- [ ] Integración con redes sociales

---

**Jubilalia** - Conectando personas jubiladas para una vida mejor 🏠❤️
