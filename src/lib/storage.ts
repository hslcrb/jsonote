import { Octokit } from 'octokit';
import { Note, StorageConfig } from '@/types/note';

export interface IJsonoteStorage {
    fetchNotes(): Promise<Note[]>;
    saveNote(note: Note): Promise<void>;
    deleteNote(note: Note): Promise<void>;
}

export class GitHubStorage implements IJsonoteStorage {
    private octokit: Octokit;
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
        this.octokit = new Octokit({ auth: config.token });
    }

    async fetchNotes(): Promise<Note[]> {
        try {
            const { data } = await this.octokit.rest.repos.getContent({
                owner: this.config.owner!,
                repo: this.config.repo!,
                path: 'notes',
                ref: this.config.branch
            });

            if (!Array.isArray(data)) return [];

            const notes = await Promise.all(
                data
                    .filter(file => file.name.endsWith('.json'))
                    .map(async file => {
                        const content = await this.fetchNoteByPath(file.path);
                        if (content) {
                            // Store current filename for detecting changes / 현재 파일명을 저장해두어 추후 변경 감지에 사용
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
            return [];
        }
    }

    private async fetchNoteByPath(path: string): Promise<Note | null> {
        try {
            const { data }: any = await this.octokit.rest.repos.getContent({
                owner: this.config.owner!,
                repo: this.config.repo!,
                path,
                ref: this.config.branch
            });

            // Browser-compatible Base64 decode (handles UTF-8)
            const content = decodeURIComponent(escape(window.atob(data.content.replace(/\n/g, ''))));
            return JSON.parse(content);
        } catch (e) {
            return null;
        }
    }

    async saveNote(note: Note): Promise<void> {
        const baseName = note.metadata.customFilename || note.metadata.id;
        const encodedPath = `notes/${encodeURIComponent(baseName)}.json`;
        const content = JSON.stringify(note, null, 2);

        // Delete old file if filename has changed / 파일명이 변경된 경우 기존 파일 삭제
        if (note.metadata.previousFilename && note.metadata.previousFilename !== baseName) {
            try {
                const oldPath = `notes/${encodeURIComponent(note.metadata.previousFilename)}.json`;
                const { data: oldData }: any = await this.octokit.rest.repos.getContent({
                    owner: this.config.owner!,
                    repo: this.config.repo!,
                    path: oldPath,
                    ref: this.config.branch
                });

                await this.octokit.rest.repos.deleteFile({
                    owner: this.config.owner!,
                    repo: this.config.repo!,
                    path: oldPath,
                    message: `Rename note: ${note.metadata.previousFilename} -> ${baseName}`,
                    sha: oldData.sha,
                    branch: this.config.branch
                });
            } catch (e) {
                console.warn('Old file deletion failed (maybe already deleted):', e);
            }
        }

        // Retry logic for SHA conflicts (max 5) / SHA 충돌 시 재시도 로직 (최대 5회)
        let retries = 0;
        const maxRetries = 5;

        while (retries < maxRetries) {
            try {
                let sha: string | undefined;
                try {
                    // List directory to find SHA without downloading content (Fixes >1MB issue)
                    const { data } = await this.octokit.rest.repos.getContent({
                        owner: this.config.owner!,
                        repo: this.config.repo!,
                        path: 'notes',
                        ref: this.config.branch,
                        headers: {
                            'If-None-Match': '',
                            'Cache-Control': 'no-cache'
                        }
                    });

                    if (Array.isArray(data)) {
                        const targetName = `${baseName}.json`; // GitHub returns decoded name
                        const targetFile = data.find((f: any) => f.name === targetName || f.path === encodedPath);
                        if (targetFile) {
                            sha = targetFile.sha;
                        }
                    }
                } catch (e) {
                    // Folder doesn't exist or empty, proceed as new file
                }

                await this.octokit.rest.repos.createOrUpdateFileContents({
                    owner: this.config.owner!,
                    repo: this.config.repo!,
                    path: encodedPath,
                    message: `Update note: ${note.metadata.title}`,
                    // Browser-compatible Base64 encode (handles UTF-8)
                    content: window.btoa(unescape(encodeURIComponent(content))),
                    branch: this.config.branch,
                    sha
                });

                // 저장이 성공하면 previousFilename 업데이트 후 리턴
                note.metadata.previousFilename = baseName;
                return;
            } catch (error: any) {
                // Retry on SHA mismatch error / SHA 불일치 에러인 경우 재시도
                if (error.message && error.message.includes('does not match')) {
                    retries++;
                    console.warn(`SHA conflict, retrying... (${retries}/${maxRetries})`);
                    // Wait before retry with random jitter to avoid lockstep / 랜덤 지연시간 추가
                    const delay = 500 * retries + Math.random() * 500;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                // Other errors throw immediately / 다른 에러는 바로 throw
                throw error;
            }
        }

        // Max retries exceeded / 최대 재시도 횟수 초과
        throw new Error('Failed to save note after multiple retries due to SHA conflicts');
    }

    async deleteNote(note: Note): Promise<void> {
        const baseName = note.metadata.customFilename || note.metadata.id;
        const encodedPath = `notes/${encodeURIComponent(baseName)}.json`;

        try {
            // Get SHA from directory listing to handle large files
            let sha = '';
            try {
                const { data } = await this.octokit.rest.repos.getContent({
                    owner: this.config.owner!,
                    repo: this.config.repo!,
                    path: 'notes',
                    ref: this.config.branch,
                    headers: { 'Cache-Control': 'no-cache' }
                });

                if (Array.isArray(data)) {
                    const targetName = `${baseName}.json`; // GitHub returns decoded name
                    const targetFile = data.find((f: any) => f.name === targetName || f.path === encodedPath);
                    if (targetFile) {
                        sha = targetFile.sha;
                    }
                }
            } catch (dirErr) {
                // If dir list fails, we likely can't delete anyway, but let's try fallback or throw
            }

            if (!sha) {
                // Try fallback to direct get if dir list failed or file not found (though direct get fails on large files)
                // If we don't have SHA, delete will fail.
                const { data }: any = await this.octokit.rest.repos.getContent({
                    owner: this.config.owner!,
                    repo: this.config.repo!,
                    path: encodedPath,
                    ref: this.config.branch
                });
                sha = data.sha;
            }

            await this.octokit.rest.repos.deleteFile({
                owner: this.config.owner!,
                repo: this.config.repo!,
                path: encodedPath,
                message: `Delete note: ${note.metadata.title}`,
                sha: sha,
                branch: this.config.branch
            });
        } catch (e: any) {
            console.error('GitHub delete failed:', e);
            throw e;
        }
    }
}

// Placeholder for GitLab (using fetch matches similar pattern)
export class GitLabStorage implements IJsonoteStorage {
    constructor(private config: StorageConfig) { }
    async fetchNotes(): Promise<Note[]> {
        console.warn('GitLab Storage not fully implemented yet');
        return [];
    }
    async saveNote(note: Note): Promise<void> {
        console.warn('GitLab Storage not fully implemented yet');
    }
    async deleteNote(note: Note): Promise<void> {
        console.warn('GitLab Storage not fully implemented yet');
    }
}

// Placeholder for S3 / Cloud Storage
export class S3Storage implements IJsonoteStorage {
    constructor(private config: StorageConfig) { }
    async fetchNotes(): Promise<Note[]> {
        console.warn('S3 Storage not fully implemented yet');
        return [];
    }
    async saveNote(note: Note): Promise<void> {
        console.warn('S3 Storage not fully implemented yet');
    }
    async deleteNote(note: Note): Promise<void> {
        console.warn('S3 Storage not fully implemented yet');
    }
}

// Factory to get storage / 저장소 객체 생성을 위한 팩토리
export function getStorage(config: StorageConfig): IJsonoteStorage | null {
    if (!config.enabled) return null;
    switch (config.provider) {
        case 'github': return new GitHubStorage(config);
        case 'gitlab': return new GitLabStorage(config);
        case 's3': return new S3Storage(config);
        default: return null;
    }
}
