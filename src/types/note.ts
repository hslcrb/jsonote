export type NoteType = 'general' | 'task' | 'meeting' | 'journal' | 'code';

export interface NoteMetadata {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    type: NoteType;
    tags: string[];
    repository?: string;
}

export interface Note {
    metadata: NoteMetadata;
    content: string; // Free text area
    data?: Record<string, any>; // Structured data specific to type
}

export interface GitHubConfig {
    token: string;
    owner: string;
    repo: string;
    branch: string;
}
