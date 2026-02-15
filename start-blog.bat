@echo off
set PORT=3200
set NGROK_SKIP_CRL=1
title Blog Start
echo ==========================================
echo Starting blog services...
echo ==========================================
echo [1/2] Starting local server on port %PORT%...
start "Blog Server - Next.js" cmd /k "cd /d %~dp0 && npm run dev -- -p %PORT%"
timeout /t 5 /nobreak >nul
echo [2/2] Starting ngrok tunnel...
start "Ngrok Tunnel" cmd /k "ngrok http %PORT%"
echo.
echo ==========================================
echo Services started.
echo ==========================================
echo Check the ngrok window for the public URL.
echo.
pause
