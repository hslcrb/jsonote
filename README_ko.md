# JSONOTE (v1.0)

[![English](https://img.shields.io/badge/Language-English-blue)](./README.md) [![Japanese](https://i.namu.wiki/i/-6zD4tIyEplQ_Q44rBjydwhDQ1pOaig6biAKN_MiK01bU7T0_4iZg5IVcNyOzzUolTyLp8aAFKrjJhqutcQx74i37kT2DzzsROquAUrnNy7VFmpFuQTccFJT552leCkTpg9LDJgd2xNwWOv5NYZ15g.svg)](./README_ja.md)
[![Version](https://img.shields.io/badge/Version-v1.0-green)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://github.com/hslcrb/jsonote/actions/workflows/auto-cd.yml/badge.svg)](https://github.com/hslcrb/jsonote/actions)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/hslcrb/jsonote/releases/latest)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-blue)](https://github.com/hslcrb/jsonote/pkgs/container/jsonote)

> **GitHub 연동 및 MCP 지원을 갖춘 궁극의 JSON 기반 노트 애플리케이션.**

**공식 첫 출시일: 2026년 1월 19일 월요일 (KST)**

---

## 🛠️ 시작하기 (설치 및 실행 방법)

### 1. 💻 데스크탑 앱 (Windows, Mac, Linux) - **권장**
[릴리즈 페이지](../../releases)에서 공식 데스크탑 클라이언트를 다운로드하세요.
- **Windows**: `Setup.exe` (설치 관리자) 또는 `.zip` (무설치 포터블)
- **Mac**: `.dmg` (설치 이미지) 또는 `.zip` (앱 번들)
- **Linux**: `.AppImage` (실행 파일) 또는 `.zip`

### 2. 🐳 Docker (GitHub 컨테이너 레지스트리)
Docker를 사용해 즉시 실행할 수 있습니다:
```bash
docker pull ghcr.io/hslcrb/jsonote:latest
docker run -p 3000:3000 ghcr.io/hslcrb/jsonote:latest
```
`http://localhost:3000`으로 접속하세요.

### 3. 🏗️ 소스에서 빌드 (개발자용)
Node.js **v20.9.0** 이상이 필요합니다.
```bash
git clone https://github.com/hslcrb/jsonote.git
cd jsonote
npm install
npm run build
npm run start
```

---

## 🚀 주요 기능

### 1. GitHub 네이티브 동기화
- 모든 노트는 개인 GitHub 저장소에 `.json` 파일로 저장됩니다.
- Git을 통한 완벽한 버전 관리 및 실시간 동기화 피드백.

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
**Apache License 2.0** 조건에 따라 라이선스가 부여됩니다.
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
