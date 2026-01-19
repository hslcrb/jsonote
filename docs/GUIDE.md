# User Guide

[![Korean](./GUIDE_ko.md)](./GUIDE_ko.md)
[![Version](https://img.shields.io/badge/Version-v1.0-green)](https://github.com/hslcrb/jsonote/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This guide covers the fundamental operations and advanced features of JSONOTE.

## 1. Document Structure
Each note in JSONOTE consists of:
- **Metadata**: Title, Type, Tags, Parent ID, and Custom Properties.
- **Content**: Pure Markdown text.
- **File**: Saved as a JSON object on GitHub.

## 2. Hierarchical Organization
To create a sub-page:
1. Open any note.
2. In the Sidebar, locate the **Parent Page** dropdown.
3. Select the page you want to nest the current note under.
4. The Sidebar tree will update instantly.

## 3. Database Views
You can toggle views at the top of the main container:
- **List View**: Classic vertical list with previews.
- **Table View**: Compact, grid-based view showing properties.
- **Board View**: Kanban-style categorization by Note Type.

## 4. Custom Properties
Click **+ Add** in the Properties section of the editor to add key-value pairs. These are stored in the JSON metadata and are visible in the Table view.

## 5. Connection Diagnosis
If your notes aren't saving, go to **Settings** and click **Test Connection**. This built-in tool performs:
1. **Authentication Check**: Verifies if your token is valid.
2. **Repository Check**: Verifies if the target repo exists.
3. **Write Test**: Attempts a temporary file creation to ensure you have push permissions.
Any errors will be displayed in a detailed log.

---
Copyright 2008-2026 Rheehose (Rhee Creative).
