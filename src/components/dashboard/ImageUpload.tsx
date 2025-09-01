import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages?: number;
  className?: string;
  bucketName: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImagesUploaded, 
  maxImages = 5,
  className = '',
  bucketName
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      alert('Por favor selecciona solo archivos de imagen');
      return;
    }

    if (imageFiles.length > maxImages) {
      alert(`Puedes subir máximo ${maxImages} imágenes`);
      return;
    }

    await uploadImages(imageFiles);
  };

  const uploadImages = async (files: File[]) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Validar que el bucket sea uno de los permitidos
      // if (!isValidBucket(bucketName)) {
      //   const validBuckets = Object.values(SUPABASE_BUCKETS);
      //   throw new Error(`Bucket '${bucketName}' no está permitido. Buckets válidos: ${validBuckets.join(', ')}`);
      // }
      
      const uploadedUrls: string[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${bucketName}/${fileName}`;

        // Subir imagen a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          continue;
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      if (uploadedUrls.length > 0) {
        onImagesUploaded(uploadedUrls);
        setUploadProgress(100);
      }

    } catch (error) {
      console.error('Error en la subida de imágenes:', error);
      alert('Error al subir las imágenes. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de subida */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Subiendo imágenes...
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(uploadProgress)}% completado
                </p>
              </div>
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Arrastra y suelta imágenes aquí
                </p>
                <p className="text-sm text-gray-500">
                  o haz clic para seleccionar archivos
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Máximo {maxImages} imágenes • PNG, JPG, GIF hasta 5MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="text-sm text-gray-600">
        <p>• Las imágenes se optimizarán automáticamente</p>
        <p>• Formato recomendado: JPG o PNG</p>
        <p>• Tamaño máximo por imagen: 5MB</p>
      </div>
    </div>
  );
};

export default ImageUpload;
