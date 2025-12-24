@echo off
echo ========================================
echo Git: Add, Commit y Push - Dashboard
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Agregando cambios...
git add .
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron agregar los cambios
    pause
    exit /b 1
)
echo OK: Cambios agregados
echo.

echo [2/3] Creando commit...
git commit -m "Mejora: Diseño solapado para las tarjetas del Dashboard"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear el commit
    pause
    exit /b 1
)
echo OK: Commit creado
echo.

echo [3/3] Subiendo cambios...
git push
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron subir los cambios
    pause
    exit /b 1
)
echo OK: Cambios subidos exitosamente
echo.

echo ========================================
echo Proceso completado!
echo ========================================
pause
