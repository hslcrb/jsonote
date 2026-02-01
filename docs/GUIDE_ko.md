# 시작 가이드

<p align="center"><img src="../public/logo.svg" width="200"></p>

[![English](./GUIDE.md)](./GUIDE.md) [![Japanese](https://i.namu.wiki/i/-6zD4tIyEplQ_Q44rBjydwhDQ1pOaig6biAKN_MiK01bU7T0_4iZg5IVcNyOzzUolTyLp8aAFKrjJhqutcQx74i37kT2DzzsROquAUrnNy7VFmpFuQTccFJT552leCkTpg9LDJgd2xNwWOv5NYZ15g.svg)](./GUIDE_ja.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

이 가이드는 JSONOTE의 기본적인 조작법과 고급 기능을 설명합니다.

## 1. 문서 구조
JSONOTE의 각 노트는 다음과 같이 구성됩니다:
- **메타데이터**: 제목, 유형, 태그, 상위 페이지 ID, 커스텀 속성.
- **본문**: 순수 마크다운 텍스트.
- **파일**: GitHub에 JSON 객체 형태로 저장됨.

## 2. 계층 구조 구성
하위 페이지를 만들려면:
1. 아무 노트를 엽니다.
2. 에디터 사이드바에서 **상위 페이지** 드롭다운을 찾습니다.
3. 현재 노트를 중첩시킬 상위 페이지를 선택합니다.
4. 왼쪽 사이드바 트리에 즉시 반영됩니다.

## 3. 데이터베이스 뷰
메인 화면 상단에서 뷰를 전환할 수 있습니다:
- **리스트 뷰**: 미리보기가 포함된 전통적인 세로 목록.
- **테이블 뷰**: 속성들을 한눈에 볼 수 있는 격자형 뷰.
- **보드 뷰**: 노트 유형별로 분류된 칸반 스타일 뷰.

## 4. 커스텀 속성
에디터의 '속성' 섹션에서 **+ 추가**를 클릭하여 키-값 쌍을 추가하세요. 이 정보는 JSON 메타데이터에 저장되며 테이블 뷰에서 확인할 수 있습니다.

## 5. 연결 자가 진단
노트가 저장되지 않는다면 **설정(Settings)**에서 **연결 진단** 버튼을 클릭하세요. 이 도구는 다음을 수행합니다:
1. **인증 확인**: 토큰이 유효한지 확인합니다.
2. **저장소 확인**: 대상 저장소가 존재하는지 확인합니다.
3. **쓰기 테스트**: 임시 파일을 생성하여 실제 푸시 권한이 있는지 확인합니다.
모든 과정은 상세 로그로 표시되어 문제 원인을 바로 파악할 수 있습니다.

---
Copyright 2008-2026 Rheehose (Rhee Creative).
