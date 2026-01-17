'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Tag, Maximize2, ChevronLeft } from 'lucide-react';
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
    <div className="editor-overlay">
      <div className={`editor-container ${isFullScreen ? 'fullscreen' : ''}`}>
        <header className="editor-header">
          <div className="header-left">
            <button className="icon-btn" onClick={onClose} aria-label="닫기">
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
              placeholder="제목"
            />
          </div>
          <div className="header-actions">
            <div className="tab-switcher desktop-only">
              <button
                className={view === 'edit' ? 'active' : ''}
                onClick={() => setView('edit')}
              >
                편집
              </button>
              <button
                className={view === 'json' ? 'active' : ''}
                onClick={() => setView('json')}
              >
                JSON
              </button>
            </div>
            <button
              className="icon-btn desktop-only"
              onClick={() => setIsFullScreen(!isFullScreen)}
              aria-label="전체화면"
            >
              <Maximize2 size={18} />
            </button>
            <button className="save-btn" onClick={handleSave}>
              <Save size={18} />
              <span className="desktop-only">저장</span>
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
              >
                <option value="general">일반</option>
                <option value="task">할 일</option>
                <option value="meeting">회의</option>
                <option value="journal">저널</option>
                <option value="code">코드</option>
              </select>
            </div>

            <div className="meta-item">
              <label>태그</label>
              <div className="tags-input">
                <Tag size={14} />
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
                placeholder="내용을 입력하세요..."
                autoFocus
              />
            ) : (
              <pre className="json-viewer">
                {JSON.stringify(editedNote, null, 2)}
              </pre>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-primary);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .editor-container {
          width: 90%;
          height: 90%;
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
        }

        .editor-container.fullscreen {
          width: 100%;
          height: 100%;
        }

        .editor-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .title-input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 1.5rem;
          font-weight: 900;
          font-family: 'Outfit', 'Noto Sans KR', sans-serif;
          color: var(--text-primary);
          width: 100%;
          text-transform: uppercase;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .tab-switcher {
          display: flex;
          border-right: 1px solid var(--border-glass);
          padding-right: 1rem;
        }

        .tab-switcher button {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .tab-switcher button.active {
          color: var(--text-primary);
          text-decoration: underline;
        }

        .save-btn {
          padding: 0.5rem 1.5rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
        }

        .editor-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .editor-meta {
          width: 240px;
          border-right: 1px solid var(--border-glass);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .meta-item label {
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .meta-item select {
          padding: 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          outline: none;
        }

        .tags-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-bottom: 1px solid var(--border-glass);
          color: var(--text-muted);
        }

        .tags-input input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          width: 100%;
          font-size: 0.9rem;
        }

        .editor-content {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
        }

        .content-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: var(--text-primary);
          font-size: 1.25rem;
          line-height: 1.6;
          font-family: inherit;
        }

        .json-viewer {
          flex: 1;
          background: var(--bg-secondary);
          padding: 1.5rem;
          color: var(--text-secondary);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          overflow: auto;
          border: 1px solid var(--border-glass);
        }

        .icon-btn {
          color: var(--text-muted);
        }

        .icon-btn:hover {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .editor-container { width: 100%; height: 100%; border: none; }
          .editor-meta { display: none; }
          .editor-content { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
