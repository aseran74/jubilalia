import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminButtonsProps {
  itemId: string;
  itemType: 'post' | 'group' | 'profile' | 'property' | 'activity';
  onDelete?: (id: string) => void;
  className?: string;
}

const AdminButtons: React.FC<AdminButtonsProps> = ({ 
  itemId, 
  itemType, 
  onDelete, 
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    // Navegar al formulario de edición según el tipo
    switch (itemType) {
      case 'post':
        navigate(`/dashboard/posts/${itemId}/edit`);
        break;
      case 'group':
        navigate(`/dashboard/groups/${itemId}/edit`);
        break;
      case 'profile':
        navigate(`/dashboard/profiles/${itemId}/edit`);
        break;
      case 'property':
        // Para propiedades, necesitamos determinar si es venta o alquiler
        // Por ahora, usaremos una ruta genérica que se puede ajustar
        navigate(`/dashboard/properties/sale/${itemId}/edit`);
        break;
      case 'activity':
        navigate(`/dashboard/activities/${itemId}/edit`);
        break;
      case 'room':
        navigate(`/dashboard/rooms/${itemId}/edit`);
        break;
      default:
        console.warn('Tipo de elemento no reconocido:', itemType);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(itemId);
    } else {
      // Función por defecto si no se proporciona onDelete
      if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
        console.log(`Eliminando ${itemType} con ID:`, itemId);
        // Aquí se podría implementar la lógica de eliminación por defecto
      }
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleEdit}
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        title="Editar"
      >
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Editar
      </button>
      
      <button
        onClick={handleDelete}
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        title="Eliminar"
      >
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Eliminar
      </button>
    </div>
  );
};

export default AdminButtons;
