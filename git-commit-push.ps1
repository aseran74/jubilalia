# Script para hacer add, commit y push
Set-Location "c:\Proyectos\Jubilalia"

Write-Host "Agregando archivos..." -ForegroundColor Green
git add .

Write-Host "Haciendo commit..." -ForegroundColor Green
git commit -m "Agregar pagina ColivingExplanation con explicaciones detalladas y MobileLandingPage mejorada"

Write-Host "Haciendo push..." -ForegroundColor Green
git push

Write-Host "¡Completado!" -ForegroundColor Green
