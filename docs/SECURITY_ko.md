# 보안 및 개인정보

[![English](./SECURITY.md)](./SECURITY.md) [![Japanese](https://i.namu.wiki/i/-6zD4tIyEplQ_Q44rBjydwhDQ1pOaig6biAKN_MiK01bU7T0_4iZg5IVcNyOzzUolTyLp8aAFKrjJhqutcQx74i37kT2DzzsROquAUrnNy7VFmpFuQTccFJT552leCkTpg9LDJgd2xNwWOv5NYZ15g.svg)](./SECURITY_ja.md)
[![Version](https://img.shields.io/badge/Version-v1.0-green)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


## 1. 토큰 보안
사용자의 GitHub Personal Access Token은 브라우저의 `localStorage`에만 저장됩니다. 저희 서버로 전송되지 않으며, 모든 GitHub API 호출은 브라우저에서 직접 또는 설정된 사설 프록시를 통해 이루어집니다.

## 2. 로컬 폰트 서빙
이 앱은 외부 추적을 방지하고 오프라인 가용성을 보장하기 위해 모든 폰트를 로컬 서버에서 직접 제공합니다.

## 3. 개인 데이터
JSONOTE는 노트 저장을 위한 별도의 백엔드 데이터베이스를 두지 않습니다. 모든 데이터는 **사용자 본인**의 GitHub 저장소에 저장됩니다.

---
Copyright 2008-2026 Rheehose (Rhee Creative).
