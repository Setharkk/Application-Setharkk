# Obtenir le chemin du bureau
$desktopPath = [Environment]::GetFolderPath("Desktop")

# Obtenir le chemin absolu du répertoire de l'application
$appPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$batchPath = Join-Path $appPath "public\lancer_setharkk.bat"

# Vérifier si le fichier batch existe
if (-not (Test-Path $batchPath)) {
    Write-Host "❌ Erreur: Fichier batch non trouvé: $batchPath" -ForegroundColor Red
    exit 1
}

# Créer le raccourci
try {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$desktopPath\Setharkk.lnk")
    $Shortcut.TargetPath = $batchPath
    $Shortcut.WorkingDirectory = $appPath
    $Shortcut.WindowStyle = 1  # Fenêtre normale
    $Shortcut.Description = "Lancer l'application Setharkk"
    $Shortcut.Save()

    Write-Host "✨ Raccourci créé avec succès sur le bureau!" -ForegroundColor Green
    Write-Host "📂 Chemin de l'application: $appPath" -ForegroundColor Cyan
    Write-Host "📜 Fichier de lancement: $batchPath" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors de la création du raccourci: $($_.Exception.Message)" -ForegroundColor Red
} 