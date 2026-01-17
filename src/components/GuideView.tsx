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
                <p>GitHub 계정을 생성하고 <strong>2단계 인증(2FA)</strong>을 활성화하세요.</p>
              </div>
              <div className="step-item">
                <span className="step-label">저장소</span>
                <p>노트를 저장할 새로운 Repository(저장소)를 생성하세요.</p>
              </div>
              <div className="step-item">
                <span className="step-label">토큰</span>
                <div className="step-detail">
                  <p>1. Settings - Developer settings - Personal access tokens 메뉴로 이동</p>
                  <p>2. <strong>Tokens (classic)</strong> 탭을 클릭</p>
                  <p>3. <strong>Generate new token</strong> 버튼 클릭 후 나타나는 드롭다운 메뉴에서 <strong>Generate new token (classic)</strong>을 반드시 선택하세요.</p>
                  <p className="sub-text">* Fine-grained tokens가 아닌 <strong>classic</strong> 버전을 발급해야 정상 연동됩니다.</p>
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
