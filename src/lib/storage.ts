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
        }
    }
}

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
        if (!this.config.path || typeof window === 'undefined' || !window.electron) return [];
        try {
            const notes = await window.electron.readNotes(this.config.path);
            return notes.map(n => {
                const baseName = n.metadata.customFilename || n.metadata.id;
                n.metadata.previousFilename = baseName;
                return n;
            });
        } catch (e) {
            console.error('Local fetch failed:', e);
            return [];
        }
    }

    async saveNote(note: Note): Promise<void> {
        if (!this.config.path || typeof window === 'undefined' || !window.electron) return;
        const baseName = note.metadata.customFilename || note.metadata.id;
        const fileName = `${encodeURIComponent(baseName)}.json`;

        // Handle rename
        if (note.metadata.previousFilename && note.metadata.previousFilename !== baseName) {
            try {
                await window.electron.deleteNote(this.config.path, `${encodeURIComponent(note.metadata.previousFilename)}.json`);
            } catch (e) {
                console.warn('Old file deletion failed (non-fatal):', e);
            }
        }

        const result = await window.electron.saveNote(this.config.path, fileName, JSON.stringify(note, null, 2));
        if (!result.success) {
            throw new Error(result.error || 'Failed to save locally');
        }
        note.metadata.previousFilename = baseName;
    }

    async deleteNote(note: Note): Promise<void> {
        if (!this.config.path || typeof window === 'undefined' || !window.electron) return;
        const baseName = note.metadata.customFilename || note.metadata.id;
        await window.electron.deleteNote(this.config.path, `${encodeURIComponent(baseName)}.json`);
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
