'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Github, Key, Info } from 'lucide-react';
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
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="modal-container glass"
            >
                <header className="modal-header">
                    <div className="title-section">
                        <Github size={20} className="text-accent" />
                        <h3>GitHub Connection</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className="modal-body">
                    <p className="description">
                        Connect your GitHub repository to enable remote storage, versioning, and cross-device sync.
                    </p>

                    <div className="input-group">
                        <label><Key size={14} /> Personal Access Token</label>
                        <input
                            type="password"
                            placeholder="ghp_xxxxxxxxxxxx"
                            value={editedConfig.token}
                            onChange={(e) => setEditedConfig({ ...editedConfig, token: e.target.value })}
                        />
                        <span className="hint">Requires 'repo' scope.</span>
                    </div>

                    <div className="row">
                        <div className="input-group">
                            <label>Owner (Username)</label>
                            <input
                                type="text"
                                placeholder="e.g. jdoe"
                                value={editedConfig.owner}
                                onChange={(e) => setEditedConfig({ ...editedConfig, owner: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Repository Name</label>
                            <input
                                type="text"
                                placeholder="e.g. my-notes"
                                value={editedConfig.repo}
                                onChange={(e) => setEditedConfig({ ...editedConfig, repo: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Branch</label>
                        <input
                            type="text"
                            placeholder="main"
                            value={editedConfig.branch}
                            onChange={(e) => setEditedConfig({ ...editedConfig, branch: e.target.value })}
                        />
                    </div>

                    <div className="info-box glass">
                        <Info size={16} />
                        <p>Your token is stored locally in your browser and used only to communicate with GitHub API.</p>
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="save-btn glass-card"
                        onClick={() => onSave(editedConfig)}
                    >
                        <Save size={18} />
                        <span>Save Configuration</span>
                    </button>
                </footer>
            </motion.div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 100;
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
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.03);
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .title-section h3 {
          font-family: 'Outfit';
          font-size: 1.1rem;
          margin: 0;
        }

        .text-accent { color: var(--accent-primary); }

        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .input-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.75rem;
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
          border-color: var(--accent-primary);
        }

        .hint {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .info-box {
          padding: 0.75rem;
          border-radius: var(--radius-md);
          display: flex;
          gap: 0.75rem;
          background: rgba(59, 130, 246, 0.05);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .info-box p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .modal-footer {
          padding: 1.25rem 1.5rem;
          background: rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid var(--border-glass);
        }

        .cancel-btn {
          padding: 0.5rem 1rem;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .save-btn {
          padding: 0.5rem 1.25rem;
          background: var(--accent-gradient);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .close-btn {
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }
      `}</style>
        </motion.div>
    );
}
