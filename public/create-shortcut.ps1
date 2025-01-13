# Copier le script start-app.ps1 vers le bureau
Copy-Item "start-app.ps1" "$Home\Desktop\start-app.ps1" -Force

# Créer le raccourci
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Setharkk.lnk")
$Shortcut.TargetPath = "C:\Program Files\PowerShell\7\pwsh.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$Home\Desktop\start-app.ps1`""
$Shortcut.WorkingDirectory = "$Home\Desktop"
$Shortcut.IconLocation = "C:\Program Files\Google\Chrome\Application\chrome.exe,0"
$Shortcut.Description = "Lancer Setharkk avec Chrome"
$Shortcut.Save()

Write-Host "Raccourci créé avec succès sur le bureau !"
Write-Host "Double-cliquez sur 'Setharkk' pour lancer l'application." 