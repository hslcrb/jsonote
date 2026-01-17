# MCP 설정 가이드

[![English](./MCP_SETUP.md)](./MCP_SETUP.md)
<img src="../public/logo.png" width="80" align="right" />

Model Context Protocol (MCP)은 JSONOTE 내에서 AI 연동을 가능하게 합니다.

## 1. 왜 로컬 MCP 서버인가요?
대부분의 MCP 서버는 StdIO를 통해 통신합니다. JSONOTE는 웹 앱이므로, 서버 사이드 프록시를 통해 로컬 서버와 통신합니다.

## 2. SSE 브릿지 사용
로컬 MCP 서버를 연결하려면:
1. SSE 브릿지(예: `@modelcontextprotocol/inspector`)를 사용하여 MCP 서버를 실행합니다.
2. Notion 예시:
   ```bash
   NOTION_API_KEY=xxx npx @modelcontextprotocol/server-notion
   ```
3. 브릿지에서 제공하는 URL을 복사합니다.

## 3. JSONOTE에 등록하기
1. JSONOTE의 **MCP 도구** 탭으로 이동합니다.
2. 이름과 브릿지 URL을 입력합니다.
3. **테스트** 버튼을 눌러 연결을 확인합니다.
4. 연결된 도구들이 노트 에디터 우측 사이드바에 나타납니다.

---
Copyright (c) 2026 JSONOTE Team.
