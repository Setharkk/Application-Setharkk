@echo off
setlocal

REM Définir le chemin de l'application
set APP_PATH=%~dp0

echo Création du raccourci Setharkk sur le bureau...

REM Créer un raccourci sur le bureau avec l'icône personnalisée
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $Desktop = [System.Environment]::GetFolderPath('Desktop'); $SC = $WS.CreateShortcut(\"$Desktop\Setharkk.lnk\"); $SC.TargetPath = '%APP_PATH%lancer_interface.bat'; $SC.IconLocation = '%APP_PATH%resources\setharkk.ico'; $SC.WorkingDirectory = '%APP_PATH%'; $SC.Description = 'Application Setharkk'; $SC.Save()"

echo.
echo Raccourci créé avec succès !
echo Vous pouvez maintenant lancer l'application depuis le bureau.
echo.
timeout /t 3 /nobreak 