# JSONOTE 貢献ガイド

[![English](./CONTRIBUTING.md)](./CONTRIBUTING.md) [![Korean](./CONTRIBUTING_ko.md)](./CONTRIBUTING_ko.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

JSONOTEへの貢献に関心をお寄せいただきありがとうございます！プロジェクトは初期段階にあるため、皆様の貢献は非常に貴重です。

## 🛠️ 開発環境
1. Node.js: **v20.9.0 以上** (Next.js 16に必須)。
2. リポジトリをクローンします。
3. 依存関係をインストールします: `npm install`。
4. 開発サーバーを起動します: `npm run dev`。

## 📜 貢献ルール
- **コード品質**: コードが既存のスタイルに従い、適切にリントされていることを確認してください。
- **バイリンガルなコメント**: すべてのコードコメントは **英語と韓国語** の両方で記述する必要があります。
- **Issue優先**: プルリクエストを送信する前に、主要な変更について議論するためにIssueを開いてください。

## 🚀 送信方法
1. リポジトリをフォークします。
2. 新しいブランチを作成します: `git checkout -b feature/your-feature`。
3. 変更をコミットします。
4. ブランチにプッシュしてプルリクエストを開きます。

## 🚀 デプロイプロセス (Auto-CD)
GitHub Actionsによる完全に自動化されたCI/CDパイプラインを使用しています。
- **ただ `main` ブランチにプッシュするだけです**。
- システムは自動的に以下を実行します:
  1. **パッチバージョン** を上げます (例: v1.0.0 -> v1.0.1)。
  2. **GitHub Release** タグを作成します。
  3. **Dockerイメージ** をビルドしてGHCRにプッシュします。
  4. **デスクトップアプリ** をビルドしてアップロードします (Windows .exe, macOS .dmg, Linux .AppImage)。

手動でタグやリリースを作成しないでください。

---
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
