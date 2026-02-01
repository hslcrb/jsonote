# JSONOTE (v1.0.5)

<p align="center">
  <img src="public/logo.svg" alt="JSONOTE Logo" width="400">
</p>

[![English](https://img.shields.io/badge/Language-English-blue)](./README.md) [![Japanese](https://i.namu.wiki/i/-6zD4tIyEplQ_Q44rBjydwhDQ1pOaig6biAKN_MiK01bU7T0_4iZg5IVcNyOzzUolTyLp8aAFKrjJhqutcQx74i37kT2DzzsROquAUrnNy7VFmpFuQTccFJT552leCkTpg9LDJgd2xNwWOv5NYZ15g.svg)](./README_ja.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://github.com/hslcrb/jsonote/actions/workflows/auto-cd.yml/badge.svg)](https://github.com/hslcrb/jsonote/actions)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/hslcrb/jsonote/releases/latest)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-blue)](https://github.com/hslcrb/jsonote/pkgs/container/jsonote)

> **GitHub 연동 및 MCP 지원을 갖춘 궁극의 JSON 기반 노트 애플리케이션.**

**공식 첫 출시일: 2026년 1월 19일 월요일 (KST)**

---

## 🛠️ 시작하기 (v1.0.5)

### 1. 💻 데스크탑 앱 (Windows, macOS, Linux) - **권장**
가장 빠르고 안정적인 방법입니다. [릴리즈 페이지](../../releases)에서 공식 데스크탑 클라이언트를 다운로드하세요.
- **Windows**: `JSONOTE-Setup-1.0.5.exe` (설치형) 또는 `.zip` (무설치 포터블)
- **macOS**: `JSONOTE-1.0.5.dmg` (Intel/Apple Silicon 공용) 또는 `.zip`
- **Linux**: `JSONOTE-1.0.5.AppImage` (범용 실행 파일) 또는 `.tar.gz`

### 2. 🐳 Docker (컨테이너 배포)
Docker 환경에서 즉시 실행이 가능합니다:
```bash
# 이미지 가져오기 및 실행
docker pull ghcr.io/hslcrb/jsonote:latest
docker run -d -p 3000:3000 --name jsonote-local ghcr.io/hslcrb/jsonote:latest
```
`http://localhost:3000`으로 접속하여 시작하세요.

### 3. 🏗️ 개발자 가이드 (소스 빌드)
Node.js **v20.9.0** 이상 환경에서 작동합니다.
```bash
# 1. 소스 가져오기
git clone https://github.com/hslcrb/jsonote.git
cd jsonote

# 2. 패키지 설치
npm install

# 3. 실행 모드 선택
npm run dev          # 웹 개발 모드
npm run electron:dev # 데스크탑 개발 모드

# 4. 상용 빌드
npm run build
npm run start
```

---

## 🚀 주요 기능

### 1. 유니버설 스토리지 동기화
- **GitHub Native**: 노트를 개인 GitHub 저장소에 `.json` 파일로 저장합니다.
- **로컬 / 브라우저**: 데스크톱 앱에서의 로컬 폴더 연동은 물론, 웹 버전에서도 브라우저의 File System Access API를 통해 실제 로컬 폴더를 직접 연동할 수 있습니다.
- 실시간 동기화 피드백 제공.

### 2. 노션 영감의 워크스페이스
- **무한 계층 구조**: 페이지 안에 페이지를 중첩하여 지식 베이스 구축.
- **데이터베이스 뷰**: 리스트, 테이블, 보드 뷰 간 자유로운 전환.

### 3. MCP (Model Context Protocol) 통합
- Notion, GitHub 등 외부 AI 도구를 에디터 내에서 직접 호출.

### 4. 프리미엄 디자인
- **글래스모피즘**: 세련된 옵시디언 다크 테마와 부드러운 애니메이션.

---

## ⚙️ 설치 후 초기 설정
1. 앱 내 **설정(Settings)**으로 이동합니다.
2. **GitHub Personal Access Token**을 입력합니다 (Repo 권한 필요).
3. `Owner`, `Repo`, `Branch`를 지정합니다.
4. **연결 진단 (Test Connection)** 버튼을 눌러 상태를 확인하세요.
5. 이제 모든 준비가 끝났습니다! 저장 시 자동으로 동기화됩니다.

---

## 📝 문서
- 📘 [시작 가이드](./docs/GUIDE_ko.md)
- ⚙ [MCP 설정 가이드](./docs/MCP_SETUP_ko.md)
- 🛡️ [보안 및 개인정보](./docs/SECURITY_ko.md)
- 🤝 [기여 가이드](./CONTRIBUTING_ko.md)

---

## ⚖️ 라이선스
Licensed under the **Apache License 2.0**.
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
