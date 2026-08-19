@echo off
title WorkforceOS - Development Mode (Tauri Hot-Reload)
echo ============================================================
echo   Menjalankan WorkforceOS dalam Mode Pengembang (Hot-Reload)
echo ============================================================
echo.
cd /d "%~dp0"
npm run tauri:dev
pause
