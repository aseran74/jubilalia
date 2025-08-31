# 🚀 Instrucciones para Aplicar la Migración del Trigger Automático

## 📋 **Descripción**
Esta migración crea un sistema automático que:
- **Crea perfiles automáticamente** cuando alguien se registra en Firebase
- **Sincroniza datos** entre Firebase y Supabase
- **Maneja errores de conexión** de forma robusta

## 🔧 **Pasos para Aplicar**

### 1. **Acceder al SQL Editor de Supabase**
- Ve a tu proyecto de Supabase
- Haz clic en **"SQL Editor"** en el menú lateral
- Crea una **"New Query"**

### 2. **Copiar y Pegar la Migración**
Copia todo el contenido del archivo `src/database/migrations/009_create_auto_profile_trigger.sql` y pégalo en el SQL Editor.

### 3. **Ejecutar la Migración**
- Haz clic en **"Run"** para ejecutar la migración
- Verifica que no haya errores en la consola

### 4. **Verificar la Instalación**
Ejecuta esta consulta para verificar que todo esté funcionando:

```sql
-- Verificar que las funciones se crearon
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'ensure_profile_exists');

-- Verificar que los triggers se crearon
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('on_auth_user_created', 'ensure_profile_data');
```

## 🎯 **Cómo Funciona el Sistema**

### **Trigger Principal (`on_auth_user_created`)**
- Se ejecuta **automáticamente** cuando se inserta un usuario en `auth.users`
- **Crea un perfil** en la tabla `profiles` con los datos de Firebase
- **Maneja conflictos** si el perfil ya existe

### **Trigger de Validación (`ensure_profile_data`)**
- Se ejecuta **antes** de insertar/actualizar perfiles
- **Valida** que todos los campos obligatorios estén presentes
- **Completa** campos faltantes con valores por defecto

### **Función de Sincronización (`syncProfileWithSupabase`)**
- **Intenta sincronizar** con Supabase cuando hay conexión
- **Usa perfil local** como fallback si falla la conexión
- **Reintenta** la sincronización automáticamente

## 🚨 **Solución de Problemas**

### **Error: "function does not exist"**
- Verifica que la migración se ejecutó completamente
- Revisa la consola de Supabase para errores

### **Error: "trigger does not exist"**
- Ejecuta la migración nuevamente
- Verifica que no haya conflictos con triggers existentes

### **Error: "permission denied"**
- Asegúrate de que las políticas RLS permitan acceso completo
- Verifica que el usuario tenga permisos para crear funciones

## 🔄 **Flujo de Funcionamiento**

1. **Usuario se registra** en Firebase
2. **Trigger se ejecuta** automáticamente
3. **Perfil se crea** en Supabase
4. **Aplicación usa** el perfil para operaciones
5. **Sincronización** ocurre en segundo plano

## ✅ **Beneficios del Nuevo Sistema**

- ✅ **Sin errores** de "Perfil no encontrado"
- ✅ **Funciona offline** con perfiles locales
- ✅ **Sincronización automática** cuando hay conexión
- ✅ **Manejo robusto** de errores de red
- ✅ **Creación automática** de perfiles

## 🎉 **¡Listo!**
Después de aplicar esta migración, el sistema funcionará automáticamente y no tendrás más problemas con perfiles faltantes.
