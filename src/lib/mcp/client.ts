export interface McpServerConfig {
    id: string;
    name: string;
    url: string;
    enabled: boolean;
}

export class McpClientManager {
    // 브라우저에서는 Next.js API 프록시를 통해 MCP 서버와 통신

    async connect(config: McpServerConfig): Promise<void> {
        // 연결 테스트 (도구 목록 가져오기)
        try {
            await this.listTools(config.url);
        } catch (error) {
            console.error(`Failed to connect to ${config.name}:`, error);
            throw error;
        }
    }

    async listTools(serverUrl: string) {
        const response = await fetch('/api/mcp-proxy/list-tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverUrl }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to list tools');
        }

        const data = await response.json();
        return data.tools || [];
    }

    async callTool(serverUrl: string, toolName: string, args: any) {
        const response = await fetch('/api/mcp-proxy/call-tool', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serverUrl,
                toolName,
                arguments: args,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to call tool');
        }

        const data = await response.json();
        return data.result;
    }

    disconnect(serverId: string) {
        // 브라우저 기반이므로 별도 연결 해제 불필요
    }
}

export const mcpClientManager = new McpClientManager();
