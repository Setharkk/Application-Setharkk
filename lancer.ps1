# Configuration de l'encodage pour les caractères spéciaux
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

# Fonction pour afficher les messages avec des couleurs
function Write-ColorMessage {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Fonction pour gérer les erreurs
function Handle-Error {
    param([string]$Message)
    Write-ColorMessage "ERREUR: $Message" "Red"
    Write-ColorMessage "Appuyez sur une touche pour fermer..." "Gray"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

try {
    # Définir le chemin de l'application
    $appPath = $PSScriptRoot
    Set-Location $appPath

    # Vérifier si docker-compose est présent
    if (-not (Test-Path "docker-compose.yml")) {
        Handle-Error "docker-compose.yml non trouvé dans $appPath"
    }

    # Vérifier si Docker Desktop est installé
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (-not (Test-Path $dockerPath)) {
        Handle-Error "Docker Desktop n'est pas installé. Veuillez l'installer d'abord."
    }

    # Vérifier si Docker est en cours d'exécution
    $dockerRunning = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    if (-not $dockerRunning) {
        Write-ColorMessage "Docker Desktop n'est pas en cours d'exécution. Démarrage..." "Yellow"
        Start-Process $dockerPath
        Write-ColorMessage "Attente du démarrage de Docker (45s)..." "Yellow"
        Start-Sleep -Seconds 45
    }

    # Vérifier que Docker est bien démarré
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Docker n'est pas accessible. Veuillez vérifier que Docker Desktop est bien démarré."
    }

    # Vérifier l'espace disque disponible
    Write-ColorMessage "Vérification de l'espace disque..." "Yellow"
    $drive = Get-PSDrive C
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    if ($freeSpaceGB -lt 10) {
        Write-ColorMessage "Attention: Il reste seulement ${freeSpaceGB}GB d'espace libre sur le disque C:" "Red"
        Write-ColorMessage "Les images Docker peuvent nécessiter plusieurs GB d'espace." "Red"
        Write-ColorMessage "Appuyez sur une touche pour continuer ou CTRL+C pour annuler..." "Yellow"
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }

    # Arrêter les conteneurs existants
    Write-ColorMessage "Arrêt des conteneurs existants..." "Yellow"
    docker-compose down --remove-orphans

    # Créer le réseau si nécessaire
    Write-ColorMessage "Création du réseau Docker..." "Yellow"
    docker network create app-network 2>$null

    # Construire les images
    Write-ColorMessage "Construction des images Docker..." "Yellow"
    docker-compose build --no-cache

    # Démarrer les services de base
    Write-ColorMessage "Démarrage des services de base..." "Yellow"
    docker-compose up -d mongodb redis postgres
    Write-ColorMessage "Attente des services de base (30s)..." "Yellow"
    Start-Sleep -Seconds 30

    # Vérifier l'état des services de base
    Write-ColorMessage "Vérification des services de base" "Cyan"
    $baseServices = @("mongodb", "redis", "postgres")
    $allHealthy = $true
    foreach ($service in $baseServices) {
        $status = docker inspect --format='{{.State.Health.Status}}' "applicationsetharkk-${service}-1" 2>$null
        Write-ColorMessage "$service - Statut: $status" -Color $(if($status -eq "healthy"){"Green"}else{"Red"})
        if ($status -ne "healthy") {
            $allHealthy = $false
            Write-ColorMessage "Logs de $service :" "Yellow"
            docker-compose logs --tail 50 $service
        }
    }

    if (-not $allHealthy) {
        Handle-Error "Certains services ne sont pas en bonne santé. Vérifiez les logs ci-dessus."
    }

    # Démarrer le backend, frontend et nginx
    Write-ColorMessage "Démarrage de l'application..." "Yellow"
    docker-compose up -d backend frontend nginx
    Write-ColorMessage "Attente du démarrage complet (30s)..." "Yellow"
    Start-Sleep -Seconds 30

    # Afficher l'état final
    Write-ColorMessage "`nApplication démarrée avec succès!" "Green"
    Write-ColorMessage "URLs disponibles:" "Cyan"
    Write-ColorMessage "- Application : http://localhost" "Green"
    Write-ColorMessage "- API : http://localhost/api" "Green"

    # Ouvrir l'application dans le navigateur par défaut
    Start-Process "http://localhost"

    Write-ColorMessage "`nAppuyez sur une touche pour fermer..." "Gray"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} catch {
    Handle-Error $_.Exception.Message
} 
