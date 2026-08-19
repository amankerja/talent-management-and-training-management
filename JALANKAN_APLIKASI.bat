@echo off
title WorkforceOS - Strategic HR & Talent Management
echo ============================================================
echo   Menjalankan WorkforceOS Desktop Application (.EXE)
echo ============================================================
echo.
cd /d "%~dp0"
if exist "WorkforceOS.exe" (
    start "" "%~dp0WorkforceOS.exe"
) else (
    echo [ERROR] File WorkforceOS.exe tidak ditemukan!
    pause
)
