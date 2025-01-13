# Définir l'encodage en UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Fonction pour afficher les messages avec des couleurs
function Write-ColorMessage {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Chemin de l'application
$sourcePath = $PSScriptRoot
$parentPath = Split-Path -Parent $sourcePath
$zipPath = Join-Path $parentPath "application_setharkk.zip"

Write-ColorMessage "Création de l'archive..." "Yellow"

# Supprimer l'archive existante si elle existe
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-ColorMessage "Archive existante supprimée." "Gray"
}

# Créer un dossier temporaire
$tempDir = Join-Path $env:TEMP "setharkk_temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copier les fichiers en excluant node_modules, build, et logs
Write-ColorMessage "Copie des fichiers..." "Yellow"
$excludePatterns = @(
    "node_modules",
    "build",
    "dist",
    "*.log",
    ".git",
    ".env",
    "*.zip"
)

Get-ChildItem -Path $parentPath -Recurse |
    Where-Object {
        $item = $_
        $exclude = $false
        foreach ($pattern in $excludePatterns) {
            if ($item.FullName -like "*$pattern*") {
                $exclude = $true
                break
            }
        }
        -not $exclude
    } |
    ForEach-Object {
        $targetPath = $_.FullName.Replace($parentPath, $tempDir)
        if (-not (Test-Path (Split-Path -Parent $targetPath))) {
            New-Item -ItemType Directory -Path (Split-Path -Parent $targetPath) | Out-Null
        }
        Copy-Item $_.FullName -Destination $targetPath
    }

# Créer l'archive
Write-ColorMessage "Création de l'archive finale..." "Yellow"
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Nettoyer le dossier temporaire
Remove-Item $tempDir -Recurse -Force

Write-ColorMessage "Archive créée avec succès : $zipPath" "Green"
Write-ColorMessage "Appuyez sur une touche pour fermer..." "Gray"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 