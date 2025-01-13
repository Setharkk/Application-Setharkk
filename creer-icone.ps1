# Configuration de l'encodage
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Write-ColoredMessage {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Obtenir le chemin du bureau
$DesktopPath = [Environment]::GetFolderPath("Desktop")

# Chemin absolu de l'application
$AppPath = "C:\Users\Setha\Desktop\Application Setharkk"
$ScriptPath = Join-Path $AppPath "lancer.ps1"

# Vérification des composants essentiels
Write-ColoredMessage "Vérification des composants de l'application..." "Cyan"

$requiredComponents = @(
    @{Path = $ScriptPath; Name = "Script de lancement"},
    @{Path = (Join-Path $AppPath "frontend"); Name = "Frontend"},
    @{Path = (Join-Path $AppPath "backend"); Name = "Backend"},
    @{Path = (Join-Path $AppPath "docker-compose.yml"); Name = "Configuration Docker"},
    @{Path = (Join-Path $AppPath ".env"); Name = "Variables d'environnement"}
)

$allComponentsPresent = $true
foreach ($component in $requiredComponents) {
    if (Test-Path $component.Path) {
        Write-ColoredMessage "✓ $($component.Name) trouvé" "Green"
    } else {
        Write-ColoredMessage "✗ $($component.Name) manquant: $($component.Path)" "Red"
        $allComponentsPresent = $false
    }
}

if (-not $allComponentsPresent) {
    Write-ColoredMessage "`nERREUR: Certains composants sont manquants. Le raccourci pourrait ne pas fonctionner correctement." "Red"
    Write-ColoredMessage "Appuyez sur une touche pour continuer quand même..." "Yellow"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Créer un raccourci Windows sur le bureau
Write-ColoredMessage "`nCréation du raccourci..." "Cyan"
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\Setharkk.lnk")
$Shortcut.TargetPath = "C:\Program Files\PowerShell\7\pwsh.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""
$Shortcut.WorkingDirectory = $AppPath
$Shortcut.IconLocation = "C:\Windows\System32\SHELL32.dll,27"
$Shortcut.Description = "Application Setharkk - Double-cliquez pour lancer l'application complète"
$Shortcut.Save()

Write-ColoredMessage "`nRaccourci créé avec succès!" "Green"
Write-ColoredMessage "Emplacement : $DesktopPath\Setharkk.lnk" "Yellow"
Write-ColoredMessage "Ce raccourci lancera l'application complète avec tous ses composants." "Cyan"
Write-ColoredMessage "`nAppuyez sur une touche pour fermer..." "White"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 