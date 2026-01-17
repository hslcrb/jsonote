import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getStorage } from '@/lib/storage';
import { Note, StorageConfig } from '@/types/note';

export class JsonoteMcpServer {
    private server: Server;
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
        this.server = new Server(
            {
                name: 'jsonote-server',
                version: '1.0.0',
            },
            {
                capabilities: {},
            }
        );

        this.setupHandlers();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'list_notes',
                    description: '제이소노트의 모든 노트 목록을 가져옵니다.',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'read_note',
                    description: '특정 ID 또는 제목의 노트 내용을 읽습니다.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: '노트의 고유 ID' },
                            title: { type: 'string', description: '노트 제목' },
                        },
                    },
                },
                {
                    name: 'create_note',
                    description: '새로운 노트를 작성합니다.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', description: '노트 제목' },
                            content: { type: 'string', description: '노트 내용 (마크다운 지원)' },
                            type: { type: 'string', enum: ['general', 'task', 'meeting', 'journal', 'code'], default: 'general' },
                        },
                        required: ['title', 'content'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const storage = getStorage(this.config);
            if (!storage) {
                throw new Error('저장소 설정이 활성화되지 않았습니다.');
            }

            switch (request.params.name) {
                case 'list_notes': {
                    const notes = await storage.fetchNotes();
                    return {
                        content: [{
                            type: 'text', text: JSON.stringify(notes.map(n => ({
                                id: n.metadata.id,
                                title: n.metadata.title,
                                updatedAt: n.metadata.updatedAt
                            })), null, 2)
                        }],
                    };
                }

                case 'read_note': {
                    const { id, title } = request.params.arguments as { id?: string; title?: string };
                    const notes = await storage.fetchNotes();
                    const note = notes.find(n => n.metadata.id === id || n.metadata.title === title);

                    if (!note) {
                        return {
                            content: [{ type: 'text', text: '노트를 찾을 수 없습니다.' }],
                            isError: true,
                        };
                    }

                    return {
                        content: [{ type: 'text', text: `제목: ${note.metadata.title}\n내용:\n${note.content}` }],
                    };
                }

                case 'create_note': {
                    const { title, content, type } = request.params.arguments as { title: string; content: string; type: any };
                    const newNote: Note = {
                        metadata: {
                            id: Date.now().toString(),
                            title,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            type: type || 'general',
                            tags: [],
                        },
                        content,
                    };

                    await storage.saveNote(newNote);
                    return {
                        content: [{ type: 'text', text: `노트 '${title}'이(가) 성공적으로 생성되었습니다.` }],
                    };
                }

                default:
                    throw new Error(`Unknown tool: ${request.params.name}`);
            }
        });
    }

    // Next.js API Route에서 호출하기 위한 헬퍼 (JSON-RPC 메시지를 직접 처리)
    async handleRequest(request: any) {
        // SDK의 receiveRequest는 JSON-RPC 객체를 받음
        return (this.server as any).receiveRequest(request);
    }
}
