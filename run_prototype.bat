@echo off
title ForgeMind AI Launcher
echo ========================================================
echo         ForgeMind AI — Launcher
echo ========================================================
echo.
echo [1/3] Starting Express Backend (Port 3001)...
start "ForgeMind Backend" cmd /k "npm run server"

echo [2/3] Starting Vite Frontend (Port 5173)...
start "ForgeMind Frontend" cmd /k "npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Launching browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ========================================================
echo Setup complete. Backend and Frontend are now running!
echo To stop the servers, close their terminal windows.
echo ========================================================
echo.
pause
