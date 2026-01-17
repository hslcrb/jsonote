import React from 'react';
import { motion } from 'framer-motion';
import {
  Info,
  Github,
  Key,
  Database,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  Code
} from 'lucide-react';

interface GuideViewProps {
  onClose?: () => void;
}

const GuideView: React.FC<GuideViewProps> = () => {
  return (
    <div className="guide-container">
      <header className="guide-header">
        <img src="/logo.png" alt="Logo" className="mini-logo" />
        <h1>제이소노트 가이드</h1>
        <p>데이터 주권과 영구적인 기록을 위한 시작</p>
      </header>

      <div className="guide-content">
        <section className="guide-section">
          <div className="section-body">
            <h2>01. 제이소노트란?</h2>
            <p>
              제이소노트는 노트를 <strong>JSON (JavaScript Object Notation)</strong> 데이터 형식으로 저장합니다.
              사용자의 데이터를 GitHub 등 개인 저장소에 직접 보관하기 때문에 완전한 데이터 소유권을 보장합니다.
            </p>
          </div>
        </section>

        <section className="guide-section">
          <div className="section-body">
            <h2>02. GITHUB & GIT</h2>
            <p>
              <strong>Git</strong>은 기록 관리 도구이며, <strong>GitHub</strong>은 이를 클라우드에 보관하는 서비스입니다.
              이를 통해 노트의 변경 이력을 영구적으로 보존할 수 있습니다.
            </p>
          </div>
        </section>

        <section className="guide-section">
          <div className="section-body">
            <h2>03. 보안 공지 (GITHUB 2FA)</h2>
            <div className="warning-banner">
              <p><strong>중요: 2단계 인증(2FA) 필수 적용</strong></p>
              <p>GitHub의 보안 정책에 따라 모든 사용자는 <strong>2026년 2월 23일</strong>까지 2단계 인증을 활성화해야 합니다. 해당 기한 이후에는 인증 없이는 계정 이용이 영구적으로 제한될 수 있습니다.</p>
            </div>
            <p>보안 강화를 위해 지금 바로 GitHub 설정에서 2FA를 활성화하시기 바랍니다.</p>
          </div>
        </section>

        <section className="guide-section">
          <div className="section-body">
            <h2>04. 시작하기</h2>
            <div className="steps-list">
              <div className="step-item">
                <span className="step-label">가입</span>
                <div className="step-detail">
                  <p>GitHub 계정을 생성하고 <strong>2단계 인증(2FA)</strong>을 활성화하세요.</p>
                  <p className="sub-text">* 설정 시 필요한 <strong>소유자(Owner)</strong>명은 본인의 GitHub <strong>사용자 아이디(ID)</strong>입니다.</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-label">저장소</span>
                <p>노트를 저장할 새로운 Repository(저장소)를 생성하세요.</p>
              </div>
              <div className="step-item">
                <span className="step-label">토큰</span>
                <div className="step-detail">
                  <p>1. <strong>Tokens (classic)</strong> 메뉴에서 <strong>Generate new token (classic)</strong> 클릭</p>
                  <p>2. <strong>Note</strong>: <code>jsonote</code> 등 자유롭게 입력</p>
                  <p>3. <strong>Expiration</strong>: <code>No expiration</code> 또는 90일 이상 설정 권장</p>
                  <p>4. <strong>Select scopes</strong>: 최상단의 <strong>[repo]</strong> 항목을 반드시 체크하세요.</p>
                  <p className="sub-text">* [repo] 권한이 있어야 노트를 저장하고 불러올 수 있습니다.</p>
                  <p>5. 최하단의 <strong>Generate token</strong> 버튼 클릭</p>
                </div>
              </div>

              <div className="step-item">
                <span className="step-label">참고</span>
                <div className="step-detail">
                  <p><strong>API URL이 필요한가요?</strong></p>
                  <p>일반적인 GitHub 사용자(github.com)는 <strong>API URL을 입력할 필요가 없습니다</strong>. 기본값(`https://api.github.com`)이 자동으로 사용됩니다.</p>
                  <p className="sub-text">* 사내망 GitHub Enterprise나 GitLab, Gitea 등을 사용하는 경우에만 해당 서비스의 API 주소를 입력하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="guide-section">
          <div className="section-body">
            <h2>05. 마이그레이션 (서비스 이전)</h2>
            <div className="steps-list">
              <div className="step-item">
                <span className="step-label">이전 방법</span>
                <div className="step-detail">
                  <p>1. <strong>기존 서비스</strong>(예: GitLab)에서 동기화를 완료하여 모든 노트를 앱에 불러옵니다.</p>
                  <p>2. [설정]에서 <strong>새 서비스</strong>(예: GitHub)의 정보를 입력하고 저장합니다.</p>
                  <p>3. 상단의 <strong>클라우드 아이콘(동기화 중...)</strong>이 나타나며 로컬의 노트들이 새 저장소로 자동 복제됩니다.</p>
                  <p className="sub-text">* 제이소노트는 로컬 스토리지를 브리지로 사용하여 서비스 간 데이터 이중화 및 이전을 매우 쉽게 지원합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .guide-container {
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
        }

        .guide-header {
          margin-bottom: 4rem;
          position: relative;
        }

        .mini-logo {
          position: absolute;
          top: 0;
          right: 0;
          width: 48px;
          height: 48px;
          opacity: 0.5;
        }

        .guide-header h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }

        .guide-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .guide-content {
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .guide-section {
          border-top: 1px solid var(--border-glass);
          padding-top: 2rem;
        }

        .section-body h2 {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }

        .section-body p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .step-item {
          display: flex;
          gap: 1.5rem;
          align-items: baseline;
        }

        .step-label {
          font-size: 0.75rem;
          font-weight: 900;
          min-width: 60px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .step-item p {
          font-size: 1rem;
          margin: 0;
        }

        .step-detail {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sub-text {
          font-size: 0.85rem !important;
          color: var(--text-muted) !important;
        }

        strong {
          color: var(--text-primary);
        }

        @media (max-width: 640px) {
          .guide-header { margin-bottom: 2rem; }
          .guide-header h1 { font-size: 1.75rem; }
          .guide-header p { font-size: 0.95rem; }
          .guide-content { gap: 2.5rem; }
          .section-body p { font-size: 0.95rem; }
          .step-item { flex-direction: column; gap: 0.5rem; }
          .step-label { min-width: auto; }
        }

        .warning-banner {
          background: var(--bg-secondary);
          border: 1px solid var(--text-primary);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .warning-banner p {
          font-size: 0.95rem !important;
          margin: 0;
          line-height: 1.5;
        }

        .warning-banner p:first-child {
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        code {
          background: var(--bg-tertiary);
          padding: 0.1rem 0.3rem;
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>
    </div>
  );
};

export default GuideView;
