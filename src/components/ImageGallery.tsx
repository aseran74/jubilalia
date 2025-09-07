import React, { useState } from 'react';
import { Heart, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleOpen = (index: number) => {
    setSelectedImage(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const nextImage = () => {
    setSelectedImage((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Divide las imágenes en el layout
  const mainImage = images[0];
  const secondImage = images[1];
  const thirdImage = images[2];
  const remainingImages = images.slice(3);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="relative">
          {/* Botones de favorito y compartir */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button className="p-3 rounded-full bg-white/90 text-gray-700 shadow-lg hover:bg-white transition-all duration-200">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-full bg-white/90 text-gray-700 shadow-lg hover:bg-white transition-all duration-200">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="h-96 grid grid-cols-2 lg:grid-cols-4 gap-2 p-2">
            {/* Imagen Principal Grande (la primera) */}
            <div className="relative col-span-2 row-span-2 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer" onClick={() => handleOpen(0)}>
              <img
                src={mainImage}
                alt={title}
                className="w-full h-full object-contain transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors">
                  Ver Fotos
                </button>
              </div>
            </div>

            {/* Segunda imagen */}
            {secondImage && (
              <div className="relative col-span-1 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer" onClick={() => handleOpen(1)}>
                <img
                  src={secondImage}
                  alt={title}
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                    Ver más
                  </button>
                </div>
              </div>
            )}

            {/* Tercera imagen */}
            {thirdImage && (
              <div className="relative col-span-1 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer" onClick={() => handleOpen(2)}>
                <img
                  src={thirdImage}
                  alt={title}
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                    Ver más
                  </button>
                </div>
              </div>
            )}
            
            {/* Si hay más de 3 imágenes, muestra el contador en la cuarta miniatura */}
            {remainingImages.length > 0 ? (
              <div className="relative col-span-1 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer" onClick={() => handleOpen(3)}>
                <img
                  src={remainingImages[0]}
                  alt={title}
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    +{remainingImages.length}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal de visualización de imágenes a pantalla completa */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-white text-3xl z-50 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              key={selectedImage}
              src={images[selectedImage]}
              alt={`${title} - Imagen ${selectedImage + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={prevImage}
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          <div className="absolute bottom-12 text-white text-center text-lg font-light">
            {selectedImage + 1} de {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
