# Fonction pour le logging
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

# Vérification des permissions des fichiers
function Check-FilePermissions {
    Write-Log "Vérification des permissions des fichiers..."
    
    $sensitivePaths = @(
        ".env",
        "database\*.sql",
        "ssl\*"
    )
    
    foreach ($path in $sensitivePaths) {
        $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $acl = Get-Acl $file.FullName
            if ($acl.Access | Where-Object { $_.IdentityReference -eq "Everyone" }) {
                Write-Log "⚠️ ATTENTION: $($file.FullName) a des permissions trop permissives"
            }
        }
    }
}

# Vérification des services
function Check-Services {
    Write-Log "Vérification des services..."
    
    $services = @(
        "PostgreSQL",
        "Redis"
    )
    
    foreach ($service in $services) {
        $status = Get-Service -Name $service -ErrorAction SilentlyContinue
        if ($status) {
            Write-Log "Service $service est $($status.Status)"
        } else {
            Write-Log "⚠️ Service $service non trouvé"
        }
    }
}

# Vérification des certificats SSL
function Check-SSL {
    Write-Log "Vérification des certificats SSL..."
    
    $certPaths = @(
        "ssl\cert.pem",
        "ssl\cert.key"
    )
    
    foreach ($path in $certPaths) {
        if (-not (Test-Path $path)) {
            Write-Log "⚠️ ERREUR: Certificat manquant: $path"
        }
    }
}

# Vérification des dépendances npm
function Test-Dependencies {
    Write-Log "Vérification des dépendances npm..."
    
    try {
        $result = npm audit
        if ($LASTEXITCODE -ne 0) {
            Write-Log "⚠️ ATTENTION: Des vulnérabilités ont été trouvées dans les dépendances"
        }
    } catch {
        Write-Log "⚠️ ERREUR lors de la vérification des dépendances: $_"
    }
}

# Vérification des ports
function Test-Ports {
    Write-Log "Vérification des ports..."
    
    $portsToCheck = @(
        @{Port = 80; Service = "NGINX"},
        @{Port = 3000; Service = "Backend"},
        @{Port = 5432; Service = "PostgreSQL"},
        @{Port = 6379; Service = "Redis"}
    )
    
    foreach ($portInfo in $portsToCheck) {
        $result = Test-NetConnection -ComputerName localhost -Port $portInfo.Port -WarningAction SilentlyContinue
        if ($result.TcpTestSucceeded) {
            Write-Log "Port $($portInfo.Port) ($($portInfo.Service)) est ouvert"
        } else {
            Write-Log "⚠️ ATTENTION: Port $($portInfo.Port) ($($portInfo.Service)) est fermé"
        }
    }
}

# Fonction principale
function Main {
    Write-Log "Démarrage de la vérification de sécurité..."
    
    Check-FilePermissions
    Check-Services
    Check-SSL
    Test-Dependencies
    Test-Ports
    
    Write-Log "Vérification de sécurité terminée"
}

# Exécution du script
Main 