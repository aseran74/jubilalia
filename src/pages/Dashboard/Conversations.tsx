import React from 'react';
import ConversationsList from '../../components/dashboard/ConversationsList';

const Conversations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mensajes</h1>
        <p className="text-gray-600">
          Gestiona tus conversaciones y mantén el contacto con otros usuarios.
        </p>
      </div>
      
      <ConversationsList />
    </div>
  );
};

export default Conversations;
