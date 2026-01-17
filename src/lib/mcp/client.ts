export interface McpServerConfig {
    id: string;
    name: string;
    url: string;
    enabled: boolean;
}

export class McpClientManager {
    // Communication with MCP servers via Next.js API proxy in the browser 
    // 브라우저에서는 Next.js API 프록시를 통해 MCP 서버와 통신

    async connect(config: McpServerConfig): Promise<void> {
        // Just a placeholder for SSE connection check / SSE 연결 확인을 위한 플레이홀더
        // In the browser proxy model, connectivity is checked during tool listing
        // 브라우저 프록시 모델에서는 도구 목록 조회 시 연결 상태가 확인됨
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
        // No manual disconnection needed for browser-based fetch / 브라우저 기반이므로 별도 연결 해제 불필요
    }
}

export const mcpClientManager = new McpClientManager();
