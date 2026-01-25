# Contributing to JSONOTE

[![Korean](./CONTRIBUTING_ko.md)](./CONTRIBUTING_ko.md)
[![Version](https://img.shields.io/badge/Version-v1.0-green)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Thank you for your interest in contributing to JSONOTE! As the project is in its early stages, your contributions are highly valuable.

## 🛠️ Development Environment
1. Node.js: **v20.9.0 or higher** (Required for Next.js 16).
2. Clone the repository.
3. Install dependencies: `npm install`.
4. Start the dev server: `npm run dev`.

## 📜 Contribution Rules
- **Code Quality**: Ensure your code follows the existing style and is properly linted.
- **Bilingual Comments**: All code comments should be written in both **English and Korean**.
- **Issue First**: Please open an issue to discuss major changes before submitting a Pull Request.

## 🚀 How to Submit
1. Fork the repo.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Commit your changes.
4. Push to the branch and open a Pull Request.


## 🚀 Deployment Process (Auto-CD)
We use a fully automated CI/CD pipeline enabled by GitHub Actions.
- **Just push to the `main` branch**.
- The system automatically:
  1. Bumps the **patch version** (e.g., v1.0.0 -> v1.0.1).
  2. Creates a **GitHub Release** tag.
  3. Builds and pushes the **Docker image** to GHCR.
  4. Builds and uploads **Desktop apps** (Windows .exe, macOS .dmg, Linux .AppImage).

Do not manually create tags or releases.

---
Copyright 2008-2026 Rheehose (Rhee Creative). All rights reserved.
