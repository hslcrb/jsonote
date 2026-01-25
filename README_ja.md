# JSONOTE (v1.0)

[![English](https://img.shields.io/badge/Language-English-blue)](./README.md) [![Korean](https://img.shields.io/badge/Language-Korean-red)](./README_ko.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://github.com/hslcrb/jsonote/actions/workflows/auto-cd.yml/badge.svg)](https://github.com/hslcrb/jsonote/actions)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/hslcrb/jsonote/releases/latest)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-blue)](https://github.com/hslcrb/jsonote/pkgs/container/jsonote)

> **Github統合とMCPサポートを備えた究極のJSONベースのノート作成アプリケーション。**

**公式初回リリース: 2026年1月19日 月曜日 (KST)**

---

## 🛠️ インストールとセットアップ（開始方法）

### 1. 💻 デスクトップアプリ (Windows, Mac, Linux) - **推奨**
[リリースページ](../../releases)から公式スタンドアロンクライアントをダウンロードしてください。
- **Windows**: `JSONOTE-Setup-1.0.exe` (インストーラー) または `.zip` (ポータブル)
- **Mac**: `JSONOTE-1.0.dmg` (インストーラー) または `.zip` (アプリバンドル)
- **Linux**: `JSONOTE-1.0.AppImage` (実行ファイル) または `.zip`

### 2. 🐳 Docker (GitHub Container Registry)
Dockerを使用してアプリケーションを即座に実行できます:
```bash
docker pull ghcr.io/hslcrb/jsonote:latest
docker run -p 3000:3000 ghcr.io/hslcrb/jsonote:latest
```
`http://localhost:3000` でアプリにアクセスします。

### 3. 🏗️ ソースからビルド (開発者向け)
Node.js **v20.9.0** 以上が必要です。
```bash
git clone https://github.com/hslcrb/jsonote.git
cd jsonote
npm install
npm run build
npm run start
```

---

## 🚀 主な機能

### 1. GitHubネイティブ同期
- ノートはプライベートGitHubリポジトリに `.json` ファイルとして保存されます。
- Gitを通じた完全なバージョン管理。
- **視覚的フィードバック**（保存中... -> 保存完了！）を伴うリアルタイム同期。

### 2. Notionにインスパイアされたワークスペース
- **無限の階層構造**: ページ内にページをネストしてナレッジベースを構築できます。
- **データベースビュー**: **リスト**、**テーブル**、**ボード**ビューを切り替えられます。
- **カスタムプロパティ**: 任意のノートにメタデータフィールド（テキスト、数値、日付など）を追加できます。

### 3. MCP (Model Context Protocol) 統合
- エディタ内から直接外部AIツール（Notion、GitHubなど）に接続できます。

### 4. 開発者向けのUI
- **グラスモーフィズムデザイン**: プレミアムなObsidianダークの美学。
- **Markdownサポート**: シンタックスハイライト、標準URL画像、簡単なフォーマット。

---

## ⚙️ インストール後のセットアップ
1. アプリの **Settings (設定)** を開きます。
2. **GitHub Personal Access Token** を入力します (Repo権限が必要です)。
3. `Owner`, `Repo`, `Branch` を指定します。
4. **Test Connection (接続診断)** をクリックして確認します。
5. 準備完了です！ノートは自動的に同期されます。

---

## 📝 ドキュメント
- 📘 [スタートガイド](./docs/GUIDE_ja.md)
- ⚙️ [MCP セットアップガイド](./docs/MCP_SETUP_ja.md)
- 🛡️ [セキュリティとプライバシー](./docs/SECURITY_ja.md)
- 🤝 [貢献ガイド](./CONTRIBUTING_ja.md)

---

## ⚖️ ライセンス
**Apache License 2.0** の下でライセンスされています。
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
