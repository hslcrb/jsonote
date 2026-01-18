export type NoteType = 'general' | 'task' | 'todo' | 'meeting' | 'journal' | 'code' | 'database';

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
    parentId?: string; // Field for infinite hierarchy / 무한 계층 구조를 위한 필드
    properties?: Record<string, PropertyValue>; // Database properties / 데이터베이스 속성
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

// Storage Provider Types / 저장소 제공자 유형
export type StorageProvider = 'github' | 'gitlab' | 'gitea' | 's3' | 'webdav' | 'local';

export interface StorageConfig {
    provider: StorageProvider;
    enabled: boolean;
    // Common fields / 공통 필드
    url?: string;
    token?: string;
    owner?: string;
    repo?: string;
    branch?: string;
    // S3 specific / S3 전용 필드
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    region?: string;
    endpoint?: string;
    // WebDAV / Custom specific / WebDAV 및 커스텀 전용 필드
    username?: string;
    password?: string;
    path?: string;
    // MCP Configuration / MCP 설정
    mcpServers?: {
        id: string;
        name: string;
        url: string;
        enabled: boolean;
    }[];
}
