import TelegramBot from "node-telegram-bot-api";

const TOKEN = "8466624294:AAGoACTrRqQ9L_acLVi_bkbeUlcY94bBmyc";
const bot = new TelegramBot(TOKEN, { polling: true });

console.log("🤖 Bot de Telegram iniciado...");

// Para grupos
bot.on("message", (msg) => {
  console.log("📨 Mensaje en grupo:", msg.chat.title, "=>", msg.text);
  console.log("📊 Datos completos:", {
    chatId: msg.chat.id,
    chatTitle: msg.chat.title,
    chatType: msg.chat.type,
    userId: msg.from.id,
    username: msg.from.username,
    firstName: msg.from.first_name,
    text: msg.text,
    date: new Date(msg.date * 1000).toISOString()
  });
});

// Para canales
bot.on("channel_post", (msg) => {
  console.log("📢 Mensaje en canal:", msg.chat.title, "=>", msg.text);
  console.log("📊 Datos completos:", {
    chatId: msg.chat.id,
    chatTitle: msg.chat.title,
    chatType: msg.chat.type,
    text: msg.text,
    date: new Date(msg.date * 1000).toISOString()
  });
});

// Manejar errores
bot.on("error", (error) => {
  console.error("❌ Error del bot:", error);
});

bot.on("polling_error", (error) => {
  console.error("❌ Error de polling:", error);
});

console.log("✅ Bot escuchando mensajes... Escribe algo en tu grupo/canal para probar!");
