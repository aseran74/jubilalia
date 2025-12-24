@echo off
cd /d "c:\Proyectos\Jubilalia"
echo Agregando archivos...
git add .
echo.
echo Haciendo commit...
git commit -m "Agregar pagina ColivingExplanation con explicaciones detalladas y MobileLandingPage mejorada"
echo.
echo Haciendo push...
git push
echo.
echo ¡Completado!
pause
