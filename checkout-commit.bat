@echo off
cd /d "%~dp0"

echo ========================================
echo Cambiando al commit HoaVxuSb9
echo ========================================
echo.

git checkout HoaVxuSb9

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ¡Cambio exitoso!
    echo ========================================
    echo Ahora estás en el commit HoaVxuSb9
    echo.
    git log -1 --oneline
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: No se pudo cambiar al commit
    echo ========================================
    echo.
)

pause
