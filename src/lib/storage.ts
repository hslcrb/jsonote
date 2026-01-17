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
        const { data }: any = await this.octokit.rest.repos.getContent({
            owner: this.config.owner!,
            repo: this.config.repo!,
            path,
            ref: this.config.branch
        });

        const content = Buffer.from(data.content, 'base64').toString();
        return JSON.parse(content);
    }

    async saveNote(note: Note): Promise<void> {
        const path = `notes/${note.metadata.id}.json`;
        const content = JSON.stringify(note, null, 2);

        let sha: string | undefined;
        try {
            const { data }: any = await this.octokit.rest.repos.getContent({
                owner: this.config.owner!,
                repo: this.config.repo!,
                path,
                ref: this.config.branch
            });
            sha = data.sha;
        } catch (e) { }

        await this.octokit.rest.repos.createOrUpdateFileContents({
            owner: this.config.owner!,
            repo: this.config.repo!,
            path,
            message: `Update note: ${note.metadata.title}`,
            content: Buffer.from(content).toString('base64'),
            branch: this.config.branch,
            sha
        });
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
