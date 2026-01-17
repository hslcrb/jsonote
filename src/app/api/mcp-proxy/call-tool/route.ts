import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// POST /api/mcp-proxy/call-tool
// Body: { serverUrl: string, toolName: string, arguments: any }
export async function POST(request: NextRequest) {
    try {
        const { serverUrl, toolName, arguments: toolArgs } = await request.json();

        if (!serverUrl || !toolName) {
            return NextResponse.json(
                { error: 'serverUrl and toolName are required' },
                { status: 400 }
            );
        }

        // Create MCP Client (Server-side) / MCP 클라이언트 생성 (서버 사이드)
        const transport = new SSEClientTransport(new URL(serverUrl));
        const client = new Client(
            {
                name: 'jsonote-proxy',
                version: '1.0.0',
            },
            {
                capabilities: {},
            }
        );

        await client.connect(transport);
        const result = await client.callTool({
            name: toolName,
            arguments: toolArgs || {},
        });

        // Close connection / 연결 종료
        await client.close();

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('MCP call-tool error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to call tool' },
            { status: 500 }
        );
    }
}
