'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Github, Key, Info, ChevronLeft, ShieldCheck,
  Database, Cloud, Globe, HardDrive, Link as LinkIcon
} from 'lucide-react';
import { StorageConfig, StorageProvider } from '@/types/note';

interface SettingsModalProps {
  config: StorageConfig | null;
  onSave: (config: StorageConfig) => void;
  onClose: () => void;
}

const PROVIDERS: { id: StorageProvider; name: string; icon: any; color: string }[] = [
  { id: 'github', name: 'GitHub', icon: Github, color: '#24292e' },
  { id: 'gitlab', name: 'GitLab', icon: Globe, color: '#e24329' },
  { id: 'gitea', name: 'Gitea', icon: Database, color: '#609926' },
  { id: 's3', name: 'AWS S3 / S3 Compatible', icon: Cloud, color: '#ff9900' },
  { id: 'webdav', name: 'WebDAV / VPS', icon: HardDrive, color: '#005af0' },
];

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [editedConfig, setEditedConfig] = useState<StorageConfig>(config || {
    provider: 'github',
    enabled: true,
    token: '',
    owner: '',
    repo: '',
    branch: 'main'
  });

  const [activeTab, setActiveTab] = useState<StorageProvider>(editedConfig.provider);

  const handleProviderChange = (provider: StorageProvider) => {
    setActiveTab(provider);
    setEditedConfig({ ...editedConfig, provider });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="modal-container glass"
      >
        <header className="modal-header">
          <div className="title-section">
            <button className="icon-btn mobile-only" onClick={onClose}>
              <ChevronLeft size={20} />
            </button>
            <Settings size={22} className="text-accent" />
            <h3>저장소 및 동기화 설정</h3>
          </div>
        </header>

        <div className="modal-body-container">
          <aside className="provider-sidebar glass">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                className={`provider-item ${activeTab === p.id ? 'active' : ''}`}
                onClick={() => handleProviderChange(p.id)}
              >
                <p.icon size={18} style={{ color: activeTab === p.id ? 'var(--accent-primary)' : 'inherit' }} />
                <span>{p.name}</span>
              </button>
            ))}
          </aside>

          <div className="settings-content scroll-area">
            <div className="content-padding">
              <div className="provider-badge">
                {PROVIDERS.find(p => p.id === activeTab)?.name} 설정
              </div>

              {(activeTab === 'github' || activeTab === 'gitlab' || activeTab === 'gitea') && (
                <div className="form-section">
                  <div className="input-field">
                    <label><LinkIcon size={14} /> API 엔드포인트 URL (Gitea/Self-hosted용)</label>
                    <input
                      type="text"
                      placeholder={activeTab === 'github' ? 'https://api.github.com' : 'URL 입력...'}
                      value={editedConfig.url || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, url: e.target.value })}
                      className="glass"
                    />
                  </div>
                  <div className="input-field">
                    <label><Key size={14} /> 액세스 토큰 (Token / PAT)</label>
                    <input
                      type="password"
                      placeholder="Token 입력..."
                      value={editedConfig.token || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, token: e.target.value })}
                      className="glass"
                    />
                  </div>
                  <div className="grid-row">
                    <div className="input-field">
                      <label>소유자 (Owner)</label>
                      <input
                        type="text"
                        placeholder="사용자명"
                        value={editedConfig.owner || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, owner: e.target.value })}
                        className="glass"
                      />
                    </div>
                    <div className="input-field">
                      <label>리포지토리 (Repo)</label>
                      <input
                        type="text"
                        placeholder="my-notes"
                        value={editedConfig.repo || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, repo: e.target.value })}
                        className="glass"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 's3' && (
                <div className="form-section">
                  <div className="input-field">
                    <label>엔드포인트 (S3 Endpoint)</label>
                    <input
                      type="text"
                      placeholder="https://s3.amazonaws.com"
                      value={editedConfig.endpoint || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, endpoint: e.target.value })}
                      className="glass"
                    />
                  </div>
                  <div className="grid-row">
                    <div className="input-field">
                      <label>Access Key</label>
                      <input
                        type="text"
                        value={editedConfig.accessKey || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, accessKey: e.target.value })}
                        className="glass"
                      />
                    </div>
                    <div className="input-field">
                      <label>Secret Key</label>
                      <input
                        type="password"
                        value={editedConfig.secretKey || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, secretKey: e.target.value })}
                        className="glass"
                      />
                    </div>
                  </div>
                  <div className="grid-row">
                    <div className="input-field">
                      <label>버킷 (Bucket)</label>
                      <input
                        type="text"
                        value={editedConfig.bucket || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, bucket: e.target.value })}
                        className="glass"
                      />
                    </div>
                    <div className="input-field">
                      <label>지역 (Region)</label>
                      <input
                        type="text"
                        placeholder="us-east-1"
                        value={editedConfig.region || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, region: e.target.value })}
                        className="glass"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'webdav' && (
                <div className="form-section">
                  <div className="input-field">
                    <label>서버 주소 (WebDAV URL)</label>
                    <input
                      type="text"
                      placeholder="https://vps-server.com/dav"
                      value={editedConfig.url || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, url: e.target.value })}
                      className="glass"
                    />
                  </div>
                  <div className="grid-row">
                    <div className="input-field">
                      <label>사용자 아이디</label>
                      <input
                        type="text"
                        value={editedConfig.username || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, username: e.target.value })}
                        className="glass"
                      />
                    </div>
                    <div className="input-field">
                      <label>비밀번호 / 앱 토큰</label>
                      <input
                        type="password"
                        value={editedConfig.password || ''}
                        onChange={(e) => setEditedConfig({ ...editedConfig, password: e.target.value })}
                        className="glass"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="security-notice glass">
                <ShieldCheck size={18} className="text-success" />
                <div>
                  <strong>엔드투엔드 보안</strong>
                  <p>모든 자격 증명은 현재 브라우저의 로컬 스토리지에만 암호화되거나 안전하게 보관됩니다.</p>
                </div>
              </div>
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
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(12px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }

                .modal-container {
                    width: 100%;
                    max-width: 800px;
                    height: 80vh;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow-xl);
                }

                .modal-header {
                    padding: 1.25rem 1.5rem;
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
                    font-family: 'Outfit', sans-serif;
                    margin: 0;
                }

                .modal-body-container {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                .provider-sidebar {
                    width: 220px;
                    border-right: 1px solid var(--border-glass);
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    background: rgba(0, 0, 0, 0.05);
                }

                .provider-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.85rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    text-align: left;
                    transition: all 0.2s;
                }

                .provider-item:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .provider-item.active {
                    background: rgba(59, 130, 246, 0.1);
                    color: var(--accent-primary);
                    font-weight: 600;
                }

                .settings-content {
                    flex: 1;
                    overflow-y: auto;
                    background: rgba(0, 0, 0, 0.02);
                }

                .content-padding {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .provider-badge {
                    display: inline-block;
                    padding: 0.4rem 1rem;
                    background: var(--accent-gradient);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 0.85rem;
                    font-weight: 700;
                    align-self: flex-start;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
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
                    padding: 0.85rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    outline: none;
                }

                .grid-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }

                .security-notice {
                    padding: 1.25rem;
                    border-radius: var(--radius-lg);
                    display: flex;
                    gap: 1rem;
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .security-notice strong { display: block; font-size: 0.9rem; margin-bottom: 0.25rem; }
                .security-notice p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
                .text-success { color: #10b981; }

                .modal-footer {
                    padding: 1.25rem 2rem;
                    border-top: 1px solid var(--border-glass);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .primary-btn {
                    padding: 0.75rem 1.75rem;
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
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .text-accent { color: var(--accent-primary); }

                @media (max-width: 768px) {
                    .modal-container { height: 100vh; max-width: 100%; border-radius: 0; }
                    .modal-body-container { flex-direction: column; }
                    .provider-sidebar { width: 100%; height: auto; flex-direction: row; overflow-x: auto; padding: 0.5rem; }
                    .provider-item { white-space: nowrap; padding: 0.5rem 1rem; }
                    .grid-row { grid-template-columns: 1fr; }
                    .content-padding { padding: 1.5rem; }
                }
            `}</style>
    </motion.div>
  );
}

import { Settings } from 'lucide-react';
