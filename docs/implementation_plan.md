# JSONOTE 고도화 및 치명적 버그 수정

앞서 분석한 오류들을 반영하여 앱의 치명적인 데스크톱 구동 및 CI 배포 오류를 완벽히 수정하고 프로젝트의 안정성을 확보합니다.

## User Review Required

> [!CAUTION]
> GitHub Actions 릴리즈 배포 실패(403 Forbidden)는 코드 수정만으로는 해결되지 않을 수 있습니다. 저장소 설정(**Settings > Actions > General > Workflow permissions**)에서 `Read and write permissions`가 올바르게 활성화되어 있는지 사용자의 수동 확인이 필요합니다.

## Proposed Changes

### Electron 메인 로직 보완
사용자 컴퓨터에 전역으로 설치된 Node.js 환경에 구애받지 않고, 자체 내장된 Node엔진을 통해 독립적으로 Next.js 서버가 실행되도록 변경합니다.

#### [MODIFY] [main.js](file:///d:/jsonote/electron/main.js)
- `spawn('node', ...)` 부분을 `spawn(process.execPath, ...)`로 교체합니다.
- `env: { ...env, ELECTRON_RUN_AS_NODE: 1 }` 속성을 부여하여 완전한 로컬 격리를 구현합니다.

---

### CI/CD 워크플로우 안정화 및 최적화
네이티브 모듈 빌드 에러를 방지하고 Next.js 빌드 속도를 개선합니다.

#### [MODIFY] [auto-cd.yml](file:///d:/jsonote/.github/workflows/auto-cd.yml)
- `setup-node` 의 `node-version: 20` 을 `node-version: 22`로 상향 조치합니다.
- Next.js 성능 향상을 위한 Build Cache Action(`actions/cache`) 스탭을 신규 추가합니다.
- (옵션) 오래된 서드파티 액션(`action-electron-builder`) 대신 순수 `npx electron-builder` 명령으로 교체하여 유지보수성을 극대화합니다.

---

### 문서 구조 및 구동 환경 동기화
요구되는 Node.js 사양 확장에 따라 프로젝트의 모든 문서 가이드를 갱신합니다.

#### [MODIFY] [README.md](file:///d:/jsonote/README.md)
#### [MODIFY] [README_ko.md](file:///d:/jsonote/README_ko.md)
#### [MODIFY] [README_ja.md](file:///d:/jsonote/README_ja.md)
- `Node.js v20.9.0 이상` 문구를 `Node.js v22.12.0 이상`으로 상향 변경합니다.

#### [MODIFY] [package.json](file:///d:/jsonote/package.json)
- 구동 명세(`engines`)를 Node 22(`>=22.12.0`) 이상으로 최신화합니다.

## Open Questions

> [!IMPORTANT]
> 1. 보안 위험이 있는 의존성 패키지(`rimraf`, `tar` 등) 해결을 위해 `npm audit fix` 명령어를 임의로 실행하여 패키지 버전을 일괄 업데이트해도 괜찮을까요?
> 2. CI 파일(`auto-cd.yml`)에서 유지보수가 중단된 구형 `samuelmeuli/action-electron-builder@v1`을 제거하고, 공식 `npm run electron:build` 파이프라인으로 구조를 아예 개편해도 될까요?

## Verification Plan

### Automated Tests
- 수정된 코드로 CI를 실행하여 GitHub 릴리즈(Release) 자산이 정상적으로 컴파일 및 업로드(`status 200/201`)되는지 자동 검증합니다.

### Manual Verification
- 테스트 브랜치 내 `npm run electron:build` 후 생성된 Windows `.exe` 파일을 바탕화면에서 즉시 구동했을 때 하얀 화면(Blank) 없이 원활하게 구동되는지 확인 부탁드립니다 (Node.js 미설치 PC 우대).
