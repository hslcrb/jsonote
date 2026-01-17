'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Github, Key, Info, ChevronLeft, ShieldCheck } from 'lucide-react';
import { GitHubConfig } from '@/types/note';

interface SettingsModalProps {
  config: GitHubConfig | null;
  onSave: (config: GitHubConfig) => void;
  onClose: () => void;
}

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [editedConfig, setEditedConfig] = useState<GitHubConfig>(config || {
    token: '',
    owner: '',
    repo: '',
    branch: 'main'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="modal-container glass"
      >
        <header className="modal-header">
          <div className="title-section">
            <button className="icon-btn mobile-only" onClick={onClose}>
              <ChevronLeft size={20} />
            </button>
            <Github size={22} className="text-accent" />
            <h3>GitHub 동기화 설정</h3>
          </div>
        </header>

        <div className="modal-body scroll-area">
          <p className="description">
            노트를 GitHub에 안전하게 저장하고 모든 기기에서 동기화하세요.
          </p>

          <div className="input-field">
            <label><Key size={14} /> 개인 액세스 토큰 (PAT)</label>
            <input
              type="password"
              placeholder="ghp_..."
              value={editedConfig.token}
              onChange={(e) => setEditedConfig({ ...editedConfig, token: e.target.value })}
              className="glass"
            />
            <span className="hint">'repo' 권한이 체크된 토큰이 필요합니다.</span>
          </div>

          <div className="grid-row">
            <div className="input-field">
              <label>사용자명 (Owner)</label>
              <input
                type="text"
                placeholder="GitHub ID"
                value={editedConfig.owner}
                onChange={(e) => setEditedConfig({ ...editedConfig, owner: e.target.value })}
                className="glass"
              />
            </div>
            <div className="input-field">
              <label>저장소 (Repo)</label>
              <input
                type="text"
                placeholder="my-notes"
                value={editedConfig.repo}
                onChange={(e) => setEditedConfig({ ...editedConfig, repo: e.target.value })}
                className="glass"
              />
            </div>
          </div>

          <div className="input-field">
            <label>브랜치 (Branch)</label>
            <input
              type="text"
              placeholder="main"
              value={editedConfig.branch}
              onChange={(e) => setEditedConfig({ ...editedConfig, branch: e.target.value })}
              className="glass"
            />
          </div>

          <div className="security-notice glass">
            <ShieldCheck size={18} className="text-success" />
            <div>
              <strong>보안 안내</strong>
              <p>토큰은 브라우저 로컬 저장소에만 보관되며 외부 서버로 전송되지 않습니다.</p>
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>취소</button>
          <button
            className="primary-btn glass-card"
            onClick={() => onSave(editedConfig)}
          >
            <Save size={18} />
            <span>설정 저장</span>
          </button>
        </footer>
      </motion.div>

      <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(8px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                }

                .modal-container {
                    width: 100%;
                    max-width: 500px;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow-lg);
                }

                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-glass);
                    background: rgba(255, 255, 255, 0.02);
                }

                .title-section {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .title-section h3 {
                    font-size: 1.25rem;
                    margin: 0;
                    font-family: 'Outfit', sans-serif;
                }

                .modal-body {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    max-height: 70vh;
                    overflow-y: auto;
                }

                .description {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                .input-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }

                .input-field label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .input-field input {
                    padding: 0.8rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    outline: none;
                    border: 1px solid var(--border-glass);
                    transition: border-color 0.2s;
                }

                .input-field input:focus {
                    border-color: var(--accent-primary);
                }

                .hint { font-size: 0.75rem; color: var(--text-muted); }

                .grid-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .security-notice {
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    display: flex;
                    gap: 1rem;
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .security-notice strong { display: block; font-size: 0.85rem; margin-bottom: 0.25rem; }
                .security-notice p { font-size: 0.8rem; color: var(--text-secondary); margin: 0; }
                .text-success { color: #10b981; }

                .modal-footer {
                    padding: 1.5rem 2rem;
                    background: rgba(0, 0, 0, 0.05);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    border-top: 1px solid var(--border-glass);
                }

                .primary-btn {
                    padding: 0.75rem 1.5rem;
                    background: var(--accent-gradient);
                    color: white;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-radius: var(--radius-full);
                }

                .secondary-btn {
                    padding: 0.75rem 1.25rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                }

                .icon-btn {
                    padding: 0.5rem;
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                }

                .text-accent { color: var(--accent-primary); }

                @media (max-width: 768px) {
                    .modal-container { height: 100vh; max-width: 100%; border-radius: 0; }
                    .grid-row { grid-template-columns: 1fr; }
                }
            `}</style>
    </motion.div>
  );
}
