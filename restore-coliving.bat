@echo off
cd /d "c:\Proyectos\Jubilalia"
echo Restaurando ColivingExplanation.tsx del commit HoaVxuSb9...
git checkout HoaVxuSb9 -- src/pages/ColivingExplanation.tsx
if %errorlevel% equ 0 (
    echo ¡Archivo restaurado exitosamente!
) else (
    echo Error al restaurar el archivo
)
pause
