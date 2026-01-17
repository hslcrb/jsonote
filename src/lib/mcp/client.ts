import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export interface McpServerConfig {
    id: string;
    name: string;
    url: string;
    enabled: boolean;
}

export class McpClientManager {
    private clients: Map<string, Client> = new Map();

    async connect(config: McpServerConfig): Promise<Client> {
        if (this.clients.has(config.id)) {
            return this.clients.get(config.id)!;
        }

        const transport = new SSEClientTransport(new URL(config.url));
        const client = new Client(
            {
                name: 'jsonote-client',
                version: '1.0.0',
            },
            {
                capabilities: {},
            }
        );

        await client.connect(transport);
        this.clients.set(config.id, client);
        return client;
    }

    async listTools(serverId: string) {
        const client = this.clients.get(serverId);
        if (!client) throw new Error('클라이언트가 연결되지 않았습니다.');
        return await client.listTools();
    }

    async callTool(serverId: string, toolName: string, args: any) {
        const client = this.clients.get(serverId);
        if (!client) throw new Error('클라이언트가 연결되지 않았습니다.');
        return await client.callTool({
            name: toolName,
            arguments: args,
        });
    }

    disconnect(serverId: string) {
        const client = this.clients.get(serverId);
        if (client) {
            // transport closure is handled internally or implicitly
            this.clients.delete(serverId);
        }
    }
}

export const mcpClientManager = new McpClientManager();
