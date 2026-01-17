import { NextResponse } from 'next/server';
import { JsonoteMcpServer } from '@/lib/mcp/server';

export async function POST(req: Request) {
    try {
        const configStr = req.headers.get('x-jsonote-config');
        if (!configStr) {
            return NextResponse.json({ error: 'Missing storage configuration' }, { status: 401 });
        }

        const config = JSON.parse(configStr);
        const mcpServer = new JsonoteMcpServer(config);

        const body = await req.json();
        const response = await mcpServer.handleRequest(body);

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('MCP Server Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
