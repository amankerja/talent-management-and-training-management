@echo off
title Talent & Training Management System
echo ============================================================
echo   Menjalankan Talent & Training Management (.EXE)
echo ============================================================
echo.
cd /d "%~dp0"
if exist "Talent & Training Management.exe" (
    start "" "%~dp0Talent & Training Management.exe"
) else if exist "WorkforceOS.exe" (
    start "" "%~dp0WorkforceOS.exe"
) else (
    echo [ERROR] File executable aplikasi tidak ditemukan!
    pause
)
