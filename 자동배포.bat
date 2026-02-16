@echo off
chcp 65001 >nul
title 자동 배포 스크립트
color 0B
cls

echo.
echo ===========================================
echo   TYM 챗봇 자동 배포 스크립트
echo ===========================================
echo.

cd /d "%~dp0"

REM Git 설치 확인
where git >nul 2>&1
if errorlevel 1 (
    echo [오류] Git이 설치되어 있지 않습니다!
    echo.
    echo Git 설치 방법:
    echo 1. https://git-scm.com/download/win 접속
    echo 2. 다운로드 및 설치
    echo 3. PowerShell을 재시작한 후 다시 실행
    echo.
    echo Git 설치 페이지를 여시겠습니까? (Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        start https://git-scm.com/download/win
    )
    pause
    exit /b 1
)

echo [확인] Git이 설치되어 있습니다.
git --version
echo.

REM Git 초기화 확인
if not exist ".git" (
    echo ===========================================
    echo Git 저장소 초기화 중...
    echo ===========================================
    git init
    if errorlevel 1 (
        echo [오류] Git 초기화 실패
        pause
        exit /b 1
    )
    echo [완료] Git 저장소가 초기화되었습니다.
    echo.
)

REM .gitignore 확인
if not exist ".gitignore" (
    echo [경고] .gitignore 파일이 없습니다.
    echo 자동으로 생성합니다...
    echo node_modules/ > .gitignore
    echo *.db >> .gitignore
    echo *.log >> .gitignore
    echo .env >> .gitignore
)

REM Git 사용자 정보 확인
git config user.name >nul 2>&1
if errorlevel 1 (
    echo ===========================================
    echo Git 사용자 정보 설정이 필요합니다
    echo ===========================================
    echo.
    set /p gitname="GitHub 사용자 이름을 입력하세요: "
    set /p gitemail="이메일 주소를 입력하세요: "
    git config --global user.name "%gitname%"
    git config --global user.email "%gitemail%"
    echo [완료] Git 사용자 정보가 설정되었습니다.
    echo.
)

REM 파일 추가 및 커밋
echo ===========================================
echo 변경사항 커밋 중...
echo ===========================================
git add .
if errorlevel 1 (
    echo [오류] 파일 추가 실패
    pause
    exit /b 1
)

git commit -m "Deploy to production" >nul 2>&1
if errorlevel 1 (
    echo [정보] 커밋할 변경사항이 없거나 이미 커밋되었습니다.
) else (
    echo [완료] 변경사항이 커밋되었습니다.
)
echo.

REM GitHub 저장소 확인
git remote -v >nul 2>&1
if errorlevel 1 (
    echo ===========================================
    echo GitHub 저장소 연결이 필요합니다
    echo ===========================================
    echo.
    echo 다음 단계를 따라주세요:
    echo.
    echo 1. https://github.com 접속 및 로그인
    echo 2. 우측 상단 + 버튼 클릭 -^> New repository
    echo 3. Repository name 입력 (예: ai-smart-service)
    echo 4. Public 선택
    echo 5. Create repository 클릭
    echo 6. 생성된 저장소의 URL을 복사
    echo.
    set /p repourl="GitHub 저장소 URL을 입력하세요 (예: https://github.com/사용자명/저장소명.git): "
    
    if "%repourl%"=="" (
        echo [취소] 저장소 URL이 입력되지 않았습니다.
        echo.
        echo GitHub 저장소를 생성한 후 다시 실행하세요.
        echo GitHub 저장소 생성 페이지를 여시겠습니까? (Y/N)
        set /p choice=
        if /i "%choice%"=="Y" (
            start https://github.com/new
        )
        pause
        exit /b 0
    )
    
    git remote add origin "%repourl%"
    if errorlevel 1 (
        echo [오류] 원격 저장소 추가 실패
        pause
        exit /b 1
    )
    echo [완료] GitHub 저장소가 연결되었습니다.
    echo.
)

REM 브랜치 확인 및 설정
git branch --show-current >nul 2>&1
if errorlevel 1 (
    git branch -M main
)

REM GitHub에 푸시
echo ===========================================
echo GitHub에 코드 업로드 중...
echo ===========================================
echo.
git push -u origin main
if errorlevel 1 (
    echo.
    echo [경고] 푸시 실패. 다음을 확인하세요:
    echo 1. GitHub 인증이 필요할 수 있습니다
    echo 2. 저장소 URL이 올바른지 확인
    echo 3. GitHub Personal Access Token이 필요할 수 있습니다
    echo.
    echo GitHub 인증 방법:
    echo - GitHub Desktop 사용 (권장)
    echo - 또는 Personal Access Token 생성
    echo.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo [성공] GitHub에 코드가 업로드되었습니다!
echo ===========================================
echo.

REM Render.com 배포 안내
echo ===========================================
echo 다음 단계: Render.com에 배포
echo ===========================================
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
echo Render.com 배포 페이지를 여시겠습니까? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    start https://render.com
)

echo.
echo ===========================================
echo 배포 준비 완료!
echo ===========================================
echo.
echo GitHub 저장소가 준비되었습니다.
echo Render.com에서 배포를 완료하면 외부 인터넷에서 접속 가능합니다.
echo.
pause

