@echo off
chcp 65001 >nul
title AI Smart Service 실행
color 0A

echo.
echo ===========================================
echo   AI Smart Service - 프로젝트 실행
echo ===========================================
echo.

REM Node.js 설치 확인
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다!
    echo.
    echo Node.js를 설치해야 합니다:
    echo 1. https://nodejs.org/ 접속
    echo 2. LTS 버전 다운로드 및 설치
    echo 3. 설치 후 이 파일을 다시 실행하세요
    echo.
    echo Node.js 설치 페이지를 여시겠습니까? (Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        start https://nodejs.org/
    )
    pause
    exit /b 1
)

echo [확인] Node.js가 설치되어 있습니다.
node --version
npm --version
echo.

REM 프로젝트 디렉토리로 이동
cd /d "%~dp0"

REM node_modules 확인
if not exist "node_modules" (
    echo ===========================================
    echo 의존성 패키지 설치 중...
    echo ===========================================
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [오류] 의존성 설치에 실패했습니다.
        pause
        exit /b 1
    )
    echo.
    echo [완료] 의존성 설치가 완료되었습니다.
    echo.
)

echo ===========================================
echo 개발 서버 시작 중...
echo ===========================================
echo.
echo 브라우저에서 자동으로 열립니다.
echo 서버 주소: http://localhost:5173
echo.
echo 서버를 중지하려면 이 창을 닫거나 Ctrl+C를 누르세요.
echo.
echo ===========================================
echo.

call npm run dev

pause










