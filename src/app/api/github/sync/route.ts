
import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

// Define expected payload types
interface SyncRequest {
    token: string;
    owner: string;
    repo: string;
    branch: string;
    path: string; // 'notes' (for list) or 'notes/xxx.json' (for detail)
    content?: string; // JSON string for save
    message?: string; // Commit message
}

// 헬퍼: 에러 응답 생성
function errorResponse(status: number, message: string, detail?: any) {
    return NextResponse.json({ error: message, detail }, { status });
}

export async function POST(req: NextRequest) {
    try {
        const body: SyncRequest = await req.json();
        const { token, owner, repo, branch, path, content, message } = body;

        if (!token || !owner || !repo || !path || !content) {
            return errorResponse(400, 'Missing required fields');
        }

        const octokit = new Octokit({ auth: token });

        // 1. SHA 가져오기 (충돌 방지 및 업데이트용)
        let sha: string | undefined;
        try {
            const { data }: any = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
                ref: branch,
                headers: { 'If-None-Match': '', 'Cache-Control': 'no-cache' }
            });
            sha = data.sha;
        } catch (e: any) {
            if (e.status !== 404) {
                console.error('Failed to get SHA:', e);
                // 404가 아니면 진짜 에러임. 하지만 409 방지를 위해 일단 진행해볼 수도 있음.
                // 여기서는 안전하게 에러 리턴 혹은 무시.
            }
        }

        // 2. 파일 생성 또는 업데이트 (Base64 인코딩은 Node.js Buffer 사용)
        // content는 이미 JSON.stringify 된 문자열이라고 가정 (또는 여기서 할 수도 있음)
        // 하지만 클라이언트에서 이미 stringify해서 보낼 것임.
        const base64Content = Buffer.from(content, 'utf-8').toString('base64');

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: message || `Update ${path}`,
            content: base64Content,
            branch,
            sha
        });

        return NextResponse.json({ success: true, path });
    } catch (error: any) {
        console.error('Sync POST error:', error);
        return errorResponse(500, error.message || 'Failed to save file');
    }
}

export async function GET(req: NextRequest) {
    try {
        // GET 요청은 Header에서 인증 정보 등을 가져와야 함 (Body가 없으므로)
        // 혹은 Query Param 사용. 보안상 Header 추천.
        const token = req.headers.get('x-github-token');
        const owner = req.headers.get('x-github-owner');
        const repo = req.headers.get('x-github-repo');
        const branch = req.headers.get('x-github-branch');
        const path = req.nextUrl.searchParams.get('path'); // ?path=notes/foo.json

        if (!token || !owner || !repo || !path) {
            return errorResponse(400, 'Missing headers or path param');
        }

        const octokit = new Octokit({ auth: token });

        if (path === 'notes') {
            // 목록 조회 (재귀 아님, notes 폴더 내 파일만)
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
                ref: branch || 'main'
            });

            if (!Array.isArray(data)) {
                return NextResponse.json([]);
            }

            // 단순 파일 목록 리턴
            return NextResponse.json(data);
        } else {
            // 단일 파일 내용 조회
            const { data }: any = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
                ref: branch || 'main'
            });

            // Base64 디코딩
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return NextResponse.json({ content, sha: data.sha });
        }

    } catch (error: any) {
        // console.error('Sync GET error:', error);
        if (error.status === 404) {
            return NextResponse.json(null); // 파일 없음은 null로 명시적 리턴
        }
        return errorResponse(500, error.message || 'Failed to fetch');
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body: SyncRequest = await req.json();
        const { token, owner, repo, branch, path, message } = body;

        if (!token || !owner || !repo || !path) {
            return errorResponse(400, 'Missing required fields');
        }

        const octokit = new Octokit({ auth: token });

        // 삭제하려면 SHA가 필수.
        let sha: string;
        try {
            const { data }: any = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
                ref: branch
            });
            sha = data.sha;
        } catch (e: any) {
            if (e.status === 404) {
                // 이미 없으면 성공 처리
                return NextResponse.json({ success: true, message: 'Already deleted' });
            }
            throw e;
        }

        await octokit.rest.repos.deleteFile({
            owner,
            repo,
            path,
            message: message || `Delete ${path}`,
            sha,
            branch
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Sync DELETE error:', error);
        return errorResponse(500, error.message || 'Failed to delete');
    }
}
