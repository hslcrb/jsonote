# JSONOTE (v1.0.5)

<p align="center">
  <img src="public/logo.svg" alt="JSONOTE Logo" width="400">
</p>

[![Korean](https://i.namu.wiki/i/sWPT7gp9y6RDK_9IVVHmBDwc-JIlzbRbxyS_Jy2TUAFm3O97u34B3Y-vJXWbGOAS0aXzDXDLsRP5PffCMB5hdKdrLLZ_TZZlA3WdKP_xgmtX_QZaLZNuMc7tHM1CZBjBGrtlF7numCKhlOQFRN7IaA.svg)](./README_ko.md) [![Japanese](https://i.namu.wiki/i/-6zD4tIyEplQ_Q44rBjydwhDQ1pOaig6biAKN_MiK01bU7T0_4iZg5IVcNyOzzUolTyLp8aAFKrjJhqutcQx74i37kT2DzzsROquAUrnNy7VFmpFuQTccFJT552leCkTpg9LDJgd2xNwWOv5NYZ15g.svg)](./README_ja.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://github.com/hslcrb/jsonote/actions/workflows/auto-cd.yml/badge.svg)](https://github.com/hslcrb/jsonote/actions)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/hslcrb/jsonote/releases/latest)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-blue)](https://github.com/hslcrb/jsonote/pkgs/container/jsonote)

> **The Ultimate JSON-based Note-taking Application with GitHub Integration & MCP Support.**

**Official First Release: Monday, January 19, 2026 (KST)**

---

## 🛠️ Installation & Setup (v1.0.5)

### 1. 💻 Desktop App (Windows, macOS, Linux) - **Recommended**
The fastest and most stable way to use JSONOTE as a native application. Download from our [Releases Page](../../releases).
- **Windows**: `JSONOTE-Setup-1.0.5.exe` (Installer) or `.zip` (Portable)
- **macOS**: `JSONOTE-1.0.5.dmg` (Universal Intel/Apple Silicon) or `.zip`
- **Linux**: `JSONOTE-1.0.5.AppImage` (Universal Package) or `.tar.gz`

### 2. 🐳 Docker (Containerized Deployment)
Perfect for hosting your own instance or running instantly:
```bash
# Pull and Run
docker pull ghcr.io/hslcrb/jsonote:latest
docker run -d -p 3000:3000 --name jsonote-instance ghcr.io/hslcrb/jsonote:latest
```
Visit `http://localhost:3000` to start.

### 3. 🏗️ Developer Quick Start (Native Build)
Requires Node.js **v20.9.0** or higher.
```bash
# 1. Clone
git clone https://github.com/hslcrb/jsonote.git
cd jsonote

# 2. Setup
npm install

# 3. Execution (Choose one)
npm run dev          # Start Web Development Server
npm run electron:dev # Start Electron Desktop in Dev Mode

# 4. Production Build
npm run build
npm run start
```

---

## 🚀 Key Features

### 1. Universal Storage Synchronization
- **GitHub Native**: Store notes as `.json` in your private repo.
- **Local / Browser**: High-performance local folder storage (Desktop) and seamless browser storage (Web).
- Real-time sync with visual feedback.

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
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
