# MCP Setup Guide

<p align="center"><img src="../public/logo.svg" width="200"></p>

[![Korean](https://i.namu.wiki/i/sWPT7gp9y6RDK_9IVVHmBDwc-JIlzbRbxyS_Jy2TUAFm3O97u34B3Y-vJXWbGOAS0aXzDXDLsRP5PffCMB5hdKdrLLZ_TZZlA3WdKP_xgmtX_QZaLZNuMc7tHM1CZBjBGrtlF7numCKhlOQFRN7IaA.svg)](./MCP_SETUP_ko.md) [![Japanese](https://i.namu.wiki/i/-6zD4tIyEplQ_Q44rBjydwhDQ1pOaig6biAKN_MiK01bU7T0_4iZg5IVcNyOzzUolTyLp8aAFKrjJhqutcQx74i37kT2DzzsROquAUrnNy7VFmpFuQTccFJT552leCkTpg9LDJgd2xNwWOv5NYZ15g.svg)](./MCP_SETUP_ja.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
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
