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
    content: string;
    data?: any;
}

// Storage Provider Types
export type StorageProvider = 'github' | 'gitlab' | 'gitea' | 's3' | 'webdav' | 'local';

export interface StorageConfig {
    provider: StorageProvider;
    enabled: boolean;
    // Common fields
    url?: string;
    token?: string;
    owner?: string;
    repo?: string;
    branch?: string;
    // S3 specific
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    region?: string;
    endpoint?: string;
    // WebDAV / Custom specific
    username?: string;
    password?: string;
    path?: string;
}
