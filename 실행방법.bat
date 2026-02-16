@echo off
chcp 65001 >nul
echo ===========================================
echo AI Smart Service - 실행 방법
echo ===========================================
echo.
echo 1단계: Node.js 설치 확인
echo.
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다!
    echo.
    echo Node.js 설치 방법:
    echo 1. https://nodejs.org/ 접속
    echo 2. LTS 버전 다운로드 및 설치
    echo 3. 설치 후 이 파일을 다시 실행하세요
    echo.
    pause
    exit /b 1
)

echo [성공] Node.js가 설치되어 있습니다!
node --version
npm --version
echo.
echo ===========================================
echo 2단계: 의존성 설치
echo ===========================================
echo.
call npm install
if %errorlevel% neq 0 (
    echo [오류] 의존성 설치에 실패했습니다.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo 3단계: 개발 서버 실행
echo ===========================================
echo.
echo 개발 서버를 시작합니다...
echo 브라우저에서 http://localhost:5173 으로 접속하세요.
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo.
call npm run dev










