@echo off
chcp 65001 >nul
title AI Smart Service
color 0A
cls

echo.
echo ===========================================
echo   AI Smart Service - Project Runner
echo ===========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js:
    echo 1. Visit https://nodejs.org/
    echo 2. Download and install LTS version
    echo 3. Restart this script after installation
    echo.
    echo Opening Node.js download page...
    start https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found!
node --version
npm --version
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo ===========================================
    echo Installing dependencies...
    echo ===========================================
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo ===========================================
echo Starting development server...
echo ===========================================
echo.
echo Server will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.
echo ===========================================
echo.

call npm run dev

pause










