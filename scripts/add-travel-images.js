/**
 * Script para agregar imágenes automáticamente a los viajes desde Pexels
 * 
 * Uso:
 * 1. Obtén una API key gratuita de Pexels: https://www.pexels.com/api/
 * 2. Configura las variables de entorno en .env:
 *    - VITE_PEXELS_API_KEY=tu_api_key (o PEXELS_API_KEY)
 *    - VITE_SUPABASE_URL=tu_supabase_url (o SUPABASE_URL)
 *    - SUPABASE_SERVICE_KEY=tu_service_role_key (⚠️ NO uses VITE_ para esta clave sensible)
 * 3. Ejecuta: npm run add-travel-images
 * 
 * Nota: El script acepta variables con prefijo VITE_ (para compatibilidad con frontend)
 *       o sin prefijo (solo para scripts Node.js)
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env
config({ path: path.join(__dirname, '..', '.env') });

// Configuración
// Acepta tanto variables con prefijo VITE_ (para compatibilidad) como sin prefijo
const PEXELS_API_KEY = process.env.VITE_PEXELS_API_KEY || process.env.PEXELS_API_KEY || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sdmkodriokrpsdegweat.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET_NAME = 'activity-photos';
const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre requests para evitar rate limiting (Pexels permite 200 requests/hora en plan gratuito)

// Crear cliente de Supabase con service role key (necesaria para subir archivos)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapeo de ciudades a términos de búsqueda más específicos
const citySearchTerms = {
  'Madrid': 'Madrid Spain',
  'Barcelona': 'Barcelona Spain',
  'Valencia': 'Valencia Spain',
  'Sevilla': 'Seville Spain',
  'Granada': 'Granada Spain',
  'Córdoba': 'Cordoba Spain',
  'Málaga': 'Malaga Spain',
  'Bilbao': 'Bilbao Spain',
  'Santiago de Compostela': 'Santiago de Compostela Spain',
  'Lisboa': 'Lisbon Portugal',
  'Oporto': 'Porto Portugal',
  'París': 'Paris France',
  'Roma': 'Rome Italy',
  'Venecia': 'Venice Italy',
  'Florencia': 'Florence Italy',
  'Milán': 'Milan Italy',
  'Viena': 'Vienna Austria',
  'Praga': 'Prague Czech Republic',
  'Budapest': 'Budapest Hungary',
  'Berlín': 'Berlin Germany',
  'Ámsterdam': 'Amsterdam Netherlands',
  'Bruselas': 'Brussels Belgium',
  'Londres': 'London UK',
  'Dublín': 'Dublin Ireland',
  'Estambul': 'Istanbul Turkey',
  'Atenas': 'Athens Greece',
  'El Cairo': 'Cairo Egypt',
  'Marrakech': 'Marrakech Morocco',
  'Dubái': 'Dubai UAE',
  'Nueva York': 'New York City',
  'Toronto': 'Toronto Canada',
  'Buenos Aires': 'Buenos Aires Argentina',
  'Lima': 'Lima Peru',
  'Bangkok': 'Bangkok Thailand',
  'Ciudad del Cabo': 'Cape Town South Africa',
  'Ammán': 'Amman Jordan',
  'Dubrovnik': 'Dubrovnik Croatia',
  'Bergen': 'Bergen Norway',
  'Zúrich': 'Zurich Switzerland',
  'Estrasburgo': 'Strasbourg France',
  'Frankfurt': 'Frankfurt Germany',
  'Vielha': 'Val d Aran Spain',
  'Espargos': 'Sal Cape Verde',
  'Las Palmas': 'Gran Canaria Spain',
  'Santa Cruz de Tenerife': 'Tenerife Spain',
  'Palma': 'Mallorca Spain',
  'Mahón': 'Menorca Spain',
  'Ibiza': 'Ibiza Spain',
  'Puerto del Rosario': 'Fuerteventura Spain',
  'Arrecife': 'Lanzarote Spain',
};

/**
 * Obtiene múltiples imágenes de Pexels basada en el término de búsqueda
 */
async function getImagesFromPexels(searchTerm, count = 3) {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=${count}&orientation=landscape`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      console.error(`Error en Pexels API: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      // Retornar URLs de las imágenes (preferir large, sino medium)
      return data.photos.map(photo => photo.src.large || photo.src.medium || photo.src.original);
    }

    return [];
  } catch (error) {
    console.error(`Error obteniendo imágenes de Pexels para "${searchTerm}":`, error.message);
    return [];
  }
}

/**
 * Descarga una imagen desde una URL
 */
async function downloadImage(imageUrl, filePath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    return true;
  } catch (error) {
    console.error(`Error descargando imagen:`, error.message);
    return false;
  }
}

/**
 * Sube una imagen a Supabase Storage
 */
async function uploadImageToSupabase(filePath, fileName) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName).substring(1);
    const finalFileName = `travel-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePathStorage = `${BUCKET_NAME}/${finalFileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePathStorage, fileContent, {
        contentType: `image/${fileExt}`,
        upsert: false
      });

    if (error) {
      console.error(`Error subiendo imagen a Supabase:`, error);
      return null;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePathStorage);

    return publicUrl;
  } catch (error) {
    console.error(`Error en uploadImageToSupabase:`, error.message);
    return null;
  }
}

/**
 * Crea múltiples registros en activity_images
 */
async function createActivityImages(activityId, imageUrls) {
  try {
    const imagesData = imageUrls.map((imageUrl, index) => ({
      activity_id: activityId,
      image_url: imageUrl,
      image_order: index + 1,
      is_primary: index === 0 // La primera es la principal
    }));

    const { error } = await supabase
      .from('activity_images')
      .insert(imagesData);

    if (error) {
      console.error(`Error creando registros en activity_images:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error en createActivityImages:`, error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando proceso de agregar imágenes a viajes...\n');

  // Verificar configuración
  if (!PEXELS_API_KEY) {
    console.error('❌ Error: PEXELS_API_KEY no está configurada');
    console.log('   Obtén una API key gratuita en: https://www.pexels.com/api/');
    process.exit(1);
  }

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_KEY no está configurada');
    console.log('   Necesitas la service role key para subir archivos a Supabase Storage');
    process.exit(1);
  }

  // Obtener todos los viajes sin imágenes
  console.log('📋 Obteniendo viajes sin imágenes...');
  const { data: activities, error: activitiesError } = await supabase
    .from('activities')
    .select(`
      id,
      title,
      city,
      activity_type
    `)
    .eq('activity_type', 'Viajes');

  if (activitiesError) {
    console.error('❌ Error obteniendo actividades:', activitiesError);
    process.exit(1);
  }

  // Obtener conteo de imágenes por actividad
  const { data: imagesCount } = await supabase
    .from('activity_images')
    .select('activity_id')
    .in('activity_id', activities.map(a => a.id));

  // Contar imágenes por actividad
  const imageCountByActivity = new Map();
  if (imagesCount) {
    imagesCount.forEach(img => {
      imageCountByActivity.set(img.activity_id, (imageCountByActivity.get(img.activity_id) || 0) + 1);
    });
  }

  // Filtrar actividades que necesitan más imágenes (menos de 3)
  const activitiesNeedingImages = activities.filter(activity => {
    const currentCount = imageCountByActivity.get(activity.id) || 0;
    return currentCount < 3;
  });

  console.log(`✅ Encontrados ${activitiesNeedingImages.length} viajes que necesitan completar imágenes (objetivo: 3 por viaje)\n`);

  if (activitiesNeedingImages.length === 0) {
    console.log('✨ Todos los viajes ya tienen 3 imágenes!');
    process.exit(0);
  }

  // Crear directorio temporal para imágenes
  const tempDir = path.join(__dirname, '..', 'temp-images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;

  // Procesar cada viaje
  for (let i = 0; i < activitiesNeedingImages.length; i++) {
    const activity = activitiesNeedingImages[i];
    const currentImageCount = imageCountByActivity.get(activity.id) || 0;
    const imagesNeeded = 3 - currentImageCount;
    
    console.log(`\n[${i + 1}/${activitiesNeedingImages.length}] Procesando: ${activity.title}`);
    console.log(`   📊 Imágenes actuales: ${currentImageCount}/3, necesitamos: ${imagesNeeded}`);

    // Determinar término de búsqueda
    let searchTerm = activity.city || activity.title;
    
    // Usar mapeo si existe
    if (citySearchTerms[activity.city]) {
      searchTerm = citySearchTerms[activity.city];
    } else if (activity.title) {
      // Extraer ciudad del título si es posible
      const titleMatch = activity.title.match(/(?:Ciudades Int\.:|Rutas Exprés:|Mercadillos Navideños:|Grandes Viajes:)?\s*(.+?)(?:\s*\(|$)/);
      if (titleMatch && titleMatch[1]) {
        searchTerm = titleMatch[1].trim();
      }
    }

    console.log(`   🔍 Buscando ${imagesNeeded} imagen(es) para: "${searchTerm}"`);

    // Obtener solo las imágenes necesarias de Pexels
    const imageUrls = await getImagesFromPexels(searchTerm, imagesNeeded);
    
    if (imageUrls.length === 0) {
      console.log(`   ⚠️  No se encontraron imágenes para "${searchTerm}"`);
      errorCount++;
      continue;
    }

    const uploadedUrls = [];
    
    // Procesar cada imagen
    for (let imgIndex = 0; imgIndex < imageUrls.length; imgIndex++) {
      const imageUrl = imageUrls[imgIndex];
      
      // Descargar imagen
      const fileName = `temp-${activity.id}-${imgIndex}.jpg`;
      const filePath = path.join(tempDir, fileName);
      
      const downloaded = await downloadImage(imageUrl, filePath);
      if (!downloaded) {
        console.log(`   ⚠️  Error descargando imagen ${imgIndex + 1}`);
        continue;
      }

      // Subir a Supabase
      const publicUrl = await uploadImageToSupabase(filePath, fileName);
      
      if (!publicUrl) {
        console.log(`   ⚠️  Error subiendo imagen ${imgIndex + 1}`);
        // Limpiar archivo temporal
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        continue;
      }

      uploadedUrls.push(publicUrl);
      
      // Limpiar archivo temporal
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (uploadedUrls.length === 0) {
      console.log(`   ❌ No se pudieron subir imágenes`);
      errorCount++;
      continue;
    }

    // Crear registros en activity_images
    console.log(`   📤 Creando ${uploadedUrls.length} registros de imágenes...`);
    const created = await createActivityImages(activity.id, uploadedUrls);
    
    if (!created) {
      console.log(`   ❌ Error creando registros`);
      errorCount++;
    } else {
      console.log(`   ✅ ${uploadedUrls.length} imagen(es) agregada(s) exitosamente!`);
      successCount++;
    }

    // Esperar entre requests para no sobrecargar la API (más tiempo si hay rate limiting)
    if (i < activitiesNeedingImages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }

  // Limpiar directorio temporal
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log(`\n\n✨ Proceso completado!`);
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`   📊 Total procesado: ${activitiesNeedingImages.length}`);
  console.log(`\n💡 Nota: Si hubo errores 429 (rate limiting), espera 1 hora y ejecuta el script de nuevo para completar las imágenes faltantes.`);
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

