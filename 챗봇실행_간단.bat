@echo off
chcp 65001 >nul
title TYM 챗봇 실행
cd /d "%~dp0"

echo.
echo ===========================================
echo   TYM 정비/진단 챗봇 실행
echo ===========================================
echo.

REM Node.js 확인
where node >nul 2>&1
if errorlevel 1 (
    echo [오류] Node.js가 설치되어 있지 않습니다!
    echo https://nodejs.org/ 에서 설치하세요.
    pause
    exit /b 1
)

REM 의존성 설치
if not exist "node_modules" (
    echo 의존성 설치 중...
    call npm install
    if errorlevel 1 (
        echo [오류] 의존성 설치 실패
        pause
        exit /b 1
    )
)

echo.
echo 서버 시작 중...
echo 브라우저에서 http://localhost:3000 으로 접속하세요.
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo.

REM 서버 시작
node server.js

pause

