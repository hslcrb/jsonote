'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Tag, Maximize2, ChevronLeft, Eye, Edit3, FileCode, Trash2 } from 'lucide-react';
import { Note, NoteType } from '@/types/note';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function NoteEditor({ note, onSave, onDelete, onClose }: NoteEditorProps) {
  const [editedNote, setEditedNote] = useState<Note>({ ...note });
  const [view, setView] = useState<'edit' | 'preview' | 'json'>('edit');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 실시간 자동 저장 (컴포넌트 내부에 적용)
  // 내용이나 파일명이 변경되면 1.5초 후 자동으로 onSave 호출
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // 초기 상태와 다르다면 자동 저장 실행
      if (JSON.stringify(editedNote) !== JSON.stringify(note)) {
        handleSave();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [editedNote.content, editedNote.metadata.title, editedNote.metadata.customFilename]);

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
            <div className="title-area">
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
              <div className="filename-wrapper">
                <span className="label">파일명:</span>
                <input
                  type="text"
                  className="filename-input"
                  value={editedNote.metadata.customFilename || ''}
                  onChange={(e) => {
                    const filteredValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    setEditedNote({
                      ...editedNote,
                      metadata: { ...editedNote.metadata, customFilename: filteredValue }
                    });
                  }}
                  placeholder={editedNote.metadata.id}
                />
                <span className="ext">.json</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <div className="tab-switcher desktop-only">
              <button
                className={view === 'edit' ? 'active' : ''}
                onClick={() => setView('edit')}
              >
                <Edit3 size={14} />
                편집
              </button>
              <button
                className={view === 'preview' ? 'active' : ''}
                onClick={() => setView('preview')}
              >
                <Eye size={14} />
                미리보기
              </button>
              <button
                className={view === 'json' ? 'active' : ''}
                onClick={() => setView('json')}
              >
                <FileCode size={14} />
                JSON
              </button>
            </div>
            <button
              className="icon-btn"
              onClick={() => {
                if (confirm('이 노트를 삭제하시겠습니까?')) {
                  onDelete(note.metadata.id);
                  onClose();
                }
              }}
              title="삭제"
            >
              <Trash2 size={18} />
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
                placeholder="내용(마크다운 지원)을 입력하세요..."
                autoFocus
              />
            ) : view === 'preview' ? (
              <div className="markdown-preview scroll-area">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {editedNote.content || '*내용이 없습니다.*'}
                </ReactMarkdown>
              </div>
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
          gap: 1.5rem;
          flex: 1;
        }

        .title-area {
          flex: 1;
          display: flex;
          flex-direction: column;
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

        .filename-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .filename-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-glass);
          outline: none;
          color: var(--text-secondary);
          padding: 0;
          width: auto;
          min-width: 100px;
          font-family: 'JetBrains Mono', monospace;
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
          gap: 0.5rem;
        }

        .tab-switcher button {
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .tab-switcher button.active {
          color: var(--text-primary);
          background: var(--bg-secondary);
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
          line-height: 1.6;
          font-family: inherit;
        }

        .markdown-preview {
          flex: 1;
          overflow-y: auto;
          color: var(--text-primary);
          line-height: 1.625;
        }

        .markdown-preview :global(h1), .markdown-preview :global(h2), .markdown-preview :global(h3) {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .markdown-preview :global(p) { margin-bottom: 1rem; }
        .markdown-preview :global(ul), .markdown-preview :global(ol) { margin-bottom: 1rem; padding-left: 1.5rem; }
        .markdown-preview :global(li) { margin-bottom: 0.5rem; }
        .markdown-preview :global(code) { 
          background: var(--bg-secondary); 
          padding: 0.2rem 0.4rem; 
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
        }
        .markdown-preview :global(pre) {
          background: var(--bg-secondary);
          padding: 1rem;
          border: 1px solid var(--border-glass);
          overflow-x: auto;
          margin: 1rem 0;
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

        .icon-btn:hover {
          color: var(--text-primary);
        }

        .icon-btn[title="삭제"]:hover {
          color: #ff4444;
        }

        @media (max-width: 768px) {
          .editor-container { width: 100%; height: 100%; border: none; }
          .editor-meta { display: none; }
          .editor-content { padding: 1.5rem; }
          .header-left { gap: 0.5rem; }
          .title-input { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  );
}
