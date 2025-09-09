import TelegramBot from "node-telegram-bot-api";

const TOKEN = "8466624294:AAGoACTrRqQ9L_acLVi_bkbeUlcY94bBmyc";

console.log("🤖 Iniciando bot de Telegram...");

try {
  const bot = new TelegramBot(TOKEN, { polling: true });

  console.log("✅ Bot iniciado correctamente");

  // Para grupos
  bot.on("message", (msg) => {
    console.log("📨 Mensaje recibido:");
    console.log("  Grupo:", msg.chat.title || "Chat privado");
    console.log("  Usuario:", msg.from.first_name, msg.from.username ? `(@${msg.from.username})` : "");
    console.log("  Texto:", msg.text || "[Mensaje multimedia]");
    console.log("  Fecha:", new Date(msg.date * 1000).toLocaleString());
    console.log("  ID del grupo:", msg.chat.id);
    console.log("---");
  });

  // Para canales
  bot.on("channel_post", (msg) => {
    console.log("📢 Mensaje en canal:");
    console.log("  Canal:", msg.chat.title);
    console.log("  Texto:", msg.text || "[Mensaje multimedia]");
    console.log("  Fecha:", new Date(msg.date * 1000).toLocaleString());
    console.log("  ID del canal:", msg.chat.id);
    console.log("---");
  });

  // Manejar errores
  bot.on("error", (error) => {
    console.error("❌ Error del bot:", error.message);
  });

  bot.on("polling_error", (error) => {
    console.error("❌ Error de polling:", error.message);
  });

  console.log("🎯 Bot escuchando mensajes...");
  console.log("💡 Escribe algo en tu grupo de Telegram para probar");

} catch (error) {
  console.error("❌ Error iniciando el bot:", error.message);
  process.exit(1);
}
