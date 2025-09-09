# 🤖 Configuración de Integración con Telegram

Esta guía te ayudará a configurar la integración con Telegram para que los grupos de Jubilalia puedan mostrar mensajes de grupos de Telegram en tiempo real.

## 📋 Requisitos Previos

- Node.js instalado
- Un bot de Telegram creado con @BotFather
- Acceso a un grupo de Telegram donde seas administrador

## 🚀 Pasos de Configuración

### 1. Crear un Bot de Telegram

1. Abre Telegram y busca `@BotFather`
2. Envía el comando `/newbot`
3. Sigue las instrucciones para crear tu bot
4. **Guarda el token** que te proporciona (ejemplo: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Configurar el Bot en tu Grupo

1. Añade tu bot al grupo de Telegram donde quieres ver los mensajes
2. Dale permisos de administrador al bot (necesario para leer mensajes)
3. Obtén el ID del grupo:
   - Añade el bot `@userinfobot` al grupo
   - Envía cualquier mensaje
   - El bot te responderá con el ID del grupo (ejemplo: `-1001234567890`)

### 3. Configurar Variables de Entorno

1. Copia el archivo `backend/env.example` a `backend/.env`
2. Edita el archivo `.env` con tus datos:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=tu_token_aqui

# Supabase Configuration (opcional para desarrollo local)
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima

# Server Configuration
PORT=3001
```

### 4. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 5. Ejecutar el Backend

```bash
cd backend
npm start
```

El servidor estará disponible en `http://localhost:3001`

### 6. Probar la Conexión

1. Ejecuta el archivo de prueba:
```bash
node test-telegram.js
```

2. Escribe algo en tu grupo de Telegram
3. Deberías ver los mensajes en la consola

### 7. Configurar un Grupo en Jubilalia

1. Ve a la página de grupos en Jubilalia
2. Crea o edita un grupo
3. Añade el ID del grupo de Telegram en el campo correspondiente
4. Guarda los cambios

## 🔧 Funcionalidades

### ✅ Lo que funciona:
- Ver mensajes de grupos de Telegram en tiempo real
- Enviar mensajes desde Jubilalia a Telegram
- Actualización automática cada 5 segundos
- Interfaz responsive para móvil y desktop
- Indicador de estado de conexión

### ⚠️ Limitaciones:
- El bot debe ser administrador del grupo de Telegram
- Solo funciona con grupos, no con canales privados
- Los mensajes se almacenan temporalmente en memoria (se pierden al reiniciar el servidor)

## 🛠️ Solución de Problemas

### Error: "Bot was blocked by the user"
- El bot fue bloqueado por un usuario
- Desbloquea el bot o pídele al usuario que lo desbloquee

### Error: "Chat not found"
- El ID del grupo es incorrecto
- Verifica que el bot esté añadido al grupo
- Asegúrate de que el ID sea negativo (empieza con `-`)

### Error: "Forbidden: bot is not a member of the group chat"
- El bot no está en el grupo
- Añade el bot al grupo de Telegram

### Error: "Forbidden: bot is not an admin"
- El bot no es administrador
- Dale permisos de administrador al bot en el grupo

### No se ven mensajes en Jubilalia
- Verifica que el backend esté ejecutándose
- Comprueba la consola del navegador para errores
- Asegúrate de que el ID del grupo esté correcto en la base de datos

## 📱 Uso en la Aplicación

1. Ve a cualquier grupo que tenga vinculación con Telegram
2. Haz clic en "Chat Telegram"
3. Verás los mensajes del grupo en tiempo real
4. Puedes enviar mensajes desde Jubilalia al grupo de Telegram

## 🔒 Seguridad

- El token del bot debe mantenerse secreto
- No compartas el archivo `.env`
- El bot solo puede leer mensajes de grupos donde es administrador
- Los mensajes se almacenan temporalmente y se eliminan al reiniciar

## 🚀 Despliegue en Producción

Para desplegar en producción:

1. Configura las variables de entorno en tu servidor
2. Usa un proceso manager como PM2
3. Configura un proxy reverso (nginx) si es necesario
4. Considera usar Redis para almacenar mensajes persistentemente

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend
2. Verifica la consola del navegador
3. Asegúrate de que todas las dependencias estén instaladas
4. Comprueba que el bot tenga los permisos correctos
