@echo off
chcp 65001 >nul
title 자동 배포 실행
cd /d "%~dp0"

echo.
echo PowerShell 스크립트를 실행합니다...
echo.

powershell.exe -ExecutionPolicy Bypass -NoProfile -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8; & '%~dp0자동배포.ps1'"

pause

