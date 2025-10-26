
Write-Host "`nTest Maestro avant push..."
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess -Force -ErrorAction SilentlyContinue

# Lancer Expo en arrière-plan
#Start-Process "cmd.exe" -ArgumentList "/c npx expo start --android --no-dev --minify" -WindowStyle Hidden
Start-Process "cmd.exe" -ArgumentList "/c npx expo start --android"

Start-Sleep -Seconds 15

# Exécuter le test Maestro
$testResult = & maestro test .maestro/main_flow.yaml
$exitCode = $LASTEXITCODE

# Fermer Expo (port 8081)
try {
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Expo fermé proprement."
}
catch {
    Write-Host "Aucun processus trouvé sur le port 8081."
}



# Vérifier le résultat
if ($exitCode -ne 0) {
    Write-Host "`nTest échoué. Push bloqué.`n"
    exit 1
}
else {
    Write-Host "`nTest réussi. Push autorisé.`n"
    exit 0
}
