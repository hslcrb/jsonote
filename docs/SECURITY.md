# Security & Privacy

[![Korean](https://i.namu.wiki/i/sWPT7gp9y6RDK_9IVVHmBDwc-JIlzbRbxyS_Jy2TUAFm3O97u34B3Y-vJXWbGOAS0aXzDXDLsRP5PffCMB5hdKdrLLZ_TZZlA3WdKP_xgmtX_QZaLZNuMc7tHM1CZBjBGrtlF7numCKhlOQFRN7IaA.svg)](./SECURITY_ko.md) [![Japanese](https://i.namu.wiki/i/-6zD4tIyEplQ_Q44rBjydwhDQ1pOaig6biAKN_MiK01bU7T0_4iZg5IVcNyOzzUolTyLp8aAFKrjJhqutcQx74i37kT2DzzsROquAUrnNy7VFmpFuQTccFJT552leCkTpg9LDJgd2xNwWOv5NYZ15g.svg)](./SECURITY_ja.md)
[![Version](https://img.shields.io/github/v/release/hslcrb/jsonote?color=green&label=Version)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 1. Token Safety
Your GitHub Personal Access Token is stored in your browser's `localStorage`. It is never sent to our servers. All GitHub API calls are made directly from your browser to GitHub (Client-side) or through your private proxy if configured.

## 2. Local Font Serving
This application serves all fonts locally to prevent external tracking and ensure offline availability.

## 3. Private Data
JSONOTE does not have a backend database for notes. Everything is stored in **your** GitHub repository.

---
Copyright 2008-2026 Rheehose (Rhee Creative).
