# 일기(저널) 템플릿 자동화 기능 구현 계획

사용자가 몇 번의 '딸깍'과 최소한의 키보드 입력만으로 손쉽게 일기를 남길 수 있도록, JSONOTE 앱에 맞춤형 저널(Journal) 템플릿 생성 기능을 추가합니다.

## User Review Required

- 날짜 생성 시 시스템 언어 설정과 무관하게 요일을 무조건 영어 3자리(`Mon`, `Wed` 등)로 표기하기 위해, 내부적으로 영어(US) 로케일 모듈을 바인딩합니다.
- 새 노트를 만드는 사이드바 UI 그리드가 현재 '투두', 'DB' 2열 구조로 꽉 차 있습니다. 일기 버튼을 추가하기 위해 CSS 그리드를 3열(`1fr 1fr 1fr`) 구조로 변경합니다.

## Proposed Changes

### 클라이언트 UI 및 템플릿 주입 로직 변경

#### [MODIFY] [page.tsx](file:///d:/jsonote/src/app/page.tsx)
- **라이브러리 불러오기**: 상단에 `import { enUS } from 'date-fns/locale';`를 추가하여 영문 날짜 포맷을 준비합니다.
- **새 일기 버튼 추가**: 사이드바의 `.new-grid` 영역 첫 번째 칸에 `일기` 생성 전용 버튼을 배치합니다.
- **스타일 시트 수정**: `.new-grid`의 CSS 속성을 `grid-template-columns: 1fr 1fr;`에서 `1fr 1fr 1fr;`로 확장하여 세 개의 위젯이 예쁘게 나란히 정렬되게 합니다.
- **`createNewNote` 템플릿 함수 고도화**:
  버튼에서 `type === 'journal'`을 호출하면 다음 두 가지가 즉시 주입된 상태로 에디터가 팝업됩니다.
  1. 제목(Title): 자동 지정 `format(new Date(), 'yyyyMMdd EEE', { locale: enUS })` (결과: `20260401 Wed`)
  2. 내용(Content): 즉각 타이핑할 수 있도록 설계된 마크다운 구조
     ```markdown
     # 20260401 Wed
     
     ## 📋 오늘의 할 일
     - [ ] 
     
     ## 📝 기록
     - 
     ```

## Open Questions

> [!TIP]
> 템플릿 본문(마크다운) 구조를 위와 같이 심플한 [할일 + 기록] 영역으로 짰습니다. 혹시 추가로 미리 적혀있었으면 하는 항목(예: 오늘 있었던 감사한 일, 날씨, 기분 점수 등)이 있다면 말씀해 주세요! 

## Verification Plan

### Manual Verification
- 저장 직후 Next.js 개발 서버(`npm run dev`)를 통해 자동으로 HMR 갱신된 화면을 띄웁니다.
- `일기` 버튼을 눌렀을 때, 우측 에디터에 제목과 탬플릿이 정상적으로 초기화되었는지 개발자 도구의 에러 없이 검증합니다.
