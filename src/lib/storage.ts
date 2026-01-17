import { Octokit } from 'octokit';
import { Note, StorageConfig } from '@/types/note';

export interface IJsonoteStorage {
    fetchNotes(): Promise<Note[]>;
    saveNote(note: Note): Promise<void>;
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
                            // 현재 파일명을 저장해두어 추후 변경 감지에 사용
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

            const content = Buffer.from(data.content, 'base64').toString();
            return JSON.parse(content);
        } catch (e) {
            return null;
        }
    }

    async saveNote(note: Note): Promise<void> {
        const baseName = note.metadata.customFilename || note.metadata.id;
        const encodedPath = `notes/${encodeURIComponent(baseName)}.json`;
        const content = JSON.stringify(note, null, 2);

        // 파일명이 변경된 경우 기존 파일 삭제
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

        let sha: string | undefined;
        try {
            const { data }: any = await this.octokit.rest.repos.getContent({
                owner: this.config.owner!,
                repo: this.config.repo!,
                path: encodedPath,
                ref: this.config.branch
            });
            sha = data.sha;
        } catch (e) { }

        await this.octokit.rest.repos.createOrUpdateFileContents({
            owner: this.config.owner!,
            repo: this.config.repo!,
            path: encodedPath,
            message: `Update note: ${note.metadata.title}`,
            content: Buffer.from(content).toString('base64'),
            branch: this.config.branch,
            sha
        });

        // 저장이 성공하면 현재 파일명을 previousFilename으로 업데이트
        note.metadata.previousFilename = baseName;
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
}

// Factory to get storage
export function getStorage(config: StorageConfig): IJsonoteStorage | null {
    if (!config.enabled) return null;
    switch (config.provider) {
        case 'github': return new GitHubStorage(config);
        case 'gitlab': return new GitLabStorage(config);
        case 's3': return new S3Storage(config);
        default: return null;
    }
}
