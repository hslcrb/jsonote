# 보안 및 개인정보

[![English](./SECURITY.md)](./SECURITY.md)
<img src="../public/logo.png" width="80" align="right" />

## 1. 토큰 보안
사용자의 GitHub Personal Access Token은 브라우저의 `localStorage`에만 저장됩니다. 저희 서버로 전송되지 않으며, 모든 GitHub API 호출은 브라우저에서 직접 또는 설정된 사설 프록시를 통해 이루어집니다.

## 2. 로컬 폰트 서빙
이 앱은 외부 추적을 방지하고 오프라인 가용성을 보장하기 위해 모든 폰트를 로컬 서버에서 직접 제공합니다.

## 3. 개인 데이터
JSONOTE는 노트 저장을 위한 별도의 백엔드 데이터베이스를 두지 않습니다. 모든 데이터는 **사용자 본인**의 GitHub 저장소에 저장됩니다.

---
Copyright (c) 2026 JSONOTE Team.
