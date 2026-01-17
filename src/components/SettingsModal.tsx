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

type TabType = StorageProvider | 'mcp';

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
    if (provider !== 'mcp') {
      setEditedConfig({ ...editedConfig, provider });
    }
  };

  const [newMcp, setNewMcp] = useState({ name: '', url: '' });

  const addMcpServer = () => {
    if (!newMcp.name || !newMcp.url) return;
    const servers = editedConfig.mcpServers || [];
    const newServer = {
      id: Date.now().toString(),
      name: newMcp.name,
      url: newMcp.url,
      enabled: true
    };
    setEditedConfig({
      ...editedConfig,
      mcpServers: [...servers, newServer]
    });
    setNewMcp({ name: '', url: '' });
  };

  const removeMcpServer = (id: string) => {
    setEditedConfig({
      ...editedConfig,
      mcpServers: editedConfig.mcpServers?.filter(s => s.id !== id)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <div className="title-section">
            <button className="icon-btn mobile-only" onClick={onClose} aria-label="닫기">
              <ChevronLeft size={20} />
            </button>
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
            <button
              className={`provider-item ${activeTab === 'mcp' ? 'active' : ''}`}
              onClick={() => handleProviderChange('mcp')}
            >
              <span>AI & MCP</span>
            </button>
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

              {activeTab === 'mcp' && (
                <div className="mcp-settings">
                  <div className="section-group">
                    <label className="group-label">내부 MCP 서버 (Exporter)</label>
                    <div className="status-box">
                      <div className="status-row">
                        <span className="dot active"></span>
                        <span className="label">서버 상태:</span>
                        <span className="value">Running (Stateless)</span>
                      </div>
                      <div className="status-row">
                        <span className="label">API 엔드포인트:</span>
                        <code className="value">/api/mcp</code>
                      </div>
                      <p className="help-text">Claude Desktop 등에서 jsoNote의 데이터를 읽고 쓸 수 있도록 허용합니다.</p>
                    </div>
                  </div>

                  <div className="section-group">
                    <label className="group-label">외부 MCP 서버 연결 (Client)</label>
                    <div className="mcp-add-form">
                      <input
                        type="text"
                        placeholder="서버 이름 (예: Google Search)"
                        value={newMcp.name}
                        onChange={(e) => setNewMcp({ ...newMcp, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="SSE URL (http://.../sse)"
                        value={newMcp.url}
                        onChange={(e) => setNewMcp({ ...newMcp, url: e.target.value })}
                      />
                      <button className="add-btn" onClick={addMcpServer}>추가</button>
                    </div>

                    <div className="mcp-list">
                      {editedConfig.mcpServers && editedConfig.mcpServers.length > 0 ? (
                        editedConfig.mcpServers.map(server => (
                          <div key={server.id} className="mcp-item">
                            <div className="mcp-info">
                              <span className="mcp-name">{server.name}</span>
                              <span className="mcp-url">{server.url}</span>
                            </div>
                            <button className="del-btn-small" onClick={() => removeMcpServer(server.id)}>삭제</button>
                          </div>
                        ))
                      ) : (
                        <p className="empty-mcp">연결된 외부 MCP 서버가 없습니다.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="migration-banner">
                <LinkIcon size={14} />
                <div>
                  <p><strong>마이그레이션 안내</strong></p>
                  <p>서비스 간 이동(예: GitLab ➔ GitHub) 시, 기존 설정을 유지한 채 동기화를 완료한 뒤 정보를 변경하세요. 로컬의 모든 노트가 새 저장소로 자동 복제됩니다.</p>
                </div>
              </div>

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

        .migration-banner {
          margin-top: 3rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .migration-banner strong {
          color: var(--text-primary);
          display: block;
          margin-bottom: 0.25rem;
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
        .mcp-settings {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .section-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .group-label {
          font-size: 0.7rem;
          font-weight: 900;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .status-box {
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .dot.active {
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
        }

        .status-row .label {
          color: var(--text-muted);
          font-weight: 700;
        }

        .status-row .value {
          color: var(--text-primary);
          font-weight: 700;
        }

        .help-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .mcp-add-form {
          display: flex;
          gap: 0.5rem;
        }

        .mcp-add-form input {
          flex: 1;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }

        .add-btn {
          padding: 0 1.5rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-weight: 900;
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .mcp-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .mcp-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
        }

        .mcp-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mcp-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .mcp-url {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .del-btn-small {
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .del-btn-small:hover {
          color: #ff4444;
        }

        .empty-mcp {
          text-align: center;
          padding: 2rem;
          border: 1px dashed var(--border-glass);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .mcp-add-form { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
