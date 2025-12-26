@echo off
echo ============================================
echo Commit: Sistema de solicitudes de amistad
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Agregando cambios...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Fallo al agregar archivos
    pause
    exit /b 1
)
echo OK: Archivos agregados
echo.

echo [2/3] Creando commit...
git commit -m "Implementar sistema de solicitudes de amistad con corrección de políticas RLS"
if %errorlevel% neq 0 (
    echo ERROR: Fallo al crear commit
    pause
    exit /b 1
)
echo OK: Commit creado
echo.

echo [3/3] Enviando a repositorio remoto...
git push
if %errorlevel% neq 0 (
    echo ERROR: Fallo al hacer push
    pause
    exit /b 1
)
echo OK: Push completado
echo.

echo ============================================
echo ¡Completado exitosamente!
echo ============================================
pause

