# Sistema de Propiedades - Jubilalia

## Descripción General

El sistema de propiedades de Jubilalia permite a los usuarios publicar y buscar diferentes tipos de alojamientos y propiedades, específicamente diseñado para personas jubiladas (55+). El sistema incluye 4 tipos principales de listados:

## Tipos de Listados

### 1. 🏠 Alquiler de Habitación (`room_rental`)
- **Propósito**: Publicitar una habitación para alquilar con compañeros
- **Características**:
  - Requisitos de edad preferida (55+)
  - Preferencias de género
  - Política de fumadores/no fumadores
  - Admisión de mascotas y tipos permitidos
  - Otros requisitos personalizados

### 2. 🏢 Alquiler de Propiedad Completa (`property_rental`)
- **Propósito**: Alquilar una propiedad completa para varias personas senior
- **Características**:
  - Número máximo de inquilinos
  - Tipos de inquilinos preferidos (senior, parejas, etc.)
  - Gastos compartidos
  - Servicios incluidos (agua, luz, internet)
  - Características de accesibilidad
  - Parking disponible

### 3. 🏡 Compra de Propiedad Compartida (`property_purchase`)
- **Propósito**: Compra de una propiedad entre varias personas para jubilación
- **Características**:
  - Precio total de la propiedad
  - Número de participaciones disponibles
  - Precio por participación
  - Límites de participaciones por persona
  - Tipo de gestión (autogestionada, profesional, cooperativa)
  - Estructura legal

### 4. 🌴 Alquiler Temporal - Holydeo.com (`seasonal_rental`)
- **Propósito**: Alquilar propiedades fuera de temporada en la playa
- **Características**:
  - Temporada de disponibilidad (septiembre a julio)
  - Estancia mínima y máxima
  - Distancia a la playa
  - Tipo de acceso a la playa
  - Amenidades de temporada
  - Descuentos fuera de temporada

## Estructura de la Base de Datos

### Tablas Principales

#### `property_listings`
- Información básica de todos los listados
- Tipo de listado, título, descripción, ubicación, precio
- Características físicas (habitaciones, baños, superficie)

#### `room_rental_requirements`
- Requisitos específicos para alquiler de habitaciones
- Preferencias de edad, género, fumadores, mascotas

#### `property_rental_requirements`
- Requisitos para alquiler de propiedades completas
- Número de inquilinos, gastos compartidos, servicios

#### `property_purchase_requirements`
- Requisitos para compra compartida
- Participaciones, precios, gestión, estructura legal

#### `seasonal_rental_requirements`
- Requisitos para alquiler temporal
- Temporadas, estancias, acceso a playa

#### `property_images`
- Imágenes de las propiedades
- Orden y imagen principal

#### `property_amenities`
- Amenidades disponibles
- Tipos: básicas, lujo, accesibilidad, exteriores

#### `property_inquiries`
- Solicitudes de interés de los usuarios
- Tipos: visita, solicitud, pregunta, oferta

## Funcionalidades del Sistema

### Para Usuarios
- **Crear Listados**: Formulario paso a paso (4 pasos)
- **Buscar Propiedades**: Filtros por tipo, ciudad, precio, características
- **Contactar Propietarios**: Sistema de mensajería interna
- **Gestionar Listados**: Editar, eliminar, marcar como disponible/no disponible

### Para Propietarios
- **Gestión de Solicitudes**: Aceptar, rechazar, responder consultas
- **Estadísticas**: Ver vistas, contactos, interés generado
- **Actualizaciones**: Modificar precios, disponibilidad, características

## Formulario de Creación

### Paso 1: Selección de Tipo
- Elección visual entre las 4 opciones
- Iconos y descripciones claras
- Colores diferenciados por tipo

### Paso 2: Información Básica
- Título del anuncio
- Tipo de propiedad
- Descripción detallada
- Dirección completa
- Ciudad y código postal

### Paso 3: Características y Precio
- Precio y tipo (mensual, total, por persona)
- Número de habitaciones y baños
- Superficie total
- Moneda

### Paso 4: Disponibilidad y Amenidades
- Fechas de disponibilidad
- Selección de amenidades
- Subida de imágenes
- Requisitos específicos según el tipo

## Componentes React

### `PropertyListingForm`
- Formulario principal con navegación por pasos
- Validación en tiempo real
- Manejo de errores
- Subida de imágenes

### `Properties`
- Lista de todas las propiedades
- Filtros de búsqueda
- Estadísticas generales
- Grid responsivo de tarjetas

### Funciones de Supabase
- `createPropertyListing`: Crear listado completo
- `getPropertyListings`: Obtener listados con filtros
- `getPropertyStats`: Estadísticas del sistema
- `createPropertyInquiry`: Solicitudes de interés

## Características Técnicas

### Seguridad
- Row Level Security (RLS) en Supabase
- Usuarios solo pueden editar sus propios listados
- Verificación de autenticación en todas las operaciones

### Rendimiento
- Índices en campos de búsqueda frecuentes
- Paginación para listados grandes
- Lazy loading de imágenes

### Escalabilidad
- Estructura modular de base de datos
- Separación de requisitos por tipo
- Sistema de amenidades flexible

## Flujo de Usuario

1. **Registro/Login**: Usuario se autentica
2. **Crear Listado**: Completa formulario paso a paso
3. **Publicación**: Listado aparece en búsquedas
4. **Interés**: Otros usuarios pueden contactar
5. **Gestión**: Propietario gestiona solicitudes
6. **Cierre**: Listado se marca como no disponible

## Próximas Funcionalidades

- [ ] Sistema de valoraciones y reseñas
- [ ] Notificaciones en tiempo real
- [ ] Integración con mapas
- [ ] Sistema de verificación de propiedades
- [ ] Chat interno entre usuarios
- [ ] Calendario de disponibilidad
- [ ] Sistema de pagos integrado
- [ ] Reportes y analytics avanzados

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + RLS)
- **Autenticación**: Firebase Auth
- **Estado**: React Context + Hooks
- **Navegación**: React Router DOM
- **Iconos**: Lucide React
- **Validación**: Formularios nativos con validación personalizada

## Instalación y Configuración

1. **Variables de Entorno**: Configurar `.env` con credenciales de Supabase y Firebase
2. **Base de Datos**: Ejecutar migraciones de Supabase
3. **Dependencias**: `npm install` para instalar paquetes
4. **Desarrollo**: `npm run dev` para iniciar servidor

## Contribución

El sistema está diseñado para ser extensible y mantenible. Para agregar nuevos tipos de listados:

1. Agregar nuevo tipo en `ListingType`
2. Crear tabla de requisitos específicos
3. Actualizar tipos TypeScript
4. Agregar lógica en formulario
5. Actualizar funciones de Supabase
6. Agregar enlaces de navegación
