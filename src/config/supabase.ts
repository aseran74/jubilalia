// Configuración de buckets de Supabase Storage para Jubilalia

export const SUPABASE_BUCKETS = {
  // Imágenes de habitaciones
  ROOM_IMAGES: 'room-images',
  
  // Imágenes de propiedades
  PROPERTY_IMAGES: 'property-images',
  
  // Imágenes de actividades
  ACTIVITY_PHOTOS: 'activity-photos',
  
  // Imágenes de posts
  POST_IMAGES: 'post-images',
  
  // Imágenes de perfiles de usuario
  USER_AVATARS: 'user-avatars',
  
  // Documentos y archivos
  DOCUMENTS: 'documents',
  
  // Imágenes temporales
  TEMP_IMAGES: 'temp-images'
} as const;

// Tipos para TypeScript
export type BucketName = typeof SUPABASE_BUCKETS[keyof typeof SUPABASE_BUCKETS];

// Función helper para validar nombres de bucket
export const isValidBucket = (bucketName: string): bucketName is BucketName => {
  return Object.values(SUPABASE_BUCKETS).includes(bucketName as BucketName);
};

// Función helper para obtener la URL pública de una imagen
export const getImageUrl = (_bucketName: BucketName, filePath: string): string => {
  // Esta función se puede usar para generar URLs consistentes
  // Por ahora, retorna el filePath ya que Supabase maneja las URLs automáticamente
  return filePath;
};

// Configuración de buckets por tipo de contenido
export const BUCKET_CONFIG = {
  [SUPABASE_BUCKETS.ROOM_IMAGES]: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 10
  },
  [SUPABASE_BUCKETS.PROPERTY_IMAGES]: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20
  },
  [SUPABASE_BUCKETS.ACTIVITY_PHOTOS]: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 10
  },
  [SUPABASE_BUCKETS.POST_IMAGES]: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 10
  },
  [SUPABASE_BUCKETS.USER_AVATARS]: {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png'],
    maxFiles: 1
  },
  [SUPABASE_BUCKETS.DOCUMENTS]: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFiles: 5
  },
  [SUPABASE_BUCKETS.TEMP_IMAGES]: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5
  }
} as const;

