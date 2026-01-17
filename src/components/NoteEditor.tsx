'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Eye, Code, Tag, Trash2, Maximize2, ChevronLeft } from 'lucide-react';
import { Note, NoteType } from '@/types/note';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
}

export default function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [editedNote, setEditedNote] = useState<Note>({ ...note });
  const [view, setView] = useState<'edit' | 'json'>('edit');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleSave = () => {
    const updatedNote = {
      ...editedNote,
      metadata: {
        ...editedNote.metadata,
        updatedAt: new Date().toISOString()
      }
    };
    onSave(updatedNote);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="editor-overlay"
    >
      <motion.div
        layout
        initial={{ scale: 0.9, y: 20 }}
        animate={{
          scale: 1,
          y: 0,
          width: isFullScreen ? '100%' : '90%',
          height: isFullScreen ? '100%' : '85%'
        }}
        className="editor-container glass"
      >
        <header className="editor-header">
          <div className="header-left-actions">
            <button className="icon-btn" onClick={onClose}>
              <ChevronLeft size={20} />
            </button>
            <input
              type="text"
              className="title-input"
              value={editedNote.metadata.title}
              onChange={(e) => setEditedNote({
                ...editedNote,
                metadata: { ...editedNote.metadata, title: e.target.value }
              })}
              placeholder="제목 없는 노트"
            />
          </div>
          <div className="header-actions">
            <div className="tab-switcher glass desktop-only">
              <button className={view === 'edit' ? 'active' : ''} onClick={() => setView('edit')}>편집</button>
              <button className={view === 'json' ? 'active' : ''} onClick={() => setView('json')}>JSON</button>
            </div>
            <button className="icon-btn desktop-only" onClick={() => setIsFullScreen(!isFullScreen)}>
              <Maximize2 size={18} />
            </button>
            <button className="save-btn glass-card" onClick={handleSave}>
              <Save size={18} />
              <span className="desktop-only text-nowrap">저장</span>
            </button>
          </div>
        </header>

        <div className="editor-body">
          <aside className="editor-meta desktop-only">
            <div className="meta-item">
              <label>유형</label>
              <select
                value={editedNote.metadata.type}
                onChange={(e) => setEditedNote({
                  ...editedNote,
                  metadata: { ...editedNote.metadata, type: e.target.value as NoteType }
                })}
                className="glass"
              >
                <option value="general">일반</option>
                <option value="task">할 일</option>
                <option value="meeting">회의</option>
                <option value="journal">저널</option>
                <option value="code">코드</option>
              </select>
            </div>

            <div className="meta-item">
              <label>태그 (쉼표로 구분)</label>
              <div className="tags-input-wrapper glass">
                <Tag size={14} className="text-muted" />
                <input
                  type="text"
                  placeholder="태그..."
                  value={editedNote.metadata.tags.join(', ')}
                  onChange={(e) => setEditedNote({
                    ...editedNote,
                    metadata: {
                      ...editedNote.metadata,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    }
                  })}
                />
              </div>
            </div>
          </aside>

          <main className="editor-content">
            {view === 'edit' ? (
              <textarea
                className="content-textarea"
                value={editedNote.content}
                onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                placeholder="생각을 기록하세요..."
                autoFocus
              />
            ) : (
              <pre className="json-viewer scroll-area">
                {JSON.stringify(editedNote, null, 2)}
              </pre>
            )}
          </main>
        </div>
      </motion.div>

      <style jsx>{`
                .editor-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .editor-container {
                    max-width: 1200px;
                    display: flex;
                    flex-direction: column;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    box-shadow: var(--shadow-lg);
                    transition: width 0.3s ease, height 0.3s ease;
                }

                .editor-header {
                    padding: 0.75rem 1.5rem;
                    border-bottom: 1px solid var(--border-glass);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    background: rgba(var(--bg-secondary), 0.5);
                }

                .header-left-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                }

                .title-input {
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 1.25rem;
                    font-weight: 700;
                    font-family: 'Outfit', sans-serif;
                    color: var(--text-primary);
                    width: 100%;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .tab-switcher {
                    display: flex;
                    padding: 0.2rem;
                    border-radius: var(--radius-md);
                }

                .tab-switcher button {
                    padding: 0.35rem 0.75rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: var(--radius-sm);
                    color: var(--text-secondary);
                }

                .tab-switcher button.active {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .save-btn {
                    padding: 0.6rem 1.25rem;
                    background: var(--accent-gradient);
                    color: white;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-radius: var(--radius-full);
                }

                .editor-body {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                .editor-meta {
                    width: 260px;
                    border-right: 1px solid var(--border-glass);
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    background: rgba(0, 0, 0, 0.02);
                }

                .meta-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .meta-item label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .meta-item select, .tags-input-wrapper {
                    padding: 0.6rem 0.85rem;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    color: var(--text-primary);
                }

                .tags-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .tags-input-wrapper input {
                    background: transparent;
                    border: none;
                    outline: none;
                    color: inherit;
                    width: 100%;
                }

                .editor-content {
                    flex: 1;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .content-textarea {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    resize: none;
                    color: var(--text-primary);
                    font-size: 1.15rem;
                    line-height: 1.8;
                    font-family: inherit;
                }

                .json-viewer {
                    flex: 1;
                    margin: 0;
                    padding: 1.5rem;
                    border-radius: var(--radius-md);
                    background: var(--bg-tertiary);
                    color: #10b981;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.9rem;
                    overflow: auto;
                }

                .icon-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                }

                .icon-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-primary);
                }

                @media (max-width: 768px) {
                    .editor-container {
                        width: 100% !important;
                        height: 100% !important;
                        border-radius: 0;
                    }
                    .editor-meta { display: none; }
                    .editor-content { padding: 1.5rem; }
                }

                .text-nowrap { white-space: nowrap; }
            `}</style>
    </motion.div>
  );
}
