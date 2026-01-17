# JSONOTE (v0.1.0)

[![Korean](https://img.shields.io/badge/Language-Korean-red)](./README_ko.md)
<img src="./public/logo.png" width="200" align="center" />

> **The Ultimate JSON-based Note-taking Application with GitHub Integration & MCP Support.**

JSONOTE is a high-performance, developer-centric note-taking app that treats your notes as first-class JSON data. Synchronize seamlessly with GitHub, manage complex hierarchies like Notion, and leverage AI through MCP (Model Context Protocol).

---

## 🚀 Key Features

### 1. GitHub Native Synchronization
- Your notes are stored as `.json` files in your private GitHub repository.
- Full version control through Git.
- Real-time sync with retry logic for conflict resolution.

### 2. Notion-Inspired Workspace
- **Infinite Hierarchy**: Nest pages within pages to build a comprehensive knowledge base.
- **Database Views**: Switching between **List**, **Table**, and **Board** views.
- **Custom Properties**: Add metadata fields (Text, Number, Date) to any note.

### 3. MCP (Model Context Protocol) Integration
- Connect to external AI tools (Notion MCP, GitHub MCP, etc.).
- Call AI tools directly within the editor to process your note content.
- Server-side proxy implementation to bypass browser CORS limits.

### 4. Developer-Friendly UI
- **Glassmorphism Design**: Premium obsidian-dark aesthetic.
- **Nanum Gothic Typography**: Clean and professional local font rendering.
- **Markdown Support**: Syntax highlighting and easy formatting tools.

---

## 🛠️ Quick Start

### Installation
```bash
npm install
npm run dev
```

### Configuration
1. Go to **Settings** in the app.
2. Enter your **GitHub Personal Access Token** (Fine-grained or Classic).
3. Specify your `Owner`, `Repo`, and `Branch`.
4. Your notes will automatically sync upon saving.

---

## 📝 Documentations

- [Getting Started Guide](./docs/GUIDE.md) | [한국어](./docs/GUIDE_ko.md)
- [MCP Setup Guide](./docs/MCP_SETUP.md) | [한국어](./docs/MCP_SETUP_ko.md)
- [Security & Privacy](./docs/SECURITY.md) | [한국어](./docs/SECURITY_ko.md)

---

## ⚖️ License
Copyright (c) 2026 JSONOTE Team. All rights reserved.
