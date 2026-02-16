@echo off
chcp 65001 >nul
title 커밋 생성
cd /d "%~dp0"

echo.
echo ===========================================
echo   Git 커밋 생성
echo ===========================================
echo.

REM Git 경로 추가
set "PATH=%PATH%;C:\Program Files\Git\cmd"

REM Git 확인
where git >nul 2>&1
if errorlevel 1 (
    echo [오류] Git이 설치되어 있지 않습니다!
    pause
    exit /b 1
)

REM 파일 추가
echo 파일 추가 중...
git add .
if errorlevel 1 (
    echo [오류] 파일 추가 실패
    pause
    exit /b 1
)

REM 커밋 확인
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
    echo 초기 커밋 생성 중...
    git commit -m "Initial commit - Deploy to production"
) else (
    echo 변경사항 커밋 중...
    git commit -m "Update - Deploy to production"
)

if errorlevel 1 (
    echo [오류] 커밋 실패
    pause
    exit /b 1
)

echo.
echo [완료] 커밋이 생성되었습니다!
echo.
echo 이제 배포실행_안전.bat를 다시 실행하세요.
echo.
pause

