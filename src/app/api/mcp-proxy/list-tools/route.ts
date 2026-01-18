import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// POST /api/mcp-proxy/list-tools
// Body: { serverUrl: string }
export async function POST(request: NextRequest) {
    try {
        const { serverUrl } = await request.json();

        if (!serverUrl) {
            return NextResponse.json(
                { error: 'serverUrl is required' },
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
        const tools = await client.listTools();

        // Close connection / 연결 종료
        await client.close();

        return NextResponse.json({ tools: tools.tools });
    } catch (error: any) {
        if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
            console.warn(`[MCP Proxy] Target server unreachable: ${error.message}`);
        } else {
            console.error('MCP list-tools error:', error);
        }
        return NextResponse.json(
            { error: error.message || 'Failed to list tools' },
            { status: 500 }
        );
    }
}
