# JSONOTE (v1.0.5)

<p align="center">
  <img src="public/logo.svg" alt="JSONOTE Logo" width="400">
</p>

[![English](https://img.shields.io/badge/Language-English-blue)](./README.md) [![Korean](https://img.shields.io/badge/Language-Korean-red)](./README_ko.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://github.com/hslcrb/jsonote/actions/workflows/auto-cd.yml/badge.svg)](https://github.com/hslcrb/jsonote/actions)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/hslcrb/jsonote/releases/latest)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-blue)](https://github.com/hslcrb/jsonote/pkgs/container/jsonote)

> **GitHub統合とMCPサポートを備えた究極のJSONベースのノート作成アプリケーション。**

**公式初回リリース: 2026年1月19日 月曜日 (KST)**

---

## 🛠️ インストールとセットアップ (v1.0.5)

### 1. 💻 デスクトップアプリ (Windows, macOS, Linux) - **推奨**
JSONOTEをデスクトップアプリとして利用する、最も安定した方法です。[リリースページ](../../releases)からダウンロードしてください。
- **Windows**: `JSONOTE-Setup-1.0.5.exe` (インストーラー) または `.zip` (ポータブル)
- **macOS**: `JSONOTE-1.0.5.dmg` (Intel/Apple Silicon 両対応) または `.zip`
- **Linux**: `JSONOTE-1.0.5.AppImage` (ユニバーサルパッケージ) または `.tar.gz`

### 2. 🐳 Docker (コンテナ)
Docker環境で即座に実行可能です:
```bash
# イメージのプルと実行
docker pull ghcr.io/hslcrb/jsonote:latest
docker run -d -p 3000:3000 --name jsonote-local ghcr.io/hslcrb/jsonote:latest
```
`http://localhost:3000` でアクセスして開始します。

### 3. 🏗️ 開発者向けクイックスタート (ビルド)
Node.js **v20.9.0** 以上が必要です。
```bash
# 1. クローン
git clone https://github.com/hslcrb/jsonote.git
cd jsonote

# 2. セットアップ
npm install

# 3. 実行モード選択
npm run dev          # Web開発モード
npm run electron:dev # Electronデスクトップ開発モード

# 4. プロダクションビルド
npm run build
npm run start
```

---

## 🚀 主な機能

### 1. ユニバーサルストレージ同期
- **GitHubネイティブ**: ノートをプライベートGitHubリポジトリに `.json` ファイルとして保存。
- **ローカル / ブラウザ**: デスクトップアプリでの高性能ローカルフォルダ保存、およびウェブ版でのシームレスなブラウザ保存をサポート。
- リアルタイム同期と視覚的なフィードバック。

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
Licensed under the **Apache License 2.0**.
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
