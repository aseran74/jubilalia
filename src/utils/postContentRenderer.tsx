import React from 'react';
import { useNavigate } from 'react-router-dom';

// Función para renderizar el contenido del post y hacer clickable las propiedades relacionadas
export const renderPostContent = (content: string, navigate: (path: string) => void): (string | JSX.Element)[] => {
  if (!content) return [content];
  
  // Patrón para detectar: [Propiedad relacionada: Título - Ubicación | ID:xxx | TYPE:rental/sale]
  const propertyPatternWithId = /\[Propiedad relacionada: ([^\|]+) \| ID:([a-f0-9-]+) \| TYPE:(\w+)\]/g;
  
  // Patrón para formato antiguo sin ID: [Propiedad relacionada: Título - Ubicación]
  const propertyPatternOld = /\[Propiedad relacionada: ([^\]]+)\]/g;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;
  
  // Primero buscar el formato nuevo con ID
  while ((match = propertyPatternWithId.exec(content)) !== null) {
    // Agregar texto antes del match
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    
    const propertyTitle = match[1].trim();
    const propertyId = match[2];
    const propertyType = match[3];
    
    // Crear el enlace clickable
    parts.push(
      <span key={`property-${keyCounter++}`} className="inline-block">
        <span className="text-gray-600">[</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const route = propertyType === 'rental' 
              ? `/dashboard/properties/rental/${propertyId}`
              : `/dashboard/properties/sale/${propertyId}`;
            navigate(route);
          }}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
        >
          Propiedad relacionada: {propertyTitle}
        </button>
        <span className="text-gray-600">]</span>
      </span>
    );
    
    lastIndex = propertyPatternWithId.lastIndex;
  }
  
  // Si no encontramos formato nuevo, buscar formato antiguo (solo mostrar texto, no clickable)
  if (lastIndex === 0) {
    while ((match = propertyPatternOld.exec(content)) !== null) {
      // Agregar texto antes del match
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      // Mostrar el texto sin hacerlo clickable (no tenemos el ID)
      parts.push(
        <span key={`property-old-${keyCounter++}`} className="text-gray-600">
          [{match[1]}]
        </span>
      );
      
      lastIndex = propertyPatternOld.lastIndex;
    }
  }
  
  // Agregar el resto del contenido
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : [content];
};
