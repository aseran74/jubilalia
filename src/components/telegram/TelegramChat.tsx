import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Clock, Send, RefreshCw, AlertCircle } from 'lucide-react';

interface TelegramMessage {
  id: number;
  chatId: string;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  text: string;
  date: string;
  messageType: 'text' | 'photo' | 'document';
  hasPhoto: boolean;
  hasDocument: boolean;
}

interface TelegramChatProps {
  groupId: string;
  telegramGroupId?: string;
  onSendMessage?: (message: string) => void;
}

const TelegramChat: React.FC<TelegramChatProps> = ({ 
  groupId, 
  telegramGroupId, 
  onSendMessage 
}) => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // URL del backend de Telegram (ajustar según tu configuración)
  const TELEGRAM_API_URL = 'http://localhost:3001';

  const fetchMessages = async () => {
    if (!telegramGroupId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/api/telegram/messages/${telegramGroupId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
        setIsConnected(true);
      } else {
        setError(data.error || 'Error obteniendo mensajes');
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Error fetching Telegram messages:', err);
      setError('No se pudo conectar con el servidor de Telegram');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !telegramGroupId || !onSendMessage) return;

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/api/telegram/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: telegramGroupId,
          message: newMessage
        })
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage('');
        // Refrescar mensajes después de enviar
        setTimeout(fetchMessages, 1000);
      } else {
        setError(data.error || 'Error enviando mensaje');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('No se pudo enviar el mensaje');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Cargar mensajes al montar el componente
  useEffect(() => {
    if (telegramGroupId) {
      fetchMessages();
      // Configurar actualización automática cada 5 segundos
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [telegramGroupId]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (!telegramGroupId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Grupo no vinculado con Telegram</span>
        </div>
        <p className="text-yellow-700 text-sm mt-1">
          Este grupo no tiene un grupo de Telegram vinculado. Contacta al administrador para configurarlo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Chat de Telegram</h3>
            {isConnected && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Conectado</span>
              </div>
            )}
          </div>
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Mensajes */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Cargando mensajes...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay mensajes aún</p>
              <p className="text-sm">Los mensajes aparecerán aquí cuando alguien escriba en el grupo de Telegram</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-medium text-sm">
                  {message.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {message.firstName} {message.lastName}
                  </span>
                  {message.username && (
                    <span className="text-gray-500 text-xs">@{message.username}</span>
                  )}
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(message.date)}
                  </span>
                </div>
                <div className="text-gray-800 text-sm">
                  {message.text || (
                    <span className="text-gray-500 italic">
                      {message.hasPhoto && '📷 Foto'}
                      {message.hasDocument && '📄 Documento'}
                      {!message.text && !message.hasPhoto && !message.hasDocument && 'Mensaje multimedia'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input para enviar mensaje */}
      {onSendMessage && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramChat;
