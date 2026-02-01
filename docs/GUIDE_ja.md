# ユーザーガイド

<p align="center"><img src="../public/logo.svg" width="200"></p>

[![English](./GUIDE.md)](./GUIDE.md) [![Korean](./GUIDE_ko.md)](./GUIDE_ko.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

このガイドでは、JSONOTEの基本操作と高度な機能について説明します。

## 1. ドキュメント構造
JSONOTEの各ノートは以下で構成されています:
- **メタデータ**: タイトル、タイプ、タグ、親ID、カスタムプロパティ。
- **コンテンツ**: 純粋なMarkdownテキスト。
- **ファイル**: GitHub上にJSONオブジェクトとして保存されます。

## 2. 階層的な整理
サブページを作成するには:
1. 任意のノートを開きます。
2. サイドバーで **Parent Page (親ページ)** ドロップダウンを見つけます。
3. 現在のノートをネストさせたい親ページを選択します。
4. サイドバーツリーが即座に更新されます。

## 3. データベースビュー
メインコンテナの上部でビューを切り替えることができます:
- **List View (リストビュー)**: プレビュー付きのクラシックな縦型リスト。
- **Table View (テーブルビュー)**: プロパティを表示するコンパクトなグリッドベースのビュー。
- **Board View (ボードビュー)**: ノートタイプごとのカンバンカテゴリ分類。

## 4. カスタムプロパティ
エディタのプロパティセクションで **+ Add** をクリックして、キーと値のペアを追加します。これらはJSONメタデータに保存され、テーブルビューで表示されます。

## 5. 接続診断
ノートが保存されない場合は、**Settings (設定)** に移動して **Test Connection (接続診断)** をクリックしてください。この組み込みツールは以下を実行します:
1. **認証チェック**: トークンが有効か確認します。
2. **リポジトリチェック**: ターゲットリポジトリが存在するか確認します。
3. **書き込みテスト**: プッシュ権限があることを確認するために一時ファイルの作成を試みます。
エラーがある場合は詳細ログが表示されます。

---
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
