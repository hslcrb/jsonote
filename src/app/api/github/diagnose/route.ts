
import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function POST(req: NextRequest) {
    const { token, owner, repo, branch } = await req.json();
    const logs: string[] = [];

    const log = (msg: string) => {
        console.log(`[Diagnose] ${msg}`);
        logs.push(msg);
    };

    if (!token || !owner || !repo) {
        return NextResponse.json({ success: false, message: '필수 설정(토큰, 소유자, 저장소)이 누락되었습니다.', logs }, { status: 400 });
    }

    try {
        log('1. GitHub 인증 시작...');
        const octokit = new Octokit({ auth: token });

        // 1. User Info (Authentication Check)
        const { data: user } = await octokit.rest.users.getAuthenticated();
        log(`✅ 인증 성공: Logged in as ${user.login}`);

        // 2. Repo Access (Authorization Check)
        log(`2. 저장소(${owner}/${repo}) 접근 확인 중...`);
        const { data: repository } = await octokit.rest.repos.get({
            owner,
            repo,
        });
        log(`✅ 저장소 접근 성공: ${repository.full_name} (Private: ${repository.private})`);

        if (!repository.permissions?.push) {
            throw new Error(`❌ 쓰기 권한(Push access)이 없습니다. 토큰 스코프(repo)를 확인하세요.`);
        }
        log(`✅ 쓰기 권한 확인됨 (Push Allowed)`);

        // 3. Write Test (File Creation/Deletion)
        const testFileName = `notes/test-connection-${Date.now()}.json`;
        const testContent = Buffer.from(JSON.stringify({ test: true, time: new Date().toISOString() })).toString('base64');

        log(`3. 테스트 파일 생성 시도: ${testFileName}`);
        const { data: created } = await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: testFileName,
            message: 'Diagnose: Connection Test',
            content: testContent,
            branch: branch || 'main'
        });
        log(`✅ 파일 생성 성공: SHA ${created.content?.sha}`);

        log(`4. 테스트 파일 삭제 시도`);
        await octokit.rest.repos.deleteFile({
            owner,
            repo,
            path: testFileName,
            message: 'Diagnose: Cleanup',
            sha: created.content!.sha!,
            branch: branch || 'main'
        });
        log(`✅ 파일 삭제(Cleanup) 성공`);

        return NextResponse.json({ success: true, message: '모든 테스트를 통과했습니다! 연결이 완벽합니다.', logs });

    } catch (error: any) {
        log(`❌ 테스트 실패: ${error.message}`);
        if (error.status === 401) log('힌트: 토큰이 유효하지 않습니다.');
        if (error.status === 404) log('힌트: 저장소를 찾을 수 없습니다. 오타가 있거나 토큰에 접근 권한이 없습니다.');
        if (error.status === 403) log('힌트: API 호출 한도 초과 또는 권한 부족(SSO 등).');

        return NextResponse.json({ success: false, message: error.message, logs }, { status: 500 });
    }
}
