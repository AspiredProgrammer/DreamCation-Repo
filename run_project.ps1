Set-Location -Path "backend"
Start-Process -FilePath "npm" -ArgumentList "run", "start"
Set-Location -Path "../frontend"
Start-Process -FilePath "npm" -ArgumentList "run", "start" 