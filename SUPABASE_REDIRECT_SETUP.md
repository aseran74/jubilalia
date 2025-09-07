# Configuración de URLs de Redirección en Supabase

## 🚨 Problema

Cuando te logueas en local (localhost:5173), Supabase te redirige a Vercel (jubilalia.vercel.app) en lugar de mantenerte en local.

## ✅ Solución

### 1. Configurar URLs de Redirección en Supabase Dashboard

Ve a tu proyecto de Supabase Dashboard:

1. **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:5173` (para desarrollo)
3. **Redirect URLs**: Agregar las siguientes URLs:

```
http://localhost:5173/auth/callback
https://jubilalia.vercel.app/auth/callback
```

### 2. Configurar Google OAuth (si usas Google)

En **Authentication** → **Providers** → **Google**:

1. **Redirect URLs**: Agregar las mismas URLs:
```
http://localhost:5173/auth/callback
https://jubilalia.vercel.app/auth/callback
```

### 3. Código Actualizado

El código ya está actualizado para detectar automáticamente el entorno:

- **Desarrollo local**: Usa `http://localhost:5173/auth/callback`
- **Producción**: Usa `https://jubilalia.vercel.app/auth/callback`

### 4. Verificar Configuración

Para verificar que funciona:

1. **En local**: 
   - Abre `http://localhost:5173`
   - Haz login con Google
   - Debería redirigir a `http://localhost:5173/auth/callback`

2. **En producción**:
   - Abre `https://jubilalia.vercel.app`
   - Haz login con Google
   - Debería redirigir a `https://jubilalia.vercel.app/auth/callback`

## 🔧 Configuración Adicional

### Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```bash
# Para desarrollo local
VITE_SUPABASE_URL=https://sdmkodriokrpsdegweat.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Para producción (Vercel)
# Las mismas variables se usan en ambos entornos
```

### Debugging

Si sigues teniendo problemas, revisa la consola del navegador:

1. **URL de redirección**: Debería mostrar la URL correcta según el entorno
2. **Errores de Supabase**: Revisa si hay errores de autenticación
3. **Network tab**: Verifica las llamadas a Supabase

## 📋 Checklist

- [ ] URLs de redirección configuradas en Supabase Dashboard
- [ ] Google OAuth configurado con las URLs correctas
- [ ] Variables de entorno configuradas
- [ ] Código actualizado con detección de entorno
- [ ] Probado en local y producción

## 🆘 Si el problema persiste

1. **Limpia el cache del navegador**
2. **Revisa la consola de Supabase** para errores
3. **Verifica que las URLs estén exactamente como se muestran arriba**
4. **Asegúrate de que no haya espacios extra en las URLs**

## 🔄 Flujo de Autenticación

1. Usuario hace clic en "Login con Google"
2. Se detecta el entorno (local vs producción)
3. Se usa la URL de redirección correcta
4. Google redirige a Supabase
5. Supabase redirige a la URL configurada
6. La aplicación maneja el callback y autentica al usuario
