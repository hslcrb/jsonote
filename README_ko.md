# JSONOTE (v0.1.0)

[![English](https://img.shields.io/badge/Language-English-blue)](./README.md)

> **GitHub 연동 및 MCP 지원을 갖춘 궁극의 JSON 기반 노트 애플리케이션.**

⚠️ **상태: 활발히 개발 중**  
이 프로젝트는 현재 초기 개발 단계에 있습니다. 아직 첫 번째 공식 릴리즈가 출시되지 않았습니다. 잦은 업데이트와 호환성 변화가 있을 수 있으니 참고하시기 바랍니다.

---

## 🚀 주요 기능

### 1. GitHub 네이티브 동기화
- 모든 노트는 개인 GitHub 저장소에 `.json` 파일로 저장됩니다.
- Git을 통한 완벽한 버전 관리.
- **실시간 동기화 상태 시각적 피드백** 제공 (저장 중... -> 저장됨!).

### 2. 노션 영감의 워크스페이스
- **무한 계층 구조**: 페이지 안에 페이지를 중첩하여 체계적인 지식 베이스를 구축하세요.
- **데이터베이스 뷰**: **리스트, 테이블, 보드** 뷰 사이를 자유롭게 전환하세요.
- **커스텀 속성**: 모든 노트에 메타데이터 필드(텍스트, 숫자, 날짜 등)를 추가할 수 있습니다.

### 3. MCP (Model Context Protocol) 통합
- 외부 AI 도구(Notion MCP, GitHub MCP 등)와 연결하세요.
- 에디터 내에서 AI 도구를 직접 호출하여 노트 내용을 처리할 수 있습니다.
- 브라우저 CORS 제한을 우회하는 서버 사이드 프록시 구현.

### 4. 개발자 친화적 UI
- **글래스모피즘 디자인**: 프리미엄 흑연색(Obsidian-dark) 테마.
- **나눔고딕 타이포그래피**: 깔끔하고 전문적인 로컬 폰트 렌더링.
- **마크다운 지원**: 구문 강조 및 표준 URL 기반 이미지 지원.

---

## 🛠️ 빠른 시작

### 설치
```bash
npm install
npm run dev
```

### 💻 데스크탑 앱 (Windows, Mac, Linux)
설치형 앱을 원하시나요? [릴리즈 페이지](../../releases)에서 공식 데스크탑 클라이언트를 다운로드하세요.
- **Windows**: `Setup.exe` (설치 관리자) 또는 `.zip` (무설치 포터블)
- **Mac**: `.dmg` (설치 이미지) 또는 `.zip` (앱 번들)
- **Linux**: `.AppImage` (실행 파일) 또는 `.zip`

### 설정
1. 앱 내 **설정(Settings)**으로 이동합니다.
2. **GitHub Personal Access Token**을 입력합니다.
3. `Owner`, `Repo`, `Branch`를 지정합니다.
4. **연결 진단 (Test Connection)** 버튼을 눌러 토큰과 권한을 즉시 확인하세요.
5. 저장 시 노트가 자동으로 동기화됩니다.

### 문제 해결 (Troubleshooting)
동기화 오류(예: "SHA not supplied", "Bad Credentials")가 발생할 경우:
1. **설정** 메뉴를 엽니다.
2. **연결 진단** 버튼을 클릭합니다.
3. 도구가 다음을 자동으로 진단합니다:
   - 토큰 유효성 (인증)
   - 저장소 접근 권한 (읽기)
   - 쓰기 권한 (Push)
4. 화면의 로그를 확인하여 권한 문제를 해결하세요.

---

## 📝 문서

JSONOTE에 대한 더 깊은 내용은 아래 문서들을 확인하세요:

- 📘 **[시작 가이드](./docs/GUIDE_ko.md)** ([English](./docs/GUIDE.md)): 기본적인 사용법.
- ⚙️ **[MCP 설정 가이드](./docs/MCP_SETUP_ko.md)** ([English](./docs/MCP_SETUP.md)): AI 도구 설정법.
- 🛡️ **[보안 및 개인정보](./docs/SECURITY_ko.md)** ([English](./docs/SECURITY.md)): 데이터 처리 방식.
- 🤝 **[기여 가이드](./CONTRIBUTING_ko.md)** ([English](./CONTRIBUTING.md)): JSONOTE의 성장에 참여하는 법.

---

## ⚖️ 라이선스
Copyright (c) 2026 JSONOTE Team. All rights reserved.
