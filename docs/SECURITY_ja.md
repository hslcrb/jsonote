# セキュリティとプライバシー

[![English](./SECURITY.md)](./SECURITY.md) [![Korean](./SECURITY_ko.md)](./SECURITY_ko.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 1. トークンの安全性
GitHub Personal Access Tokenはブラウザの `localStorage` にのみ保存されます。当社のサーバーに送信されることはありません。すべてのGitHub API呼び出しは、ブラウザから直接GitHubへ（クライアントサイド）、または設定されている場合はプライベートプロキシを通じて行われます。

## 2. ローカルフォントの提供
このアプリケーションは、外部追跡を防ぎオフラインでの利用可能性を確保するために、すべてのフォントをローカルで提供します。

## 3. プライベートデータ
JSONOTEにはノート用のバックエンドデータベースがありません。すべては **あなたの** GitHubリポジトリに保存されます。

---
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
