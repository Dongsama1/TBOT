# 무료 배포 가이드

이 문서는 TYM 정비/진단 챗봇을 무료로 외부 인터넷에 배포하는 방법을 안내합니다.

## 📋 사전 준비

1. **GitHub 계정 생성** (아직 없다면)
   - https://github.com 에서 무료 계정 생성

2. **프로젝트를 GitHub에 업로드**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/사용자명/ai-smart-service.git
   git push -u origin main
   ```

3. **진단 데이터 준비**
   - 프로젝트 루트에 `diagnostics` 폴더 생성
   - 기존 진단 파일들을 `diagnostics` 폴더로 복사
   - 또는 `C:\diagnostics` 폴더의 파일들을 프로젝트 내부 `diagnostics` 폴더로 복사

---

## 🚀 방법 1: Render.com (권장)

Render.com은 무료 티어를 제공하며 사용이 간단합니다.

### 단계별 가이드

1. **Render.com 가입**
   - https://render.com 접속
   - GitHub 계정으로 로그인

2. **새 Web Service 생성**
   - Dashboard에서 "New +" 클릭
   - "Web Service" 선택
   - GitHub 저장소 연결

3. **서비스 설정**
   - **Name**: `tym-chatbot` (원하는 이름)
   - **Region**: `Singapore` (한국과 가까운 지역)
   - **Branch**: `main`
   - **Root Directory**: (비워두기)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **환경 변수 설정** (선택사항)
   - Environment Variables 섹션에서:
     - `NODE_ENV`: `production`
     - `PORT`: (자동 설정됨, 수정 불필요)
     - `DIAGNOSTICS_PATH`: (기본값 사용 시 생략 가능)

5. **배포**
   - "Create Web Service" 클릭
   - 배포가 완료되면 자동으로 URL이 생성됩니다
   - 예: `https://tym-chatbot.onrender.com`

### 무료 티어 제한사항

- 서비스가 15분간 비활성화되면 자동으로 슬립 모드로 전환
- 첫 요청 시 약 30초 정도의 시작 시간이 필요할 수 있음
- 월 750시간 무료 (하루 약 25시간)

---

## 🌐 방법 2: Railway

Railway는 무료 크레딧을 제공합니다.

### 단계별 가이드

1. **Railway 가입**
   - https://railway.app 접속
   - GitHub 계정으로 로그인

2. **프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택

3. **자동 배포**
   - Railway가 자동으로 감지하여 배포 시작
   - 배포 완료 후 URL 확인

4. **환경 변수 설정** (필요시)
   - Settings > Variables에서 환경 변수 추가

### 무료 티어 제한사항

- 월 $5 크레딧 제공
- 사용량에 따라 추가 비용 발생 가능

---

## ☁️ 방법 3: Fly.io

Fly.io는 무료 티어를 제공합니다.

### 단계별 가이드

1. **Fly.io CLI 설치**
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Fly.io 가입 및 로그인**
   ```bash
   fly auth signup
   fly auth login
   ```

3. **프로젝트 초기화**
   ```bash
   fly launch
   ```

4. **배포**
   ```bash
   fly deploy
   ```

### 무료 티어 제한사항

- 월 3개의 공유 CPU VM
- 3GB 볼륨 스토리지

---

## 🔧 방법 4: Vercel (프론트엔드만)

Vercel은 프론트엔드 배포에 최적화되어 있습니다. 백엔드가 필요한 경우 다른 옵션을 권장합니다.

---

## 📝 배포 후 확인사항

1. **서비스 접속 확인**
   - 배포된 URL로 접속하여 정상 작동 확인

2. **진단 데이터 확인**
   - `/api/refresh` 엔드포인트를 호출하여 데이터 로드 확인
   - 또는 관리자 페이지에서 데이터 새로고침 버튼 클릭

3. **챗봇 테스트**
   - 간단한 질문을 입력하여 응답 확인

---

## 🔄 업데이트 배포

코드를 수정한 후 GitHub에 푸시하면 자동으로 재배포됩니다:

```bash
git add .
git commit -m "Update description"
git push
```

---

## ⚠️ 주의사항

1. **데이터베이스**
   - SQLite 데이터베이스는 배포 환경에서 영구 저장소가 아닐 수 있습니다
   - Render.com의 경우 디스크는 임시적이므로, 데이터는 재배포 시 초기화될 수 있습니다

2. **진단 데이터**
   - `diagnostics` 폴더의 파일들은 Git에 커밋되어야 배포됩니다
   - 큰 파일의 경우 Git LFS 사용을 고려하세요

3. **환경 변수**
   - 민감한 정보는 환경 변수로 관리하세요
   - 절대 코드에 하드코딩하지 마세요

4. **포트 설정**
   - 배포 플랫폼은 자동으로 PORT 환경 변수를 설정합니다
   - 코드에서 `process.env.PORT`를 사용하도록 이미 설정되어 있습니다

---

## 🆘 문제 해결

### 배포 실패 시

1. **로그 확인**
   - 배포 플랫폼의 로그를 확인하여 오류 메시지 확인

2. **일반적인 문제**
   - Node.js 버전 불일치: `package.json`의 `engines` 필드 확인
   - 의존성 설치 실패: `package.json`의 `dependencies` 확인
   - 포트 설정 오류: `server.js`에서 `process.env.PORT` 사용 확인

3. **지원**
   - 각 플랫폼의 문서 및 커뮤니티 포럼 참조

---

## 📚 추가 리소스

- [Render.com 문서](https://render.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Fly.io 문서](https://fly.io/docs)
- [Node.js 배포 가이드](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

