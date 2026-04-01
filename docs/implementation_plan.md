# 파일명 동기화 및 폰트 변경(명조) 업데이트 계획

새로운 요구사항(파일 이름과 노트 제목을 일치시키기, 노트를 생성할 때 타입별 자동 태그 주입, 전체 앱 폰트를 명조와 고딕으로 토글하는 기능)에 대한 구현 상세 계획입니다.

## User Review Required

- 파일명을 제목으로 변경하면, 윈도우나 깃허브에서 허용하지 않는 금지 문자열(`\ / : * ? " < > |`)은 파일 생성 에러를 유발할 수 있으므로, 자동으로 파싱하여 치환(`_`) 하도록 정제 로직을 포함해야 합니다.
- 폰트 스위칭(고딕/명조)을 지원하기 위해 하단 사이드바의 설정 아이콘 영역 옆에 "가/A" (또는 고/명) 형태의 텍스트 기반 변환 버튼을 하나 더 추가할 계획입니다. 배치에 동의하시는지 확인해주세요.

## Proposed Changes

### 1. 노트 제목(Title)을 파일명(Filename)과 동기화
노트 저장 시, 제목을 기반으로 항상 파일명을 업데이트하도록 변경합니다.

#### [MODIFY] [page.tsx](file:///d:/jsonote/src/app/page.tsx)
- `handleSaveNote` 함수 내 저장 전처리 로직에 `metadata.customFilename`을 `metadata.title`을 기반으로 할당하도록 로직 추가.
- 특수 문자 제거 정규식: `const sanitizedTitle = updatedNote.metadata.title.replace(/[\\/:*?"<>|]/g, '_');`

### 2. 모든 Note Type 기반 자동 태그 주입
노트 신규 생성 시, `journal` 뿐만 아니라 모든 타입에 알맞은 기본 태그를 주입합니다.

#### [MODIFY] [page.tsx](file:///d:/jsonote/src/app/page.tsx)
- `createNewNote` 함수 안의 조건문을 늘려, `['general', 'todo', 'database', 'task', 'meeting', 'journal', 'code']` 각각의 속성에 대응되는 고유 태그를 기본값으로 입력.

### 3. 나눔명조 폰트 지원 및 전역 스위치 기능
추가해주신 `ttf` 파일들을 정의하고, 클릭하여 전체 앱의 폰트를 토글할 수 있게 구성합니다.

#### [MODIFY] [globals.css](file:///d:/jsonote/src/app/globals.css)
- 사이드바나 메인 영역에 나눔명조 폰트를 로드할 수 있도록 `@font-face` 추가: `NanumMyeongjo.ttf` 등 3종 선언.
- 기존의 하드코딩된 `font-family: 'Nanum Gothic'` 부분들을 CSS 변수인 `var(--font-family-primary)`로 묶고 선언부에서 제어.

#### [MODIFY] [page.tsx](file:///d:/jsonote/src/app/page.tsx)
- React 상태: `const [font, setFont] = useState<'gothic' | 'myeongjo'>('gothic');`
- `<div className="toggle-row">` 구역에 폰트 스왑 토글 UI 버튼 탑재 및 HTML Root element의 `data-font` 속성에 바인딩.

#### [MODIFY] 기타 컴포넌트 하드코딩 폰트 적용 해제
- `NoteEditor.tsx`, `PromptDialog.tsx` 내부 CSS 중 `font-family` 강제 입력 부분 삭제 또는 변수화 진행.

## Verification Plan

### Manual Verification
- 기능 적용 후 노트를 생성해 제목을 '나의.새로운/노트!'로 지었을 때 파일명이 안전하게 `나의.새로운_노트!.json`으로 GitHub에 올라가는지 확인합니다.
- 좌하단 메뉴의 폰트 버튼 클릭 시, 화면 전체의 텍스트가 자연스럽게 명조체로 변환되는지 테스트합니다.
