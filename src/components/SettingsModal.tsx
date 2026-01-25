'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Github, Key, ChevronLeft, ShieldCheck,
  Database, Cloud, Globe, HardDrive, Settings, Link as LinkIcon, Languages
} from 'lucide-react';
import { StorageConfig, StorageProvider } from '@/types/note';
import { useLanguage } from '@/contexts/LanguageContext';

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

type TabType = StorageProvider | 'language';

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const { t, language, setLanguage } = useLanguage();
  const [editedConfig, setEditedConfig] = useState<StorageConfig>(config || {
    provider: 'github',
    enabled: true,
    token: '',
    owner: '',
    repo: '',
    branch: 'main'
  });

  const [activeTab, setActiveTab] = useState<TabType>(editedConfig.provider);

  const handleProviderChange = (provider: StorageProvider) => {
    setActiveTab(provider);
    setEditedConfig({ ...editedConfig, provider });
  };

  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleDiagnose = async () => {
    if (!editedConfig.token || !editedConfig.owner || !editedConfig.repo) {
      alert(t('settings.fail') + ': ' + t('settings.token') + ', ' + t('settings.owner') + ', ' + t('settings.repo'));
      return;
    }

    setIsDiagnosing(true);
    try {
      const res = await fetch('/api/github/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedConfig)
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ ${t('settings.success')}\n\n${data.logs.join('\n')}`);
      } else {
        alert(`❌ ${t('settings.fail')}\n\n${data.logs.join('\n')}\n\nError: ${data.message}`);
      }
    } catch (e: any) {
      alert(t('settings.fail') + ': ' + e.message);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <div className="title-section">
            <Settings size={20} />
            <h3>{t('settings.title')}</h3>
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
              className={`provider-item ${activeTab === 'language' ? 'active' : ''}`}
              onClick={() => setActiveTab('language')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Languages size={14} />
                <span>{t('settings.language')}</span>
              </div>
            </button>
          </aside>

          <div className="settings-content scroll-area">
            <div className="form-section">
              <div className="section-title">
                {activeTab === 'language' ? t('settings.language') : `${activeTab.toUpperCase()} ${t('settings.github')}`}
              </div>

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
                    <label>{t('settings.token')}</label>
                    <input
                      type="password"
                      placeholder="..."
                      value={editedConfig.token || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, token: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>{t('settings.owner')}</label>
                    <input
                      type="text"
                      placeholder="owner"
                      value={editedConfig.owner || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, owner: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>{t('settings.repo')}</label>
                    <input
                      type="text"
                      placeholder="my-notes"
                      value={editedConfig.repo || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, repo: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>{t('settings.branch')}</label>
                    <input
                      type="text"
                      placeholder="main"
                      value={editedConfig.branch || ''}
                      onChange={(e) => setEditedConfig({ ...editedConfig, branch: e.target.value })}
                    />
                  </div>
                  <div className="diagnose-section">
                    <button
                      className="diagnose-btn"
                      onClick={handleDiagnose}
                      disabled={isDiagnosing}
                    >
                      {isDiagnosing ? (
                        <>
                          <div className="loader-mini"></div>
                          ...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          {t('settings.test_conn')}
                        </>
                      )}
                    </button>
                    <p className="diagnose-desc">
                      Check connection to the repository.
                    </p>
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

              {activeTab === 'language' && (
                <div className="inputs-grid">
                  <div className="language-selector-grid">
                    {[
                      { id: 'en', name: 'English', flag: '🇺🇸' },
                      { id: 'ko', name: '한국어', flag: '🇰🇷' },
                      { id: 'ja', name: '日本語', flag: '🇯🇵' }
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        className={`lang-option ${language === lang.id ? 'selected' : ''}`}
                        onClick={() => setLanguage(lang.id as any)}
                      >
                        <span className="lang-flag">{lang.flag}</span>
                        <span className="lang-name">{lang.name}</span>
                        {language === lang.id && <div className="selected-dot" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="security-info">
                <ShieldCheck size={16} />
                <p>Data stored locally in your browser.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="text-btn" onClick={onClose}>{t('settings.cancel')}</button>
          <button className="save-btn" onClick={() => onSave(editedConfig)}>
            {t('settings.save')}
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
          background: none;
          border-left: none;
          border-right: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .provider-item:hover {
          background: var(--bg-secondary);
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
          text-transform: uppercase;
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
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .save-btn:hover {
          opacity: 0.9;
        }

        .text-btn {
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          font-size: 0.85rem;
          background: none;
          border: none;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .modal-body { flex-direction: column; }
          .provider-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border-glass); flex-direction: row; overflow-x: auto; }
          .provider-item { border-bottom: none; border-right: 1px solid var(--border-glass); white-space: nowrap; }
          .settings-content { padding: 1.5rem; }
        }

        .diagnose-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px dashed var(--border-glass);
        }

        .diagnose-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #2da44e;
          color: white;
          border: none;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
          border-radius: 4px;
        }

        .diagnose-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .diagnose-desc {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .loader-mini {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .language-selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 1rem;
        }

        .lang-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          transition: all 0.2s;
          position: relative;
          cursor: pointer;
        }

        .lang-option:hover {
          border-color: var(--text-primary);
        }

        .lang-option.selected {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
        }

        .lang-flag {
          font-size: 1.25rem;
        }

        .lang-name {
          font-size: 0.85rem;
          font-weight: 800;
        }

        .selected-dot {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--bg-primary);
        }
      `}</style>
    </div>
  );
}
