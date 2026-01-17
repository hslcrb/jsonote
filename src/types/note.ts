export type NoteType = 'general' | 'task' | 'meeting' | 'journal' | 'code' | 'database';

export interface PropertyValue {
    type: 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'relation' | 'formula';
    value: any;
}

export interface NoteMetadata {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    type: NoteType;
    tags: string[];
    repository?: string;
    customFilename?: string;
    previousFilename?: string;
    parentId?: string; // 무한 계층 구조를 위한 필드
    properties?: Record<string, PropertyValue>; // 데이터베이스 속성
    databaseConfig?: {
        viewType: 'list' | 'table' | 'board' | 'calendar' | 'gallery';
        columnOrder: string[];
        filters: any[];
        sorts: any[];
    };
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
    // MCP Configuration
    mcpServers?: {
        id: string;
        name: string;
        url: string;
        enabled: boolean;
    }[];
}
