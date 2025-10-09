# 📱 Guía para Generar APK con Capacitor - Jubilalia

## ✅ Pasos Completados

1. ✅ Capacitor instalado y configurado
2. ✅ Plataforma Android añadida
3. ✅ Build de producción generado
4. ✅ Archivos sincronizados con Android
5. ✅ Android Studio abierto

---

## 🚀 Generar APK en Android Studio

### **Paso 1: Esperar a que Gradle termine de sincronizar**
- En la parte inferior de Android Studio verás "Gradle Build Running..."
- Espera a que termine (puede tardar varios minutos la primera vez)

### **Paso 2: Generar APK de Debug (para pruebas)**

**Opción A - APK de Debug (más rápido):**
1. En el menú superior: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Espera a que compile (2-5 minutos)
3. Cuando termine, verás una notificación: **"APK(s) generated successfully"**
4. Click en **"locate"** para abrir la carpeta
5. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

**Opción B - APK Firmado (para publicar):**
1. En el menú: **Build → Generate Signed Bundle / APK**
2. Selecciona **APK** → Next
3. Si no tienes keystore:
   - Click en **"Create new..."**
   - Rellena los datos:
     - Key store path: `C:\Proyectos\Jubilalia\jubilalia-keystore.jks`
     - Password: (elige uno seguro y guárdalo)
     - Alias: `jubilalia`
     - Validity: 25 años
     - First and Last Name: Tu nombre
     - Organization: Jubilalia
   - Click **OK**
4. Selecciona **release** → Finish
5. El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📦 Instalar APK en tu Móvil

### **Método 1: Por Cable USB**
1. Conecta tu móvil Android al PC
2. Habilita "Depuración USB" en tu móvil:
   - Ajustes → Acerca del teléfono
   - Toca 7 veces en "Número de compilación"
   - Vuelve → Opciones de desarrollador
   - Activa "Depuración USB"
3. En Android Studio:
   - Click en el botón **▶️ Run** (triángulo verde)
   - Selecciona tu dispositivo
   - La app se instalará automáticamente

### **Método 2: Transferir APK**
1. Copia el archivo `app-debug.apk` o `app-release.apk` a tu móvil
2. En el móvil, abre el archivo APK
3. Permite "Instalar desde fuentes desconocidas" si te lo pide
4. Instala la aplicación

---

## 🔧 Configuración Adicional

### **Permisos de la App (AndroidManifest.xml)**

Ya están configurados automáticamente:
- ✅ Internet
- ✅ Acceso a red
- ✅ Cámara (para fotos de perfil/propiedades)
- ✅ Almacenamiento (para guardar imágenes)

### **Icono de la App**

Para cambiar el icono:
1. Genera iconos en: https://icon.kitchen/
2. Descarga el paquete de iconos
3. Reemplaza los archivos en: `android/app/src/main/res/`
   - `mipmap-hdpi/`
   - `mipmap-mdpi/`
   - `mipmap-xhdpi/`
   - `mipmap-xxhdpi/`
   - `mipmap-xxxhdpi/`

### **Nombre de la App**

Para cambiar el nombre que aparece en el móvil:
1. Abre: `android/app/src/main/res/values/strings.xml`
2. Cambia:
```xml
<string name="app_name">Jubilalia</string>
```

---

## 🔄 Actualizar la App

Cada vez que hagas cambios en el código:

```bash
# 1. Compilar la web
npm run build

# 2. Sincronizar con Android
npx cap sync

# 3. Abrir en Android Studio
npx cap open android

# 4. Generar nuevo APK (Build → Build APK)
```

---

## 📱 Publicar en Google Play Store

### **Requisitos:**
1. Cuenta de Google Play Developer ($25 una sola vez)
2. APK firmado (release)
3. Icono de alta resolución (512x512px)
4. Capturas de pantalla
5. Descripción de la app
6. Política de privacidad

### **Pasos:**
1. Ve a: https://play.google.com/console
2. Crea una nueva aplicación
3. Sube el APK firmado
4. Completa la información de la tienda
5. Envía para revisión (1-3 días)

---

## ⚙️ Configuración del Proyecto

### **Archivo: capacitor.config.ts**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jubilalia.app',
  appName: 'Jubilalia',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### **Variables de Entorno (.env)**
Las variables de entorno se incluyen automáticamente en el build:
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ VITE_GOOGLE_PLACES_API_KEY

---

## 🐛 Solución de Problemas

### **Error: "SDK not found"**
- Instala Android SDK desde Android Studio
- Tools → SDK Manager → Android 13.0 (API 33)

### **Error: "Gradle sync failed"**
- File → Invalidate Caches → Restart

### **La app se cierra al abrirla**
- Revisa los logs: View → Tool Windows → Logcat
- Verifica que las variables de entorno estén correctas

### **No aparecen las imágenes**
- Verifica que la URL de Supabase sea accesible desde el móvil
- Comprueba los permisos de internet en AndroidManifest.xml

---

## 📊 Información del Proyecto

- **App ID:** com.jubilalia.app
- **Nombre:** Jubilalia
- **Plataforma:** Android
- **Framework:** Capacitor 6
- **Web Framework:** React + Vite
- **Backend:** Supabase

---

## 🎉 ¡Listo!

Tu app Jubilalia ya está configurada como aplicación Android. Ahora puedes:
- ✅ Instalarla en cualquier móvil Android
- ✅ Distribuirla a usuarios de prueba
- ✅ Publicarla en Google Play Store
- ✅ Actualizarla fácilmente con nuevos cambios

**¿Necesitas ayuda?** Consulta la documentación oficial:
- Capacitor: https://capacitorjs.com/docs
- Android Studio: https://developer.android.com/studio

