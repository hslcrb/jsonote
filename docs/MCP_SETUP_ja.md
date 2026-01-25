# MCP セットアップガイド

[![English](./MCP_SETUP.md)](./MCP_SETUP.md) [![Korean](./MCP_SETUP_ko.md)](./MCP_SETUP_ko.md)
[![Version](https://img.shields.io/badge/Version-v1.0-green)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Model Context Protocol (MCP) は、JSONOTE内でのAI統合を可能にします。

## 1. なぜローカルMCPサーバーなのか？
MCPサーバーは通常StdIOを介して通信します。JSONOTEはウェブアプリであるため、サーバーサイドプロキシを使用してこれらのローカルサーバーと通信します。

## 2. SSEブリッジの使用
ローカルMCPサーバーを接続するには:
1. SSEブリッジ（例: `@modelcontextprotocol/inspector`）を使用してMCPサーバーを実行します。
2. Notionの例:
   ```bash
   NOTION_API_KEY=xxx npx @modelcontextprotocol/server-notion
   ```
3. ブリッジから提供されたURLをコピーします。

## 3. JSONOTEへの登録
1. JSONOTEの **MCP Tools** タブに移動します。
2. 名前とブリッジURLを入力します。
3. **Test (テスト)** をクリックして接続を確認します。
4. ノートエディタの右サイドバーにツールが表示されるようになります。

---
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
