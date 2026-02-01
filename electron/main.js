
const { app, BrowserWindow, protocol, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs').promises;

let mainWindow;
let nextServerProcess;
const PORT = 3000;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hidden', // Make it look like a native app with custom titlebar if possible
        titleBarOverlay: {
            color: '#1a1a1a',
            symbolColor: '#ffffff'
        },
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#1a1a1a', // Obsidian dark match
        icon: path.join(__dirname, '../public/icon.png') // Assumption, we'll verify this
    });

    // Load the Next.js app
    if (app.isPackaged) {
        // In production, we run the standalone server
        loadProduction();
    } else {
        // In dev, we just load localhost
        mainWindow.loadURL(`http://localhost:${PORT}`);
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

async function loadProduction() {
    // Path to the Next.js standalone server in the bundled resources
    const serverPath = path.join(process.resourcesPath, '.next/standalone/server.js');

    // Need to set proper environment variables
    const env = Object.assign({}, process.env, {
        NODE_ENV: 'production',
        PORT: PORT
    });

    // Check if server file exists
    // In typical electron-builder 'extraResources', it might be in a specific folder
    // For 'standalone' output, we need to make sure node_modules are included or standalone is fully self-contained.
    // Next.js standalone still needs 'node_modules' from the standalone folder.

    // Simpler approach for local server in Electron:
    // We assume the build process placed the standalone folder in 'resources/app.asar.unpacked' or similar,
    // OR we just spawn it if it's external.

    // Strategy: We will configure electron-builder to copy the standalone folder to 'resources/standalone'
    const standaloneDir = path.join(process.resourcesPath, 'standalone');
    const scriptPath = path.join(standaloneDir, 'server.js');

    console.log('Starting Next.js server from:', scriptPath);

    nextServerProcess = spawn('node', [scriptPath], {
        cwd: standaloneDir,
        env,
        stdio: 'inherit' // Pipe output to Electron's main process
    });

    // Wait for server to become available
    const waitForServer = async (retries = 30) => {
        return new Promise((resolve, reject) => {
            const check = setInterval(() => {
                http.get(`http://localhost:${PORT}`, (res) => {
                    clearInterval(check);
                    resolve();
                }).on('error', (err) => {
                    // Keep waiting
                    if (retries-- <= 0) {
                        clearInterval(check);
                        reject(err);
                    }
                });
            }, 500);
        });
    };

    try {
        await waitForServer();
        mainWindow.loadURL(`http://localhost:${PORT}`);
    } catch (err) {
        console.error('Failed to connect to Next.js server:', err);
        // Fallback or error display
    }
}


// Local Storage Handlers
ipcMain.handle('local-storage:select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

ipcMain.handle('local-storage:read-notes', async (event, dirPath) => {
    try {
        if (!dirPath) return [];
        await fs.mkdir(dirPath, { recursive: true });
        const files = await fs.readdir(dirPath);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const notes = [];
        for (const file of jsonFiles) {
            try {
                const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
                const note = JSON.parse(content);
                const baseName = file.replace('.json', '');
                note.metadata.customFilename = decodeURIComponent(baseName);
                note.metadata.previousFilename = decodeURIComponent(baseName);
                notes.push(note);
            } catch (e) {
                console.error(`Failed to read/parse ${file}:`, e);
            }
        }
        return notes;
    } catch (e) {
        console.error('Failed to read notes directory:', e);
        return [];
    }
});

ipcMain.handle('local-storage:save-note', async (event, dirPath, fileName, content) => {
    try {
        if (!dirPath) throw new Error('No directory path provided');
        await fs.mkdir(dirPath, { recursive: true });
        const filePath = path.join(dirPath, fileName);
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
    } catch (e) {
        console.error('Failed to save note:', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('local-storage:delete-note', async (event, dirPath, fileName) => {
    try {
        if (!dirPath) throw new Error('No directory path provided');
        const filePath = path.join(dirPath, fileName);
        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
        } catch (e) { }
        return { success: true };
    } catch (e) {
        console.error('Failed to delete note:', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('local-storage:get-default-path', () => {
    return path.join(app.getPath('documents'), 'jsonote');
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    // Kill child process
    if (nextServerProcess) {
        nextServerProcess.kill();
    }
});

app.on('before-quit', () => {
    if (nextServerProcess) {
        nextServerProcess.kill();
    }
});
