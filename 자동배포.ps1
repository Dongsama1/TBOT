# TYM 챗봇 자동 배포 스크립트 (PowerShell)
# 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  TYM 챗봇 자동 배포 스크립트" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 현재 디렉토리로 이동
Set-Location $PSScriptRoot

# Git 경로 추가
$gitPath = "C:\Program Files\Git\cmd"
if (Test-Path $gitPath) {
    $env:Path += ";$gitPath"
}

# Git 설치 확인
try {
    $gitVersion = git --version 2>&1
    Write-Host "[확인] Git이 설치되어 있습니다." -ForegroundColor Green
    Write-Host $gitVersion
    Write-Host ""
} catch {
    Write-Host "[오류] Git이 설치되어 있지 않습니다!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Git 설치 방법:"
    Write-Host "1. https://git-scm.com/download/win 접속"
    Write-Host "2. 다운로드 및 설치"
    Write-Host "3. PowerShell을 재시작한 후 다시 실행"
    Write-Host ""
    $choice = Read-Host "Git 설치 페이지를 여시겠습니까? (Y/N)"
    if ($choice -eq "Y" -or $choice -eq "y") {
        Start-Process "https://git-scm.com/download/win"
    }
    exit 1
}

# Git 초기화 확인
if (-not (Test-Path ".git")) {
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host "Git 저장소 초기화 중..." -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    try {
        git init
        Write-Host "[완료] Git 저장소가 초기화되었습니다." -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "[오류] Git 초기화 실패" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[확인] Git 저장소가 이미 초기화되어 있습니다." -ForegroundColor Green
    Write-Host ""
}

# .gitignore 확인
if (-not (Test-Path ".gitignore")) {
    Write-Host "[경고] .gitignore 파일이 없습니다. 생성합니다..." -ForegroundColor Yellow
    @"
node_modules/
*.db
*.log
.env
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "[완료] .gitignore 파일이 생성되었습니다." -ForegroundColor Green
    Write-Host ""
}

# Git 사용자 정보 확인
try {
    $userName = git config user.name 2>&1
    if ([string]::IsNullOrWhiteSpace($userName) -or $userName -match "error") {
        throw "사용자 정보 없음"
    }
    Write-Host "[확인] Git 사용자: $userName" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host "Git 사용자 정보 설정이 필요합니다" -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host ""
    $gitName = Read-Host "GitHub 사용자 이름을 입력하세요"
    $gitEmail = Read-Host "이메일 주소를 입력하세요"
    git config --global user.name "$gitName"
    git config --global user.email "$gitEmail"
    Write-Host "[완료] Git 사용자 정보가 설정되었습니다." -ForegroundColor Green
    Write-Host ""
}

# 파일 추가 및 커밋
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "변경사항 커밋 중..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

try {
    git add .
    $commitResult = git commit -m "Deploy to production" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[완료] 변경사항이 커밋되었습니다." -ForegroundColor Green
    } else {
        Write-Host "[정보] 커밋할 변경사항이 없거나 이미 커밋되었습니다." -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "[경고] 커밋 중 오류 발생: $_" -ForegroundColor Yellow
    Write-Host ""
}

# GitHub 저장소 확인
try {
    $remoteUrl = git remote get-url origin 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "원격 저장소 없음"
    }
    Write-Host "[확인] GitHub 저장소: $remoteUrl" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host "GitHub 저장소 연결이 필요합니다" -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "다음 단계를 따라주세요:"
    Write-Host ""
    Write-Host "1. https://github.com 접속 및 로그인"
    Write-Host "2. 우측 상단 + 버튼 클릭 -> New repository"
    Write-Host "3. Repository name 입력 (예: ai-smart-service)"
    Write-Host "4. Public 선택"
    Write-Host "5. Create repository 클릭"
    Write-Host "6. 생성된 저장소의 URL을 복사"
    Write-Host ""
    $repoUrl = Read-Host "GitHub 저장소 URL을 입력하세요 (예: https://github.com/사용자명/저장소명.git)"
    
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host "[취소] 저장소 URL이 입력되지 않았습니다." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "GitHub 저장소를 생성한 후 다시 실행하세요." -ForegroundColor Yellow
        $choice = Read-Host "GitHub 저장소 생성 페이지를 여시겠습니까? (Y/N)"
        if ($choice -eq "Y" -or $choice -eq "y") {
            Start-Process "https://github.com/new"
        }
        exit 0
    }
    
    try {
        git remote add origin "$repoUrl"
        Write-Host "[완료] GitHub 저장소가 연결되었습니다." -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "[오류] 원격 저장소 추가 실패" -ForegroundColor Red
        exit 1
    }
}

# 브랜치 확인 및 설정
try {
    $currentBranch = git branch --show-current 2>&1
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($currentBranch)) {
        git branch -M main
    }
} catch {
    git branch -M main
}

# GitHub에 푸시
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "GitHub에 코드 업로드 중..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

try {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "===========================================" -ForegroundColor Green
        Write-Host "[성공] GitHub에 코드가 업로드되었습니다!" -ForegroundColor Green
        Write-Host "===========================================" -ForegroundColor Green
        Write-Host ""
    } else {
        throw "푸시 실패"
    }
} catch {
    Write-Host ""
    Write-Host "[경고] 푸시 실패. 다음을 확인하세요:" -ForegroundColor Yellow
    Write-Host "1. GitHub 인증이 필요할 수 있습니다"
    Write-Host "2. 저장소 URL이 올바른지 확인"
    Write-Host "3. GitHub Personal Access Token이 필요할 수 있습니다"
    Write-Host ""
    Write-Host "GitHub 인증 방법:"
    Write-Host "- GitHub Desktop 사용 (권장)"
    Write-Host "- 또는 Personal Access Token 생성"
    Write-Host ""
    Read-Host "계속하려면 Enter를 누르세요"
    exit 1
}

# Render.com 배포 안내
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "다음 단계: Render.com에 배포" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. https://render.com 접속 및 로그인 (GitHub 계정)"
Write-Host "2. 'New +' 버튼 클릭 -> 'Web Service' 선택"
Write-Host "3. 방금 업로드한 저장소 선택"
Write-Host "4. 설정:"
Write-Host "   - Name: tym-chatbot"
Write-Host "   - Region: Singapore"
Write-Host "   - Build Command: npm install"
Write-Host "   - Start Command: npm start"
Write-Host "5. 'Create Web Service' 클릭"
Write-Host ""
$choice = Read-Host "Render.com 배포 페이지를 여시겠습니까? (Y/N)"
if ($choice -eq "Y" -or $choice -eq "y") {
    Start-Process "https://render.com"
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "배포 준비 완료!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "GitHub 저장소가 준비되었습니다." -ForegroundColor Green
Write-Host "Render.com에서 배포를 완료하면 외부 인터넷에서 접속 가능합니다." -ForegroundColor Green
Write-Host ""
Read-Host "계속하려면 Enter를 누르세요"

