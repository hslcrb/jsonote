import { Octokit } from 'octokit';
import { Note, GitHubConfig } from '@/types/note';

export class GitHubStorage {
    private octokit: Octokit;
    private config: GitHubConfig;

    constructor(config: GitHubConfig) {
        this.config = config;
        this.octokit = new Octokit({ auth: config.token });
    }

    async fetchNotes(): Promise<Note[]> {
        try {
            const { data } = await this.octokit.rest.repos.getContent({
                owner: this.config.owner,
                repo: this.config.repo,
                path: 'notes',
                ref: this.config.branch
            });

            if (Array.isArray(data)) {
                const noteFiles = data.filter(file => file.name.endsWith('.json'));
                const notes = await Promise.all(noteFiles.map(file => this.fetchNoteByPath(file.path)));
                return notes;
            }
            return [];
        } catch (error) {
            console.error('Error fetching notes from GitHub:', error);
            return [];
        }
    }

    async fetchNoteByPath(path: string): Promise<Note> {
        const { data }: any = await this.octokit.rest.repos.getContent({
            owner: this.config.owner,
            repo: this.config.repo,
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
                owner: this.config.owner,
                repo: this.config.repo,
                path,
                ref: this.config.branch
            });
            sha = data.sha;
        } catch (e) {
            // File doesn't exist yet
        }

        await this.octokit.rest.repos.createOrUpdateFileContents({
            owner: this.config.owner,
            repo: this.config.repo,
            path,
            message: `jsonote: ${sha ? 'Update' : 'Create'} ${note.metadata.title}`,
            content: Buffer.from(content).toString('base64'),
            sha,
            branch: this.config.branch
        });
    }
}
