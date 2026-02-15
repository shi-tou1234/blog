@echo off
set PORT=3200
title Blog Local Start
echo ==========================================
echo Starting local blog server...
echo ==========================================
echo Local URL: http://localhost:%PORT%/
echo.
start "Blog Server - Next.js" cmd /k "cd /d %~dp0 && npm run dev -- -p %PORT%"
timeout /t 1 /nobreak >nul
start "" "http://localhost:%PORT%/admin"
echo.
pause
