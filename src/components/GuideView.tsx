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
  ChevronRight,
  Code
} from 'lucide-react';

interface GuideViewProps {
  onClose?: () => void;
}

const GuideView: React.FC<GuideViewProps> = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      className="guide-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="guide-header">
        <div className="guide-title-wrapper">
          <div className="guide-icon-box">
            <Info size={24} />
          </div>
          <div>
            <h1>사용자 가이드 및 소개</h1>
            <p>Jsonote와 GitHub 저장소에 대해 알아봅니다.</p>
          </div>
        </div>
      </header>

      <div className="guide-content">
        {/* Section 1: What is Jsonote */}
        <motion.section className="guide-section glass-card" variants={itemVariants}>
          <div className="section-icon"><Database className="text-blue-400" /></div>
          <div className="section-body">
            <h2>Jsonote란 무엇인가요?</h2>
            <p>
              Jsonote는 사용자의 노트를 <strong>JSON(JavaScript Object Notation)</strong>이라는 표준 데이터 형식으로 저장하는 현대적인 노트 앱입니다.
              일반적인 앱들과 달리, 사용자의 데이터를 본인의 <strong>GitHub, GitLab, S3</strong> 등 개인 저장소에 직접 보관하므로 완벽한 데이터 소유권을 보장합니다.
            </p>
            <div className="tech-chip-group">
              <span className="tech-chip"><Code size={14} /> JSON 기반</span>
              <span className="tech-chip"><ShieldCheck size={14} /> 데이터 소유권</span>
              <span className="tech-chip"><div className="w-2 h-2 rounded-full bg-green-500" /> 실시간 동기화</span>
            </div>
          </div>
        </motion.section>

        {/* Section 2: What is Git/GitHub */}
        <motion.section className="guide-section glass-card" variants={itemVariants}>
          <div className="section-icon"><Github className="text-gray-300" /></div>
          <div className="section-body">
            <h2>GitHub와 Git은 무엇인가요?</h2>
            <p>
              <strong>Git</strong>은 파일의 변경 이력을 관리하는 '타임머신' 같은 도구입니다.
              <strong>GitHub</strong>은 이 타임머신 기록을 인터넷 클라우드에 안전하게 보관해주는 서비스입니다.
            </p>
            <ul>
              <li><strong>영구성:</strong> GitHub가 존재하는 한 여러분의 노트는 영원히 보관됩니다.</li>
              <li><strong>투명성:</strong> 데이터가 어떻게 변했는지 모든 이력을 확인할 수 있습니다.</li>
              <li><strong>범용성:</strong> 개발자들의 표준 도구를 사용하여 언제 어디서든 접근 가능합니다.</li>
            </ul>
          </div>
        </motion.section>

        {/* Section 3: Getting Started */}
        <motion.section className="guide-section glass-card" variants={itemVariants}>
          <div className="section-icon"><HelpCircle className="text-purple-400" /></div>
          <div className="section-body">
            <h2>GitHub 시작하기 (가입 및 준비)</h2>
            <p>계정이 없으시다면 아래 단계를 따라주세요.</p>
            <ol className="guide-steps">
              <li>
                <span className="step-num">1</span>
                <div className="step-text">
                  <a href="https://github.com/signup" target="_blank" rel="noreferrer" className="inline-link">
                    GitHub 회원가입 페이지 <ExternalLink size={14} />
                  </a>에 접속하여 가입을 완료하세요.
                </div>
              </li>
              <li>
                <span className="step-num">2</span>
                <div className="step-text">새로운 <strong>Repository(저장소)</strong>를 만듭니다. 이름은 <code>my-notes</code> 처럼 자유롭게 정하세요.</div>
              </li>
              <li>
                <span className="step-num">3</span>
                <div className="step-text">Public 혹은 Private으로 설정하세요. (나만 보려면 Private 권장)</div>
              </li>
            </ol>
          </div>
        </motion.section>

        {/* Section 4: Access Token generation */}
        <motion.section className="guide-section glass-card" variants={itemVariants}>
          <div className="section-icon"><Key className="text-yellow-400" /></div>
          <div className="section-body">
            <h2>액세스 토큰(PAT) 발급받기</h2>
            <p>앱이 여러분의 저장소에 일기를 쓸 수 있는 '열쇠'가 필요합니다.</p>
            <div className="token-guide-box">
              <p>1. GitHub 우측 상단 프로필 클릭 → <strong>Settings</strong> 선택</p>
              <p>2. 좌측 하단 <strong>Developer settings</strong> 선택</p>
              <p>3. <strong>Personal access tokens</strong> → <strong>Tokens (classic)</strong> 선택</p>
              <p>4. <strong>Generate new token (classic)</strong> 클릭</p>
              <p>5. Scope 설정에서 <code>repo</code> 항목을 체크하고 생성하세요.</p>
              <div className="warning-note">
                💡 생성된 토큰은 <strong>처음 한 번만</strong> 보여지므로 반드시 안전한 곳에 복사해두세요!
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <style jsx>{`
        .guide-container {
          width: 100%;
          color: var(--text-primary);
        }

        .guide-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .guide-title-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .guide-icon-box {
          width: 56px;
          height: 56px;
          background: var(--accent-gradient);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }

        .guide-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .guide-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .guide-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .guide-section {
          display: flex;
          gap: 1.5rem;
          padding: 2rem;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
        }

        .section-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-body h2 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--accent-primary);
        }

        .section-body p {
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }

        .tech-chip-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .tech-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .guide-steps {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .guide-steps li {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .step-num {
          width: 24px;
          height: 24px;
          background: var(--accent-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .step-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .inline-link {
          color: var(--accent-primary);
          text-decoration: underline;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .token-guide-box {
          background: rgba(0, 0, 0, 0.2);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .token-guide-box p {
          margin: 0;
          font-size: 0.9rem;
        }

        .warning-note {
          margin-top: 0.5rem;
          padding: 1rem;
          background: rgba(234, 179, 8, 0.1);
          border-left: 4px solid #eab308;
          color: #fde047;
          font-size: 0.85rem;
          border-radius: 4px;
        }

        @media (max-width: 640px) {
          .guide-section {
            flex-direction: column;
            padding: 1.5rem;
          }
          .guide-header h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default GuideView;
