# Script de verificacion de rama y commit
Set-Location $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificacion de rama y commit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] Estado actual:" -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "[INFO] Rama actual:" -ForegroundColor Yellow
git branch --show-current
Write-Host ""

Write-Host "[INFO] Ultimo commit:" -ForegroundColor Yellow
git log -1 --oneline
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creando commit de verificacion..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

git add .

if ($LASTEXITCODE -eq 0) {
    git commit -m "Verificacion: Confirmacion de rama correcta desde commit HoaVxuSb9"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] Commit creado exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "[INFO] Subiendo cambios..." -ForegroundColor Yellow
        git push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "¡Proceso completado exitosamente!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "[ADVERTENCIA] No se pudo hacer push. Verifica la configuracion remota." -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "[ERROR] No se pudo crear el commit. Puede que no haya cambios." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "[ERROR] No se pudieron agregar los cambios." -ForegroundColor Red
}

Write-Host ""
Read-Host "Presiona Enter para continuar"
