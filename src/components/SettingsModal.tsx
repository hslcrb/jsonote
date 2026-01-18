'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Github, Key, ChevronLeft, ShieldCheck,
  Database, Cloud, Globe, HardDrive, Settings, Link as LinkIcon
} from 'lucide-react';
import { StorageConfig, StorageProvider } from '@/types/note';

interface SettingsModalProps {
  config: StorageConfig | null;
  onSave: (config: StorageConfig) => void;
  onClose: () => void;
}

const PROVIDERS: { id: StorageProvider; name: string; icon: any }[] = [
  { id: 'github', name: 'GITHUB', icon: Github },
  { id: 'gitlab', name: 'GITLAB', icon: Globe },
  { id: 'gitea', name: 'GITEA', icon: Database },
  { id: 's3', name: 'S3', icon: Cloud },
  { id: 'webdav', name: 'WEBDAV', icon: HardDrive },
];

type TabType = StorageProvider;

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [editedConfig, setEditedConfig] = useState<StorageConfig>(config || {
    provider: 'github',
    enabled: true,
    token: '',
    owner: '',
    repo: '',
    branch: 'main'
  });

  const [activeTab, setActiveTab] = useState<TabType>(editedConfig.provider);

  const handleProviderChange = (provider: TabType) => {
    setActiveTab(provider);
    setEditedConfig({ ...editedConfig, provider });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <div className="title-section">
            <Settings size={20} />
            <h3>환경 설정</h3>
          </div>
        </header>

        <div className="modal-body">
          <aside className="provider-sidebar">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                className={`provider-item ${activeTab === p.id ? 'active' : ''}`}
                onClick={() => handleProviderChange(p.id)}
              >
                <span>{p.name}</span>
              </button>
            ))}
          </aside>

          <div className="settings-content scroll-area">
            <div className="form-section">
              <div className="section-title">{activeTab.toUpperCase()} 설정</div>

              {(activeTab === 'github' || activeTab === 'gitlab' || activeTab === 'gitea') && (
                <div className="inputs-grid">
                  <div className="input-group">
                    <label>API URL</label>
                    <input
                      type="text"
                      placeholder={activeTab === 'github' ? 'https://api.github.com' : 'URL...'}
                      value={editedConfig.url || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, url: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>액세스 토큰</label>
                    <input
                      type="password"
                      placeholder="토큰 입력..."
                      value={editedConfig.token || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, token: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>소유자 (OWNER)</label>
                    <input
                      type="text"
                      placeholder="사용자명"
                      value={editedConfig.owner || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, owner: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>저장소 (REPO)</label>
                    <input
                      type="text"
                      placeholder="my-notes"
                      value={editedConfig.repo || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, repo: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 's3' && (
                <div className="inputs-grid">
                  <div className="input-group">
                    <label>ENDPOINT</label>
                    <input
                      type="text"
                      value={editedConfig.endpoint || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, endpoint: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>ACCESS KEY</label>
                    <input
                      type="text"
                      value={editedConfig.accessKey || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, accessKey: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>SECRET KEY</label>
                    <input
                      type="password"
                      value={editedConfig.secretKey || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, secretKey: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>BUCKET</label>
                    <input
                      type="text"
                      value={editedConfig.bucket || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, bucket: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="security-info">
                <ShieldCheck size={16} />
                <p>모든 정보는 브라우저 로컬 스토리지에만 보관됩니다.</p>
              </div>
            </div>
                      </div>
        </div>

        <footer className="modal-footer">
          <button className="text-btn" onClick={onClose}>취소</button>
          <button className="save-btn" onClick={() => onSave(editedConfig)}>
            설정 저장
          </button>
        </footer>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-primary);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-container {
          width: 100%;
          max-width: 800px;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-glass);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-glass);
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .title-section h3 {
          font-size: 1.25rem;
          margin: 0;
          font-weight: 900;
        }

        .modal-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .provider-sidebar {
          width: 200px;
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
        }

        .provider-item {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-glass);
        }

        .provider-item.active {
          color: var(--text-primary);
          background: var(--bg-secondary);
          text-decoration: underline;
        }

        .settings-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 900;
          color: var(--text-muted);
          margin-bottom: 2rem;
          letter-spacing: 0.1em;
        }

        .inputs-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .input-group input {
          padding: 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          outline: none;
        }

        .security-info {
          margin-top: 3rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border-glass);
          display: flex;
          justify-content: flex-end;
          gap: 2rem;
        }

        .save-btn {
          padding: 0.75rem 2rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-weight: 900;
          text-transform: uppercase;
        }

        .text-btn {
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .modal-body { flex-direction: column; }
          .provider-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border-glass); flex-direction: row; overflow-x: auto; }
          .provider-item { border-bottom: none; border-right: 1px solid var(--border-glass); white-space: nowrap; }
          .settings-content { padding: 1.5rem; }
        }

      `}</style>
    </div>
  );
}
