# Git 설치 가이드 (Windows)

## 방법 1: 공식 웹사이트에서 설치 (권장)

### 1단계: Git 다운로드
1. 브라우저에서 https://git-scm.com/download/win 접속
2. 자동으로 다운로드가 시작됩니다
3. 또는 "64-bit Git for Windows Setup" 클릭하여 직접 다운로드

### 2단계: Git 설치
1. 다운로드한 설치 파일 실행 (예: `Git-2.xx.x-64-bit.exe`)
2. 설치 마법사에서 **"Next"** 버튼을 계속 클릭
3. 기본 설정으로 설치하는 것을 권장합니다:
   - **Editor**: 기본값 (Nano 또는 Vim) 또는 원하는 에디터 선택
   - **Default branch name**: `main` (권장)
   - **PATH environment**: "Git from the command line and also from 3rd-party software" 선택 (권장)
   - **Line ending conversions**: "Checkout Windows-style, commit Unix-style line endings" 선택 (권장)
4. **"Install"** 클릭하여 설치 시작
5. 설치 완료 후 **"Finish"** 클릭

### 3단계: 설치 확인
PowerShell을 **새로 열고** 다음 명령어 실행:

```powershell
git --version
```

버전 번호가 표시되면 설치 성공입니다!

---

## 방법 2: winget 사용 (Windows 10/11)

PowerShell을 **관리자 권한**으로 실행한 후:

```powershell
winget install --id Git.Git -e --source winget
```

---

## 방법 3: Chocolatey 사용 (이미 설치된 경우)

PowerShell을 **관리자 권한**으로 실행한 후:

```powershell
choco install git
```

---

## 설치 후 다음 단계

Git 설치가 완료되면:

1. **PowerShell을 새로 열기** (중요!)
   - 기존 PowerShell 창을 닫고 새로 열어야 환경 변수가 적용됩니다

2. **프로젝트 폴더로 이동**
   ```powershell
   cd C:\Users\Dongsama\curser_project\ai-smart-service
   ```

3. **Git 초기화**
   ```powershell
   git init
   ```

4. **Git 사용자 정보 설정** (처음 한 번만)
   ```powershell
   git config --global user.name "사용자 이름"
   git config --global user.email "이메일@example.com"
   ```

5. **파일 추가 및 커밋**
   ```powershell
   git add .
   git commit -m "Initial commit"
   ```

---

## 문제 해결

### "git 명령어를 찾을 수 없습니다" 오류가 계속되는 경우

1. **PowerShell 재시작**
   - 모든 PowerShell 창을 닫고 새로 열기

2. **환경 변수 확인**
   - Windows 검색에서 "환경 변수" 검색
   - "시스템 환경 변수 편집" 선택
   - "환경 변수" 버튼 클릭
   - "Path" 변수에 `C:\Program Files\Git\cmd`가 있는지 확인
   - 없으면 추가

3. **Git 설치 경로 확인**
   - 기본 경로: `C:\Program Files\Git\`
   - 이 경로에 `git.exe` 파일이 있는지 확인

4. **수동으로 경로 추가**
   ```powershell
   $env:Path += ";C:\Program Files\Git\cmd"
   ```
   (이 명령어는 현재 세션에만 적용됩니다)

---

## 빠른 설치 링크

- **Git 공식 다운로드**: https://git-scm.com/download/win
- **직접 다운로드**: https://github.com/git-for-windows/git/releases/latest

---

## 참고

- Git 설치 후 **반드시 PowerShell을 재시작**해야 합니다
- 설치 중 "PATH 환경 변수에 추가" 옵션을 선택했는지 확인하세요


