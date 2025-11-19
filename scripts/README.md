# Scripts de Automatización

## add-travel-images.js

Script para agregar imágenes automáticamente a los viajes desde Pexels.

## add-group-images.js

Script para agregar imágenes automáticamente a los grupos desde Pexels.

### Requisitos Previos

1. **API Key de Pexels** (gratuita):
   - Regístrate en https://www.pexels.com/api/
   - Obtén tu API key desde tu dashboard

2. **Service Role Key de Supabase**:
   - Ve a tu proyecto en Supabase Dashboard
   - Settings > API
   - Copia la "service_role" key (⚠️ Manténla segura, no la compartas)

3. **Dependencias**:
   ```bash
   npm install node-fetch
   ```

### Configuración

Crea un archivo `.env` en la raíz del proyecto o configura las variables de entorno:

**Opción 1: Sin prefijo VITE_ (solo para scripts Node.js)**
```env
PEXELS_API_KEY=tu_api_key_de_pexels
SUPABASE_URL=https://sdmkodriokrpsdegweat.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_de_supabase
```

**Opción 2: Con prefijo VITE_ (compatible con frontend y scripts)**
```env
VITE_PEXELS_API_KEY=tu_api_key_de_pexels
VITE_SUPABASE_URL=https://sdmkodriokrpsdegweat.supabase.co
VITE_SUPABASE_SERVICE_KEY=tu_service_role_key_de_supabase
```

> **Nota**: El script acepta ambas variantes. Si planeas usar la API key de Pexels también en el frontend, usa el prefijo `VITE_`. Para el `SUPABASE_SERVICE_KEY`, **NO** uses el prefijo `VITE_` en producción ya que es una clave sensible que no debe exponerse al frontend.

### Uso

```bash
node scripts/add-travel-images.js
```

### ¿Qué hace el script?

1. ✅ Obtiene todos los viajes sin imágenes
2. 🔍 Busca una imagen apropiada en Pexels basada en la ciudad/destino
3. 📥 Descarga la imagen
4. 📤 La sube a Supabase Storage (bucket: `activity-photos`)
5. 💾 Crea el registro en la tabla `activity_images`

### Características

- **Mapeo inteligente**: Usa un diccionario de ciudades para mejorar las búsquedas
- **Rate limiting**: Espera 1 segundo entre requests para no sobrecargar la API
- **Manejo de errores**: Continúa procesando aunque falle algún viaje
- **Limpieza automática**: Elimina archivos temporales después de procesar

### Notas

- El script procesa todos los viajes sin imágenes
- Si un viaje ya tiene imagen, se omite
- Las imágenes se descargan en formato JPG
- Se usa la primera imagen encontrada en Pexels para cada destino

### Alternativa: Usar Unsplash

Si prefieres usar Unsplash en lugar de Pexels, puedes modificar el script:

1. Obtén una API key de Unsplash: https://unsplash.com/developers
2. Cambia la función `getImageFromPexels` para usar la API de Unsplash:
   ```javascript
   const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`;
   ```

---

## add-group-images.js

### Descripción
Script que busca imágenes relacionadas para grupos desde la API de Pexels y las sube a Supabase Storage, actualizando el campo `image_url` de cada grupo.

### Características
- Busca imágenes basadas en la categoría, ciudad o nombre del grupo
- Descarga y sube imágenes a Supabase Storage (bucket: `group-images`)
- Actualiza el campo `image_url` de los grupos
- Maneja rate limiting de Pexels (2 segundos entre requests)
- Solo procesa grupos sin imágenes

### Configuración
Las mismas variables de entorno que `add-travel-images.js`:
- `VITE_PEXELS_API_KEY` o `PEXELS_API_KEY`
- `VITE_SUPABASE_URL` o `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (sin prefijo VITE_)

### Uso
```bash
npm run add-group-images
```

### Mapeo de búsqueda
El script busca imágenes usando:
1. **Categoría del grupo** (si existe): "Viajes", "Cultura", "Deporte", etc.
2. **Ciudad del grupo** (si existe): "Madrid", "Barcelona", etc.
3. **Nombre del grupo** como fallback

### Notas
- El bucket `group-images` debe existir en Supabase Storage
- Las imágenes se guardan en formato JPEG
- El script procesa solo grupos sin `image_url` o con `image_url` vacío

