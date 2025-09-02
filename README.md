# 🏠 Jubilalia - Plataforma para Jubilados

Jubilalia es una plataforma web diseñada específicamente para personas jubiladas que buscan compartir vivienda, crear amistades y disfrutar de actividades juntos. Conectamos a personas senior para mejorar su calidad de vida a través de la comunidad.

## ✨ Características Principales

### 🏡 **Compartir Vivienda**
- **Habitaciones**: Publica o busca habitaciones para compartir
- **Propiedades**: Explora casas y pisos grandes para vivir en comunidad
- **Filtros avanzados**: Búsqueda por ubicación, precio, características

### 👥 **Red Social**
- **Perfiles de usuario**: Crea tu perfil con intereses y preferencias
- **Grupos**: Únete a grupos temáticos (deportes, cultura, viajes, etc.)
- **Mensajería**: Chatea con otros usuarios de forma segura
- **Posts**: Comparte experiencias y actividades

### 🎯 **Actividades**
- **Eventos**: Participa en actividades organizadas por la comunidad
- **Categorías**: Deportes, cultura, gastronomía, tecnología, música, arte
- **Geolocalización**: Encuentra actividades cerca de ti

### 🔐 **Seguridad**
- **Autenticación**: Login seguro con Google OAuth
- **Verificación**: Usuarios verificados para mayor seguridad
- **Privacidad**: Control total sobre tu información personal

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Heroicons** para iconografía

### **Backend**
- **Supabase** como Backend as a Service
- **PostgreSQL** para base de datos
- **Row Level Security (RLS)** para seguridad
- **Storage** para imágenes y archivos

### **Autenticación**
- **Supabase Auth** con Google OAuth
- **JWT tokens** para sesiones seguras
- **Protección de rutas** automática

### **Despliegue**
- **Vercel** para hosting
- **GitHub Actions** para CI/CD
- **Variables de entorno** para configuración

## 📋 Requisitos Previos

- **Node.js** 18+ 
- **npm** o **yarn**
- **Cuenta de Supabase**
- **Cuenta de Google Cloud Console** (para OAuth)
- **Cuenta de Vercel** (para despliegue)

## 🛠️ Instalación y Configuración

### 1. **Clonar el repositorio**
```bash
git clone https://github.com/aseran74/jubilalia.git
cd jubilalia/dashboard
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Configurar variables de entorno**
Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui

# Google Places API (opcional)
VITE_GOOGLE_PLACES_API_KEY=tu-clave-google-places
```

### 4. **Configurar Supabase**

#### **Crear proyecto en Supabase:**
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y la clave anónima

#### **Configurar autenticación:**
1. Ve a **Authentication** → **Providers**
2. Habilita **Google** y configura OAuth
3. Agrega las URLs de redirección:
   - `http://localhost:5176/auth/callback` (desarrollo)
   - `https://tu-dominio.vercel.app/auth/callback` (producción)

#### **Configurar base de datos:**
Ejecuta las migraciones SQL en el SQL Editor de Supabase:

```sql
-- Crear tabla de perfiles
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  firebase_uid TEXT, -- Para compatibilidad
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  bio TEXT,
  interests TEXT[],
  location POINT,
  location_details JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);
```

### 5. **Configurar Google Cloud Console**

#### **Crear proyecto OAuth:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**
4. Ve a **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**

#### **Configurar URLs autorizadas:**
**Authorized redirect URIs:**
```
http://localhost:5176/auth/callback
https://tu-dominio.vercel.app/auth/callback
```

**Authorized JavaScript origins:**
```
http://localhost:5176
https://tu-dominio.vercel.app
```

### 6. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5176`

## 🚀 Despliegue en Vercel

### 1. **Conectar con GitHub**
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `jubilalia`

### 2. **Configurar variables de entorno**
En Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-completa
VITE_GOOGLE_PLACES_API_KEY=tu-clave-google-places
```

### 3. **Configurar build**
Vercel detectará automáticamente la configuración de Vite. El build command será:
```bash
npm run build
```

### 4. **Desplegar**
Vercel desplegará automáticamente en cada push a la rama `main`.

## 📁 Estructura del Proyecto

```
dashboard/
├── src/
│   ├── components/          # Componentes React
│   │   ├── auth/           # Autenticación
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── landing/        # Página de inicio
│   │   ├── properties/     # Propiedades
│   │   ├── accommodations/ # Habitaciones
│   │   ├── activities/     # Actividades
│   │   ├── groups/         # Grupos
│   │   ├── messaging/      # Mensajería
│   │   └── debug/          # Herramientas de debug
│   ├── pages/              # Páginas principales
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Configuración y utilidades
│   ├── types/              # Tipos TypeScript
│   └── config/             # Configuración
├── public/                 # Archivos estáticos
├── .env                    # Variables de entorno
├── package.json
└── README.md
```

## 🧪 Herramientas de Debug

La aplicación incluye varias herramientas de diagnóstico:

- **`/auth-diagnostic`** - Diagnóstico de autenticación
- **`/database-diagnostic`** - Diagnóstico de base de datos
- **`/vercel-auth-fix`** - Solucionador de problemas de autenticación en Vercel
- **`/test-connection`** - Test de conexión con Supabase
- **`/test-google-places`** - Test de Google Places API
- **`/test-database`** - Test de base de datos

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:

1. **Issues**: Abre un issue en GitHub
2. **Email**: hola@jubilalia.com
3. **Documentación**: Consulta la documentación de Supabase y Vercel

## 🎯 Roadmap

### **Próximas características:**
- [ ] App móvil (React Native)
- [ ] Sistema de notificaciones push
- [ ] Integración con calendarios
- [ ] Sistema de valoraciones
- [ ] Chat de voz y video
- [ ] Integración con servicios de pago
- [ ] Modo offline
- [ ] Internacionalización (i18n)

---

**Jubilalia** - Conectando jubilados para una vida mejor juntos. 🏠👥✨