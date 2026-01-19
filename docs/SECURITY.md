# Security & Privacy

[![Korean](./SECURITY_ko.md)](./SECURITY_ko.md)
[![Version](https://img.shields.io/badge/Version-v1.0-green)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 1. Token Safety
Your GitHub Personal Access Token is stored in your browser's `localStorage`. It is never sent to our servers. All GitHub API calls are made directly from your browser to GitHub (Client-side) or through your private proxy if configured.

## 2. Local Font Serving
This application serves all fonts locally to prevent external tracking and ensure offline availability.

## 3. Private Data
JSONOTE does not have a backend database for notes. Everything is stored in **your** GitHub repository.

---
Copyright (c) 2026 JSONOTE Team.
