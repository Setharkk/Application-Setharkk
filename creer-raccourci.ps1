# Définir l'encodage en UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Obtenir le chemin absolu du répertoire de l'application
$appPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcherPath = Join-Path $appPath "lancer.ps1"

# Vérifier que le script existe
if (-not (Test-Path $launcherPath)) {
    Write-Host "ERREUR: Le fichier lancer.ps1 n'existe pas dans $appPath" -ForegroundColor Red
    exit 1
}

try {
    # Créer un raccourci sur le bureau
    $WshShell = New-Object -comObject WScript.Shell
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "Setharkk.lnk"
    
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "C:\Program Files\PowerShell\7\pwsh.exe"
    $Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$launcherPath`""
    $Shortcut.WorkingDirectory = $appPath
    $Shortcut.WindowStyle = 1
    $Shortcut.IconLocation = "C:\Program Files\PowerShell\7\pwsh.exe,0"
    $Shortcut.Description = "Application Setharkk"
    $Shortcut.Save()

    Write-Host "Raccourci créé avec succès sur le bureau!" -ForegroundColor Green
    Write-Host "Chemin du raccourci: $shortcutPath" -ForegroundColor Cyan
    Write-Host "Cible: $($Shortcut.TargetPath) $($Shortcut.Arguments)" -ForegroundColor Cyan
} catch {
    Write-Host "ERREUR lors de la création du raccourci: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 