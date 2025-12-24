@echo off
cd /d "%~dp0"

echo ========================================
echo Verificacion de rama y commit
echo ========================================
echo.

echo [INFO] Estado actual:
git status
echo.

echo [INFO] Rama actual:
git branch --show-current
echo.

echo [INFO] Ultimo commit:
git log -1 --oneline
echo.

echo ========================================
echo Creando commit de verificacion...
echo ========================================
echo.

git add .

git commit -m "Verificacion: Confirmacion de rama correcta desde commit HoaVxuSb9"

if %errorlevel% equ 0 (
    echo.
    echo [OK] Commit creado exitosamente
    echo.
    echo [INFO] Subiendo cambios...
    git push
    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo ¡Proceso completado exitosamente!
        echo ========================================
    ) else (
        echo.
        echo [ADVERTENCIA] No se pudo hacer push. Verifica la configuracion remota.
    )
) else (
    echo.
    echo [ERROR] No se pudo crear el commit. Puede que no haya cambios.
)

echo.
pause
