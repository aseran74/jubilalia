/**
 * Script para agregar imágenes automáticamente a los grupos desde Pexels
 * 
 * Uso:
 * 1. Obtén una API key gratuita de Pexels: https://www.pexels.com/api/
 * 2. Configura las variables de entorno en .env:
 *    - VITE_PEXELS_API_KEY=tu_api_key (o PEXELS_API_KEY)
 *    - VITE_SUPABASE_URL=tu_supabase_url (o SUPABASE_URL)
 *    - SUPABASE_SERVICE_KEY=tu_service_role_key (⚠️ NO uses VITE_ para esta clave sensible)
 * 3. Ejecuta: npm run add-group-images
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
const PEXELS_API_KEY = process.env.VITE_PEXELS_API_KEY || process.env.PEXELS_API_KEY || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sdmkodriokrpsdegweat.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET_NAME = 'group-images';
const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre requests

// Crear cliente de Supabase con service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapeo de ciudades y categorías a términos de búsqueda
const searchTermsMap = {
  // Ciudades
  'Madrid': 'Madrid Spain community',
  'Barcelona': 'Barcelona Spain group',
  'Valencia': 'Valencia Spain people',
  'Sevilla': 'Seville Spain social',
  'Bilbao': 'Bilbao Spain',
  'Santiago de Compostela': 'Santiago de Compostela Spain',
  'Lisboa': 'Lisbon Portugal group',
  'Oporto': 'Porto Portugal',
  'París': 'Paris France community',
  'Roma': 'Rome Italy group',
  'Viena': 'Vienna Austria',
  'Berlín': 'Berlin Germany',
  'Bruselas': 'Brussels Belgium',
  'Estambul': 'Istanbul Turkey',
  'Dubái': 'Dubai UAE',
  // Categorías
  'Viajes': 'travel group community',
  'Cultura': 'culture group people',
  'Deporte': 'sports group fitness',
  'Gastronomía': 'food group cooking',
  'Social': 'social group community',
  'Música': 'music group band',
  'Arte': 'art group creative',
  'Naturaleza': 'nature group outdoor',
};

/**
 * Obtiene una imagen de Pexels basada en el término de búsqueda
 */
async function getImageFromPexels(searchTerm) {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log('⚠️ Rate limit alcanzado, esperando más tiempo...');
        return null;
      }
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large || data.photos[0].src.medium;
    }
    
    return null;
  } catch (error) {
    console.error(`Error obteniendo imagen de Pexels para "${searchTerm}":`, error.message);
    return null;
  }
}

/**
 * Descarga una imagen desde una URL y la sube a Supabase Storage
 */
async function downloadAndUploadImage(imageUrl, groupId, groupName) {
  try {
    // Descargar imagen
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Error descargando imagen: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generar nombre de archivo único
    const fileName = `${groupId}-${Date.now()}.jpg`;
    const filePath = `group-images/${fileName}`;
    
    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) {
      // Si el bucket no existe, intentar crearlo
      if (uploadError.message.includes('Bucket not found')) {
        console.log(`⚠️ Bucket ${BUCKET_NAME} no existe. Creándolo...`);
        // Nota: La creación de buckets requiere permisos de administrador
        // Por ahora, asumimos que el bucket existe o se creará manualmente
        throw uploadError;
      }
      throw uploadError;
    }
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error subiendo imagen para grupo ${groupName}:`, error.message);
    return null;
  }
}

/**
 * Procesa un grupo: busca imagen y actualiza el campo image_url
 */
async function processGroup(group) {
  try {
    // Determinar término de búsqueda
    let searchTerm = '';
    
    // Prioridad: categoría > ciudad > nombre del grupo
    if (group.category && searchTermsMap[group.category]) {
      searchTerm = searchTermsMap[group.category];
    } else if (group.city && searchTermsMap[group.city]) {
      searchTerm = searchTermsMap[group.city];
    } else if (group.city) {
      searchTerm = `${group.city} group community`;
    } else if (group.category) {
      searchTerm = `${group.category} group`;
    } else {
      searchTerm = `${group.name} group community`;
    }
    
    console.log(`   🔍 Buscando imagen para: "${searchTerm}"`);
    
    // Obtener imagen de Pexels
    const imageUrl = await getImageFromPexels(searchTerm);
    
    if (!imageUrl) {
      console.log(`   ⚠️ No se encontró imagen para: ${group.name}`);
      return false;
    }
    
    // Descargar y subir a Supabase
    console.log(`   📤 Subiendo imagen a Supabase Storage...`);
    const publicUrl = await downloadAndUploadImage(imageUrl, group.id, group.name);
    
    if (!publicUrl) {
      console.log(`   ❌ Error subiendo imagen para: ${group.name}`);
      return false;
    }
    
    // Actualizar el campo image_url del grupo
    const { error: updateError } = await supabase
      .from('groups')
      .update({ image_url: publicUrl })
      .eq('id', group.id);
    
    if (updateError) {
      console.error(`   ❌ Error actualizando grupo ${group.name}:`, updateError.message);
      return false;
    }
    
    console.log(`   ✅ Imagen agregada exitosamente!`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error procesando grupo ${group.name}:`, error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando proceso de agregar imágenes a grupos...\n');
  
  // Validar configuración
  if (!PEXELS_API_KEY) {
    console.error('❌ Error: PEXELS_API_KEY no está configurada en las variables de entorno');
    process.exit(1);
  }
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_KEY no está configurada en las variables de entorno');
    process.exit(1);
  }
  
  try {
    // Obtener grupos sin imagen o con imagen vacía
    console.log('📋 Obteniendo grupos sin imágenes...');
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, category, city, image_url')
      .or('image_url.is.null,image_url.eq.');
    
    if (groupsError) {
      throw groupsError;
    }
    
    if (!groups || groups.length === 0) {
      console.log('✅ Todos los grupos ya tienen imágenes!');
      return;
    }
    
    console.log(`✅ Encontrados ${groups.length} grupos que necesitan imágenes\n`);
    
    // Procesar cada grupo
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      console.log(`[${i + 1}/${groups.length}] Procesando: ${group.name}`);
      
      const success = await processGroup(group);
      
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Esperar entre requests para evitar rate limiting
      if (i < groups.length - 1) {
        console.log(`   ⏳ Esperando ${DELAY_BETWEEN_REQUESTS / 1000} segundos...\n`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }
    }
    
    console.log('\n🎉 Proceso completado!');
    console.log(`✅ Grupos con imágenes agregadas: ${successCount}`);
    console.log(`❌ Grupos con errores: ${errorCount}`);
    console.log(`📊 Total procesado: ${groups.length}`);
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
}

// Ejecutar
main();

