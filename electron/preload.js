
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectDirectory: () => ipcRenderer.invoke('local-storage:select-directory'),
    readNotes: (path) => ipcRenderer.invoke('local-storage:read-notes', path),
    saveNote: (path, fileName, content) => ipcRenderer.invoke('local-storage:save-note', path, fileName, content),
    deleteNote: (path, fileName) => ipcRenderer.invoke('local-storage:delete-note', path, fileName),
    getDefaultPath: () => ipcRenderer.invoke('local-storage:get-default-path'),
    isElectron: true
});
