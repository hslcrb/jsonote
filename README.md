# JSONOTE (v1.0)

[![Korean](https://img.shields.io/badge/Language-Korean-red)](./README_ko.md)
[![Version](https://img.shields.io/badge/Version-v1.0-green)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://github.com/hslcrb/jsonote/actions/workflows/desktop-release.yml/badge.svg)](https://github.com/hslcrb/jsonote/actions)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/hslcrb/jsonote/releases/latest)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-blue)](https://github.com/hslcrb/jsonote/pkgs/container/jsonote)

> **The Ultimate JSON-based Note-taking Application with GitHub Integration & MCP Support.**

**Official First Release: Monday, January 19, 2026 (KST)**

---

## 🛠️ Installation & Setup (How to Start)

### 1. 💻 Desktop App (Windows, Mac, Linux) - **Recommended**
Download the official standalone client from our [Releases Page](../../releases).
- **Windows**: `JSONOTE-Setup-1.0.exe` (Installer) or `.zip` (Portable)
- **Mac**: `JSONOTE-1.0.dmg` (Installer) or `.zip` (App Bundle)
- **Linux**: `JSONOTE-1.0.AppImage` (Executable) or `.zip`

### 2. 🐳 Docker (GitHub Container Registry)
Run the application instantly using Docker:
```bash
docker pull ghcr.io/hslcrb/jsonote:latest
docker run -p 3000:3000 ghcr.io/hslcrb/jsonote:latest
```
Access the app at `http://localhost:3000`.

### 3. 🏗️ Build from Source (Developers)
Requires Node.js **v20.9.0** or higher.
```bash
git clone https://github.com/hslcrb/jsonote.git
cd jsonote
npm install
npm run build
npm run start
```

---

## 🚀 Key Features

### 1. GitHub Native Synchronization
- Your notes are stored as `.json` files in your private GitHub repository.
- Full version control through Git.
- Real-time sync with **visual feedback** (Saving... -> Saved!).

### 2. Notion-Inspired Workspace
- **Infinite Hierarchy**: Nest pages within pages to build a knowledge base.
- **Database Views**: Switch between **List**, **Table**, and **Board** views.
- **Custom Properties**: Add metadata fields (Text, Number, Date, etc.) to any note.

### 3. MCP (Model Context Protocol) Integration
- Connect to external AI tools (Notion, GitHub, etc.) directly within the editor.

### 4. Developer-Friendly UI
- **Glassmorphism Design**: Premium obsidian-dark aesthetic.
- **Markdown Support**: Syntax highlighting, standard URL images, and easy formatting.

---

## ⚙️ Post-Installation Setup
1. Open **Settings** in the app.
2. Enter your **GitHub Personal Access Token** (Repo permissions required).
3. Specify your `Owner`, `Repo`, and `Branch`.
4. Click **Test Connection (연결 진단)** to verify.
5. Everything is ready! Your notes will sync automatically.

---

## 📝 Documentations
- 📘 [Getting Started Guide](./docs/GUIDE.md)
- ⚙️ [MCP Setup Guide](./docs/MCP_SETUP.md)
- 🛡️ [Security & Privacy](./docs/SECURITY.md)
- 🤝 [Contributing Guide](./CONTRIBUTING.md)

---

## ⚖️ License
Licensed under the **Apache License 2.0**.
Copyright (c) 2026 JSONOTE Team. All rights reserved.
