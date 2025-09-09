import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Telegram Bot
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN no encontrado en las variables de entorno');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// Almacenar mensajes en memoria (en producción usar Redis o DB)
const telegramMessages = new Map(); // groupId -> messages[]

console.log('🤖 Iniciando bot de Telegram...');

// Escuchar mensajes de grupos
bot.on('message', async (msg) => {
  try {
    // Solo procesar mensajes de grupos
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
      const groupId = msg.chat.id.toString();
      const messageData = {
        id: msg.message_id,
        chatId: groupId,
        userId: msg.from.id,
        username: msg.from.username || msg.from.first_name || 'Usuario',
        firstName: msg.from.first_name || '',
        lastName: msg.from.last_name || '',
        text: msg.text || '',
        date: new Date(msg.date * 1000).toISOString(),
        messageType: msg.photo ? 'photo' : msg.document ? 'document' : 'text',
        hasPhoto: !!msg.photo,
        hasDocument: !!msg.document
      };

      // Almacenar mensaje en memoria
      if (!telegramMessages.has(groupId)) {
        telegramMessages.set(groupId, []);
      }
      
      const messages = telegramMessages.get(groupId);
      messages.push(messageData);
      
      // Mantener solo los últimos 100 mensajes por grupo
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100);
      }

      console.log(`📨 Mensaje recibido en grupo ${groupId}: ${messageData.username}: ${messageData.text.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error('❌ Error procesando mensaje de Telegram:', error);
  }
});

// Manejar errores del bot
bot.on('error', (error) => {
  console.error('❌ Error del bot de Telegram:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Error de polling de Telegram:', error);
});

// Endpoints de la API

// Obtener mensajes de un grupo específico
app.get('/api/telegram/messages/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = telegramMessages.get(groupId) || [];
    
    res.json({
      success: true,
      data: messages.slice(-50), // Últimos 50 mensajes
      count: messages.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo mensajes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener información de un grupo
app.get('/api/telegram/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const chatInfo = await bot.getChat(groupId);
    
    res.json({
      success: true,
      data: {
        id: chatInfo.id,
        title: chatInfo.title,
        type: chatInfo.type,
        memberCount: chatInfo.member_count || 0,
        description: chatInfo.description || '',
        inviteLink: chatInfo.invite_link || ''
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo información del grupo:', error);
    res.status(500).json({
      success: false,
      error: 'No se pudo obtener información del grupo'
    });
  }
});

// Obtener grupos de Telegram vinculados a grupos de Jubilalia
app.get('/api/telegram/groups', async (req, res) => {
  try {
    const { data: groups, error } = await supabase
      .from('groups')
      .select('id, name, telegram_group_id')
      .not('telegram_group_id', 'is', null);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('❌ Error obteniendo grupos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo grupos'
    });
  }
});

// Enviar mensaje a un grupo de Telegram
app.post('/api/telegram/send', async (req, res) => {
  try {
    const { groupId, message } = req.body;
    
    if (!groupId || !message) {
      return res.status(400).json({
        success: false,
        error: 'groupId y message son requeridos'
      });
    }

    const result = await bot.sendMessage(groupId, message);
    
    res.json({
      success: true,
      data: {
        messageId: result.message_id,
        date: result.date
      }
    });
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      error: 'No se pudo enviar el mensaje'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Telegram Bot API funcionando correctamente',
    timestamp: new Date().toISOString(),
    groups: telegramMessages.size
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Telegram Bot API corriendo en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📨 Mensajes: http://localhost:${PORT}/api/telegram/messages/:groupId`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  bot.stopPolling();
  process.exit(0);
});
