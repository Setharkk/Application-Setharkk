@echo off
setlocal

REM Définir le chemin de l'application
set APP_PATH=%~dp0
cd %APP_PATH%

REM Arrêter les conteneurs
docker-compose down

echo Application Setharkk arrêtée avec succès !
pause 