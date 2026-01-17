# JSONOTE (v0.1.0)

[![Korean](https://img.shields.io/badge/Language-Korean-red)](./README_ko.md)

> **The Ultimate JSON-based Note-taking Application with GitHub Integration & MCP Support.**

⚠️ **Status: Under Active Development**  
This project is currently in the early stages of development. The first official release has not yet been published. Expect frequent updates and potential breaking changes.

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

Explore more about JSONOTE through our detailed documentation:

- 📘 **[Getting Started Guide](./docs/GUIDE.md)** ([Korean](./docs/GUIDE_ko.md)): Learn the basics.
- ⚙️ **[MCP Setup Guide](./docs/MCP_SETUP.md)** ([Korean](./docs/MCP_SETUP_ko.md)): Configure AI tools.
- 🛡️ **[Security & Privacy](./docs/SECURITY.md)** ([Korean](./docs/SECURITY_ko.md)): How we handle your data.
- 🤝 **[Contributing Guide](./CONTRIBUTING.md)** ([Korean](./CONTRIBUTING_ko.md)): Help us improve JSONOTE.

---

## ⚖️ License
Copyright (c) 2026 JSONOTE Team. All rights reserved.
