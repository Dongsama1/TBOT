@echo off
chcp 65001 >nul
title TYM 정비/진단 챗봇 - T-bot
color 0B
cls

echo.
echo ===========================================
echo   TYM 정비/진단 챗봇 - T-bot 실행
echo ===========================================
echo.

REM Node.js 설치 확인
where node >nul 2>&1
if errorlevel 1 (
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

REM node_modules 확인 및 의존성 설치
if not exist "node_modules" (
    echo ===========================================
    echo 의존성 패키지 설치 중...
    echo ===========================================
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [오류] 의존성 설치에 실패했습니다.
        pause
        exit /b 1
    )
    echo.
    echo [완료] 의존성 설치가 완료되었습니다.
    echo.
) else (
    echo [확인] 의존성 패키지가 이미 설치되어 있습니다.
    echo.
)

REM 진단 데이터 경로 확인
echo ===========================================
echo 진단 데이터 경로 확인
echo ===========================================
if exist "C:\diagnostics" (
    echo [확인] 진단 데이터 경로가 존재합니다: C:\diagnostics
    dir /b "C:\diagnostics\*.txt" 2>nul | find /c /v "" >nul
    if errorlevel 1 (
        echo [경고] 진단 데이터 파일(.txt)이 없습니다.
    ) else (
        for /f %%i in ('dir /b "C:\diagnostics\*.txt" 2^>nul ^| find /c /v ""') do (
            echo [확인] 진단 파일 %%i개 발견
        )
    )
) else (
    echo [경고] 진단 데이터 경로가 없습니다: C:\diagnostics
    echo [경고] 서버는 실행되지만 데이터를 로드할 수 없습니다.
)
echo.

REM 서버 시작
echo ===========================================
echo 챗봇 서버 시작 중...
echo ===========================================
echo.
echo 서버 주소: http://localhost:3000
echo.
echo 서버가 시작되면 브라우저가 자동으로 열립니다.
echo 서버를 중지하려면 이 창을 닫거나 Ctrl+C를 누르세요.
echo.
echo ===========================================
echo.

REM 서버를 별도 창에서 시작
start "TYM 챗봇 서버" cmd /k "npm start"

REM 서버가 시작될 때까지 대기 (5초)
echo 서버 시작 대기 중...
timeout /t 5 /nobreak >nul

REM 브라우저 열기
echo 브라우저를 엽니다...
start http://localhost:3000

echo.
echo ===========================================
echo 서버가 실행 중입니다.
echo 서버 창을 닫으면 서버가 종료됩니다.
echo ===========================================
echo.
pause

