@echo off
chcp 65001 >nul
title 자동 배포 실행 (안전 모드)
cd /d "%~dp0"

echo.
echo ===========================================
echo   TYM 챗봇 자동 배포 스크립트
echo ===========================================
echo.

REM Git 경로 추가
set "PATH=%PATH%;C:\Program Files\Git\cmd"

REM Git 확인
where git >nul 2>&1
if errorlevel 1 (
    echo [오류] Git이 설치되어 있지 않습니다!
    echo Git 설치 페이지를 엽니다...
    start https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [확인] Git이 설치되어 있습니다.
git --version
echo.

REM Git 초기화
if not exist ".git" (
    echo Git 저장소 초기화 중...
    git init
    if errorlevel 1 (
        echo [오류] Git 초기화 실패
        pause
        exit /b 1
    )
    echo [완료] Git 저장소가 초기화되었습니다.
    echo.
)

REM Git 사용자 정보 확인
git config user.name >nul 2>&1
if errorlevel 1 (
    echo Git 사용자 정보 설정이 필요합니다.
    echo.
    set /p gitname="GitHub 사용자 이름: "
    set /p gitemail="이메일 주소: "
    git config --global user.name "%gitname%"
    git config --global user.email "%gitemail%"
    echo [완료] Git 사용자 정보가 설정되었습니다.
    echo.
)

REM 파일 추가 및 커밋
echo 변경사항 커밋 중...
git add .
REM 커밋이 있는지 확인
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
    REM 커밋이 없으면 초기 커밋 생성
    echo 초기 커밋 생성 중...
    git commit -m "Initial commit - Deploy to production"
    if errorlevel 1 (
        echo [오류] 커밋 실패
        pause
        exit /b 1
    )
    echo [완료] 초기 커밋이 생성되었습니다.
) else (
    REM 커밋이 있으면 변경사항 커밋 시도
    git commit -m "Deploy to production" >nul 2>&1
    if errorlevel 1 (
        echo [정보] 커밋할 변경사항이 없거나 이미 커밋되었습니다.
    ) else (
        echo [완료] 변경사항이 커밋되었습니다.
    )
)
echo.

REM GitHub 저장소 확인
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo GitHub 저장소 연결이 필요합니다.
    echo.
    echo 다음 단계를 따라주세요:
    echo 1. https://github.com 접속 및 로그인
    echo 2. 우측 상단 + 버튼 클릭 -^> New repository
    echo 3. Repository name 입력 (예: ai-smart-service)
    echo 4. Public 선택
    echo 5. Create repository 클릭
    echo 6. 생성된 저장소의 URL을 복사
    echo.
    set /p repourl="GitHub 저장소 URL을 입력하세요: "
    
    if "%repourl%"=="" (
        echo [취소] 저장소 URL이 입력되지 않았습니다.
        start https://github.com/new
        pause
        exit /b 0
    )
    
    git remote add origin "%repourl%"
    if errorlevel 1 (
        echo [경고] 원격 저장소가 이미 존재합니다. 기존 저장소를 사용합니다.
        git remote set-url origin "%repourl%"
    )
    echo [완료] GitHub 저장소가 연결되었습니다.
    echo.
) else (
    REM 이미 원격 저장소가 있으면 URL 확인
    for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set currenturl=%%i
    echo [확인] GitHub 저장소가 이미 연결되어 있습니다: %currenturl%
    echo.
)

REM 브랜치 확인 및 설정
git branch --show-current >nul 2>&1
if errorlevel 1 (
    REM 브랜치가 없으면 main 브랜치 생성
    git checkout -b main >nul 2>&1
) else (
    REM 현재 브랜치를 main으로 이름 변경
    git branch -M main >nul 2>&1
)

REM 커밋이 있는지 다시 확인
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
    echo [오류] 커밋이 없습니다. 파일을 추가하고 커밋해주세요.
    pause
    exit /b 1
)

REM GitHub에 푸시
echo GitHub에 코드 업로드 중...
git push -u origin main
if errorlevel 1 (
    echo.
    echo [경고] 푸시 실패. 다음을 확인하세요:
    echo 1. GitHub 인증이 필요할 수 있습니다
    echo 2. GitHub Desktop 사용을 권장합니다
    echo.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo [성공] GitHub에 코드가 업로드되었습니다!
echo ===========================================
echo.

REM Render.com 안내
echo 다음 단계: Render.com에 배포
echo.
echo 1. https://render.com 접속 및 로그인 (GitHub 계정)
echo 2. "New +" 버튼 클릭 -^> "Web Service" 선택
echo 3. 방금 업로드한 저장소 선택
echo 4. 설정:
echo    - Name: tym-chatbot
echo    - Region: Singapore
echo    - Build Command: npm install
echo    - Start Command: npm start
echo 5. "Create Web Service" 클릭
echo.
set /p choice="Render.com 배포 페이지를 여시겠습니까? (Y/N): "
if /i "%choice%"=="Y" (
    start https://render.com
)

echo.
echo 배포 준비 완료!
pause

