# JSONOTE 기여 가이드

[![English](./CONTRIBUTING.md)](./CONTRIBUTING.md) [![Japanese](https://i.namu.wiki/i/-6zD4tIyEplQ_Q44rBjydwhDQ1pOaig6biAKN_MiK01bU7T0_4iZg5IVcNyOzzUolTyLp8aAFKrjJhqutcQx74i37kT2DzzsROquAUrnNy7VFmpFuQTccFJT552leCkTpg9LDJgd2xNwWOv5NYZ15g.svg)](./CONTRIBUTING_ja.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

JSONOTE에 관심을 가져주셔서 감사합니다! 프로젝트가 초기 단계인 만큼 여러분의 기여가 큰 힘이 됩니다.

## 🛠️ 개발 환경 설정
1. Node.js: **v20.9.0 이상** (Next.js 16 빌드에 필수).
2. 저장소를 클론합니다.
3. 의존성을 설치합니다: `npm install`.
4. 개발 서버를 시작합니다: `npm run dev`.

## 📜 기여 규칙
- **코드 품질**: 기존 코드 스타일을 준수하고 린트 에러가 없는지 확인하세요.
- **한영 병기 주석**: 모든 코드 주석은 **영어와 한국어**를 병기해야 합니다.
- **이슈 우선**: 큰 변화가 있는 작업은 Pull Request를 보내기 전에 이슈를 열어 먼저 논의해 주세요.

## 🚀 제출 방법
1. 저장소를 포크(Fork)합니다.
2. 새 브랜치를 생성합니다: `git checkout -b feature/your-feature`.
3. 변경 사항을 커밋합니다.
4. 브랜치에 푸시한 뒤 Pull Request를 생성합니다.


## 🚀 배포 프로세스 (Auto-CD)
우리는 GitHub Actions를 통한 완전 자동화된 CI/CD 파이프라인을 사용합니다.
- **`main` 브랜치에 푸시하기만 하면 됩니다.**
- 시스템이 자동으로 다음을 수행합니다:
  1. **Patch 버전**을 증가시킵니다 (예: v1.0.0 -> v1.0.1).
  2. **GitHub Release** 태그를 생성합니다.
  3. **Docker 이미지**를 빌드하여 GHCR에 푸시합니다.
  4. **데스크탑 앱**을 빌드하여 업로드합니다 (Windows .exe, macOS .dmg, Linux .AppImage).

수동으로 태그나 릴리즈를 생성하지 마십시오.

---
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
