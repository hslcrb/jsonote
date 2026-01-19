# MCP Setup Guide

[![Korean](./MCP_SETUP_ko.md)](./MCP_SETUP_ko.md)
[![Version](https://img.shields.io/badge/Version-v1.0-green)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Model Context Protocol (MCP) enables AI integration within JSONOTE.

## 1. Why local MCP servers?
MCP servers usually communicate via StdIO. Since JSONOTE is a web app, it uses a server-side proxy to talk to these local servers.

## 2. Using the SSE Bridge
To connect a local MCP server:
1. Run your MCP server using an SSE bridge (e.g., `@modelcontextprotocol/inspector`).
2. Example for Notion:
   ```bash
   NOTION_API_KEY=xxx npx @modelcontextprotocol/server-notion
   ```
3. Copy the URL provided by your bridge.

## 3. Registering in JSONOTE
1. Go to the **MCP Tools** tab in JSONOTE.
2. Enter a name and the bridge URL.
3. Click **Test** to verify connection.
4. Tools will now appear in your Note Editor's right sidebar.

---
Copyright 2008-2026 Rheehose (Rhee Creative).
