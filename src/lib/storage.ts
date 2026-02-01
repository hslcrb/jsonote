import { Note, StorageConfig } from '@/types/note';

declare global {
    interface Window {
        electron?: {
            selectDirectory(): Promise<string | null>;
            readNotes(path: string): Promise<Note[]>;
            saveNote(path: string, fileName: string, content: string): Promise<{ success: boolean; error?: string }>;
            deleteNote(path: string, fileName: string): Promise<{ success: boolean; error?: string }>;
            getDefaultPath(): Promise<string>;
            isElectron: boolean;
        };
        showDirectoryPicker?: (options?: any) => Promise<FileSystemDirectoryHandle>;
    }
}

// Singleton for Web File System Access API handle
let webDirectoryHandle: FileSystemDirectoryHandle | null = null;
export function getWebDirectoryHandle() { return webDirectoryHandle; }
export function setWebDirectoryHandle(handle: FileSystemDirectoryHandle | null) { webDirectoryHandle = handle; }

export interface IJsonoteStorage {
    fetchNotes(): Promise<Note[]>;
    saveNote(note: Note): Promise<void>;
    deleteNote(note: Note): Promise<void>;
}

export class GitHubStorage implements IJsonoteStorage {
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-github-token': this.config.token || '',
            'x-github-owner': this.config.owner || '',
            'x-github-repo': this.config.repo || '',
            'x-github-branch': this.config.branch || 'main'
        };
    }

    async fetchNotes(): Promise<Note[]> {
        try {
            // 1. Get List
            const params = new URLSearchParams({ path: 'notes' });
            const res = await fetch(`/api/github/sync?${params}`, {
                headers: this.getHeaders()
            });

            if (!res.ok) throw new Error(`Fetch list failed: ${res.statusText}`);
            const files: any[] = await res.json();

            if (!Array.isArray(files)) return [];

            // 2. Get Details (Parallel)
            const notes = await Promise.all(
                files
                    .filter(file => file.name.endsWith('.json'))
                    .map(async file => {
                        const content = await this.fetchNoteByPath(file.path);
                        if (content) {
                            const fileNameWithoutExt = decodeURIComponent(file.name.replace('.json', ''));
                            content.metadata.customFilename = fileNameWithoutExt;
                            content.metadata.previousFilename = fileNameWithoutExt;
                        }
                        return content;
                    })
            );

            return notes.filter((n): n is Note => n !== null);
        } catch (error) {
            console.error('GitHub fetch failed:', error);
            // Return empty array to avoid app crash
            return [];
        }
    }

    private async fetchNoteByPath(path: string): Promise<Note | null> {
        try {
            const params = new URLSearchParams({ path });
            const res = await fetch(`/api/github/sync?${params}`, {
                headers: this.getHeaders()
            });

            if (!res.ok) return null;

            const data = await res.json();
            if (!data || !data.content) return null;

            return JSON.parse(data.content);
        } catch (e) {
            console.warn(`Failed to parse note: ${path}`, e);
            return null;
        }
    }

    async saveNote(note: Note): Promise<void> {
        const baseName = note.metadata.customFilename || note.metadata.id;
        const notePath = `notes/${encodeURIComponent(baseName)}.json`;
        const content = JSON.stringify(note, null, 2);

        // 1. Handle Rename (Delete old file if exists)
        if (note.metadata.previousFilename && note.metadata.previousFilename !== baseName) {
            try {
                const oldPath = `notes/${encodeURIComponent(note.metadata.previousFilename)}.json`;
                await this.deleteFile(oldPath, `Rename: ${note.metadata.previousFilename} -> ${baseName}`);
            } catch (e) {
                console.warn('Old file deletion failed during rename (non-fatal):', e);
            }
        }

        // 2. Save (Update/Create) with Retry Logic
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                // Call API
                const res = await fetch('/api/github/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: this.config.token,
                        owner: this.config.owner,
                        repo: this.config.repo,
                        branch: this.config.branch || 'main',
                        path: notePath,
                        content: content,
                        message: `Update note: ${note.metadata.title}`
                    })
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || `Server error: ${res.status}`);
                }

                // Success
                note.metadata.previousFilename = baseName;
                return;
            } catch (error: any) {
                console.warn(`Save attempt ${retries + 1} failed:`, error.message);
                retries++;
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 500 * retries));
            }
        }

        throw new Error('Failed to save note after multiple retries.');
    }

    async deleteNote(note: Note): Promise<void> {
        const baseName = note.metadata.customFilename || note.metadata.id;
        const path = `notes/${encodeURIComponent(baseName)}.json`;
        await this.deleteFile(path, `Delete note: ${note.metadata.title}`);
    }

    private async deleteFile(path: string, message: string): Promise<void> {
        const res = await fetch('/api/github/sync', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: this.config.token,
                owner: this.config.owner,
                repo: this.config.repo,
                branch: this.config.branch || 'main',
                path: path,
                message: message
            })
        });

        if (!res.ok) {
            // Ignore 404 (already deleted) implicitly handled by API returning success?
            // Actually API likely returns success for 404 in delete logic as implemented previously.
            // But let's check response.
            const data = await res.json();
            if (data && data.message === 'Already deleted') return;

            throw new Error(`Delete failed: ${res.statusText}`);
        }
    }
}

export class LocalStorage implements IJsonoteStorage {
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
    }

    async fetchNotes(): Promise<Note[]> {
        // 1. Electron Native FS
        if (typeof window !== 'undefined' && window.electron && this.config.path) {
            try {
                const notes = await window.electron.readNotes(this.config.path);
                return notes.map(n => {
                    const baseName = n.metadata.customFilename || n.metadata.id;
                    n.metadata.previousFilename = baseName;
                    return n;
                });
            } catch (e) {
                console.error('Electron native fetch failed:', e);
            }
        }

        // 2. Web File System Access API
        if (typeof window !== 'undefined' && !window.electron && webDirectoryHandle) {
            try {
                const notes: Note[] = [];
                // Check if we still have permission
                const status = await (webDirectoryHandle as any).queryPermission({ mode: 'readwrite' });
                if (status !== 'granted') return [];

                for await (const entry of (webDirectoryHandle as any).values()) {
                    if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                        const file = await entry.getFile();
                        const content = await file.text();
                        try {
                            const note = JSON.parse(content);
                            const baseName = note.metadata.customFilename || note.metadata.id;
                            note.metadata.previousFilename = baseName;
                            notes.push(note);
                        } catch (e) {
                            console.warn(`Failed to parse ${entry.name}`, e);
                        }
                    }
                }
                return notes;
            } catch (e) {
                console.error('Web FSA API fetch failed:', e);
            }
        }

        // 3. Fallback: Browser LocalStorage (Legacy / Pure Web)
        if (typeof window !== 'undefined' && !window.electron) {
            const saved = localStorage.getItem('jsonote_web_storage_notes');
            return saved ? JSON.parse(saved) : [];
        }

        return [];
    }

    async saveNote(note: Note): Promise<void> {
        const baseName = note.metadata.customFilename || note.metadata.id;
        const fileName = `${encodeURIComponent(baseName)}.json`;

        // 1. Electron Native
        if (typeof window !== 'undefined' && window.electron && this.config.path) {
            // Handle rename
            if (note.metadata.previousFilename && note.metadata.previousFilename !== baseName) {
                try {
                    await window.electron.deleteNote(this.config.path, `${encodeURIComponent(note.metadata.previousFilename)}.json`);
                } catch (e) { }
            }

            const result = await window.electron.saveNote(this.config.path, fileName, JSON.stringify(note, null, 2));
            if (!result.success) throw new Error(result.error || 'Failed to save locally');
            note.metadata.previousFilename = baseName;
            return;
        }

        // 2. Web FSA API
        if (typeof window !== 'undefined' && !window.electron && webDirectoryHandle) {
            try {
                // Handle rename
                if (note.metadata.previousFilename && note.metadata.previousFilename !== baseName) {
                    try {
                        await webDirectoryHandle.removeEntry(`${encodeURIComponent(note.metadata.previousFilename)}.json`);
                    } catch (e) { }
                }

                const fileHandle = await webDirectoryHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(note, null, 2));
                await writable.close();
                note.metadata.previousFilename = baseName;
                return;
            } catch (e) {
                console.error('Web FSA API save failed:', e);
            }
        }

        // 3. Browser LocalStorage (Fallback)
        if (typeof window !== 'undefined' && !window.electron) {
            const saved = localStorage.getItem('jsonote_web_storage_notes');
            let notes: Note[] = saved ? JSON.parse(saved) : [];
            const index = notes.findIndex(n => n.metadata.id === note.metadata.id);
            if (index >= 0) notes[index] = note;
            else notes.push(note);
            localStorage.setItem('jsonote_web_storage_notes', JSON.stringify(notes));
        }
    }

    async deleteNote(note: Note): Promise<void> {
        const baseName = note.metadata.customFilename || note.metadata.id;
        const fileName = `${encodeURIComponent(baseName)}.json`;

        // 1. Electron Native
        if (typeof window !== 'undefined' && window.electron && this.config.path) {
            await window.electron.deleteNote(this.config.path, fileName);
            return;
        }

        // 2. Web FSA API
        if (typeof window !== 'undefined' && !window.electron && webDirectoryHandle) {
            try {
                await webDirectoryHandle.removeEntry(fileName);
                return;
            } catch (e) {
                console.error('Web FSA API delete failed:', e);
            }
        }

        // 3. Browser LocalStorage
        if (typeof window !== 'undefined' && !window.electron) {
            const saved = localStorage.getItem('jsonote_web_storage_notes');
            if (saved) {
                let notes: Note[] = JSON.parse(saved);
                notes = notes.filter(n => n.metadata.id !== note.metadata.id);
                localStorage.setItem('jsonote_web_storage_notes', JSON.stringify(notes));
            }
        }
    }
}

// ... Placeholders for other providers ...
export class GitLabStorage implements IJsonoteStorage {
    constructor(private config: StorageConfig) { }
    async fetchNotes(): Promise<Note[]> { return []; }
    async saveNote(note: Note): Promise<void> { }
    async deleteNote(note: Note): Promise<void> { }
}

export class S3Storage implements IJsonoteStorage {
    constructor(private config: StorageConfig) { }
    async fetchNotes(): Promise<Note[]> { return []; }
    async saveNote(note: Note): Promise<void> { }
    async deleteNote(note: Note): Promise<void> { }
}

export function getStorage(config: StorageConfig): IJsonoteStorage | null {
    if (!config.enabled) return null;
    switch (config.provider) {
        case 'github': return new GitHubStorage(config);
        case 'gitlab': return new GitLabStorage(config);
        case 's3': return new S3Storage(config);
        case 'local': return new LocalStorage(config);
        default: return null;
    }
}
