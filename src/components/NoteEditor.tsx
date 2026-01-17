'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Eye, Code, Tag, Trash2 } from 'lucide-react';
import { Note, NoteType } from '@/types/note';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
}

export default function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [editedNote, setEditedNote] = useState<Note>({ ...note });
  const [view, setView] = useState<'edit' | 'preview' | 'json'>('edit');

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
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="editor-container glass"
      >
        <header className="editor-header">
          <div className="title-section">
            <input
              type="text"
              className="title-input"
              value={editedNote.metadata.title}
              onChange={(e) => setEditedNote({
                ...editedNote,
                metadata: { ...editedNote.metadata, title: e.target.value }
              })}
              placeholder="Note Title"
            />
          </div>
          <div className="header-actions">
            <div className="tab-switcher glass">
              <button
                className={view === 'edit' ? 'active' : ''}
                onClick={() => setView('edit')}
              ><Eye size={16} /> 편집</button>
              <button
                className={view === 'json' ? 'active' : ''}
                onClick={() => setView('json')}
              ><Code size={16} /> JSON</button>
            </div>
            <button className="save-btn glass-card" onClick={handleSave}>
              <Save size={18} />
              <span>저장</span>
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="editor-body">
          <aside className="editor-meta">
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
                <Tag size={14} className="text-muted" />
                <input
                  type="text"
                  placeholder="태그 추가 (쉼표로 구분)..."
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
            {view === 'edit' && (
              <textarea
                className="content-textarea"
                value={editedNote.content}
                onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                placeholder="내용을 입력하세요..."
              />
            )}
            {view === 'json' && (
              <pre className="json-viewer">
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
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .editor-container {
          width: 100%;
          max-width: 1000px;
          height: 100%;
          max-height: 800px;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .editor-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.03);
        }

        .title-input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 1.5rem;
          font-weight: 700;
          font-family: 'Outfit';
          color: var(--text-primary);
          width: 400px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .tab-switcher {
          display: flex;
          padding: 2px;
          border-radius: var(--radius-md);
          background: rgba(0, 0, 0, 0.2);
        }

        .tab-switcher button {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .tab-switcher button.active {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .save-btn {
          padding: 0.5rem 1.25rem;
          background: var(--accent-gradient);
          color: white;
          font-weight: 600;
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

        .editor-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .editor-meta {
          width: 240px;
          border-right: 1px solid var(--border-glass);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: rgba(0, 0, 0, 0.05);
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .meta-item label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .meta-item select, .tags-input input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }

        .tags-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 0 0.5rem;
        }

        .tags-input input {
          border: none;
          background: transparent;
          padding: 0.5rem 0;
          flex: 1;
        }

        .editor-content {
          flex: 1;
          padding: 1.5rem;
          overflow: hidden;
        }

        .content-textarea {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: var(--text-primary);
          font-size: 1.1rem;
          line-height: 1.6;
          font-family: inherit;
        }

        .json-viewer {
          height: 100%;
          overflow: auto;
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: var(--radius-md);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          color: #10b981;
        }
      `}</style>
    </motion.div>
  );
}
