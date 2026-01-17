'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Tag, Maximize2, ChevronLeft, Eye, Edit3, FileCode, Trash2, Sparkles, Loader2, Bold, Italic, List, Code, Link, Image, Quote, Heading1, CheckCircle, ExternalLink, Plus, Layers, GitBranch, Database, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Note, NoteType } from '@/types/note';
import { mcpClientManager } from '@/lib/mcp/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => Promise<void>;
  onDelete: (id: string) => void;
  onClose: () => void;
  mcpServers?: { id: string, name: string, url: string, enabled: boolean }[];
  storageConfig?: { provider: string; owner?: string; repo?: string; branch?: string };
  allNotes?: Note[];
}

export default function NoteEditor({
  note,
  onSave,
  onDelete,
  onClose,
  mcpServers = [],
  storageConfig,
  allNotes = []
}: NoteEditorProps) {
  const [editedNote, setEditedNote] = useState<Note>({ ...note });
  const [view, setView] = useState<'edit' | 'preview' | 'json'>('edit');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [availableTools, setAvailableTools] = useState<{ serverId: string, serverName: string, serverUrl: string, tools: any[] }[]>([]);
  const [isToolLoading, setIsToolLoading] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Fetch tool lists from MCP servers on load / 로드 시 MCP 서버들에서 도구 목록 가져오기
  React.useEffect(() => {
    const fetchAllTools = async () => {
      const toolLists = [];
      for (const server of mcpServers.filter(s => s.enabled)) {
        try {
          await mcpClientManager.connect(server);
          const tools = await mcpClientManager.listTools(server.url);
          toolLists.push({
            serverId: server.id,
            serverName: server.name,
            serverUrl: server.url,
            tools: tools || []
          });
        } catch (e) {
          console.error(`Failed to load tools from ${server.name}:`, e);
        }
      }
      setAvailableTools(toolLists);
    };

    if (mcpServers && mcpServers.length > 0) {
      fetchAllTools();
    }
  }, [JSON.stringify(mcpServers)]);

  const handleCallTool = async (serverUrl: string, toolName: string) => {
    setIsToolLoading(toolName);
    try {
      const result: any = await mcpClientManager.callTool(serverUrl, toolName, {
        context: editedNote.content,
        title: editedNote.metadata.title
      });

      const textResult = result.content?.map((c: any) => c.text).join('\n') || '';
      if (textResult) {
        setEditedNote(prev => ({
          ...prev,
          content: `${prev.content}\n\n--- AI 응답 (${toolName}) ---\n${textResult}`
        }));
      }
    } catch (e) {
      console.error('Tool call failed:', e);
      alert(`도구 실행 실패: ${(e as Error).message}`);
    } finally {
      setIsToolLoading(null);
    }
  };

  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = document.querySelector('.content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editedNote.content;
    const selection = text.substring(start, end) || defaultText;

    const before = text.substring(0, start);
    const after = text.substring(end);
    const newContent = before + prefix + selection + suffix + after;

    setEditedNote({ ...editedNote, content: newContent });

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selection.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const onToolbarDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('markdownType', type);
  };

  const onEditorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('markdownType');
    if (!type) return;

    const textarea = e.target as HTMLTextAreaElement;
    const dropIndex = textarea.selectionStart; // Simple fallback, or use advanced position calculation if needed

    const syntaxMap: Record<string, [string, string, string]> = {
      bold: ['**', '**', '굵은 텍스트'],
      italic: ['*', '*', '기울임'],
      heading: ['# ', '', '제목'],
      list: ['- ', '', '리스트 항목'],
      code: ['```\n', '\n```', '코드 블록'],
      quote: ['> ', '', '인용문'],
      link: ['[', '](url)', '링크 텍스트'],
      image: ['![', '](url)', '이미지 설명']
    };

    const [prefix, suffix, defaultText] = syntaxMap[type] || ['', '', ''];
    handleInsertMarkdown(prefix, suffix, defaultText);
  };

  React.useEffect(() => {
    const isDifferent = JSON.stringify(editedNote) !== JSON.stringify(note);
    if (isDifferent) {
      setIsSaved(false);
      const timer = setTimeout(() => {
        handleSave();
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsSaved(true);
    }
  }, [editedNote.content, editedNote.metadata.title, editedNote.metadata.customFilename]);



  const handleSave = async (isManual: boolean = false) => {
    const updatedNote = {
      ...editedNote,
      metadata: {
        ...editedNote.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    // If manual save, show success state immediately / 수동 저장이면 즉시 성공 상태 표시
    if (isManual) {
      setSaveStatus('success');
    }

    try {
      // Save to GitHub in background / 백그라운드에서 GitHub에 저장
      await onSave(updatedNote);
      setIsSaved(true);
    } catch (error) {
      console.error('Save failed:', error);
      if (isManual) {
        setSaveStatus('idle');
        alert('저장에 실패했습니다. 네트워크 또는 GitHub 설정을 확인해주세요.');
      }
    }
  };

  const openGitHub = () => {
    if (!storageConfig?.owner || !storageConfig?.repo) return;
    const filename = editedNote.metadata.customFilename || editedNote.metadata.id;
    const branch = storageConfig.branch || 'main';
    const url = `https://github.com/${storageConfig.owner}/${storageConfig.repo}/blob/${branch}/notes/${encodeURIComponent(filename)}.json`;
    window.open(url, '_blank');
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
              <div className="title-row">
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
                <span className={`save-status ${isSaved ? 'saved' : 'saving'}`}>
                  {isSaved ? '저장됨' : '저장 중...'}
                </span>
              </div>
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
                onDelete(note.metadata.id);
                // Note: we don't call onClose() here because the parent's onDelete 
                // will handle the confirmation and then we may want to keep the editor 
                // open until confirmed, or the parent will close it.
                // Actually, if deletion is confirmed in Home, Home updates state 
                // which should close the editor if planned.
              }}
              title="삭제"
            >
              <Trash2 size={18} />
            </button>
            <button
              className={`save-btn ${saveStatus}`}
              onClick={saveStatus === 'success' ? openGitHub : () => handleSave(true)}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? <Loader2 size={18} className="animate-spin" /> :
                saveStatus === 'success' ? <ExternalLink size={18} /> :
                  <Save size={18} />}
              <span className="desktop-only">
                {saveStatus === 'saving' ? '저장 중' :
                  saveStatus === 'success' ? 'GitHub에서 확인' : '저장'}
              </span>
            </button>
          </div>
        </header>

        <div className="editor-body">
          <aside className="editor-meta desktop-only">
            <div className="meta-item">
              <label><Layers size={12} /> 유형</label>
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
              <label>태그 (쉼표로 구분)</label>
              <div className="input-with-icon">
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

            <div className="meta-item">
              <label><GitBranch size={12} /> 상위 페이지</label>
              <select
                value={editedNote.metadata.parentId || ''}
                onChange={(e) => setEditedNote({
                  ...editedNote,
                  metadata: { ...editedNote.metadata, parentId: e.target.value || undefined }
                })}
              >
                <option value="">없음 (최상위)</option>
                {allNotes.filter(n => n.metadata.id !== editedNote.metadata.id).map(n => (
                  <option key={n.metadata.id} value={n.metadata.id}>{n.metadata.title}</option>
                ))}
              </select>
            </div>

            <div className="meta-item">
              <div className="prop-header">
                <label><Database size={12} /> 속성</label>
                <button className="add-prop-btn" onClick={() => {
                  const key = prompt('속성 이름을 입력하세요');
                  if (key) {
                    setEditedNote({
                      ...editedNote,
                      metadata: {
                        ...editedNote.metadata,
                        properties: {
                          ...(editedNote.metadata.properties || {}),
                          [key]: { type: 'text', value: '' }
                        }
                      }
                    });
                  }
                }}><Plus size={12} /> 추가</button>
              </div>
              <div className="properties-list">
                {Object.entries(editedNote.metadata.properties || {}).map(([key, prop]) => (
                  <div key={key} className="prop-row">
                    <span className="prop-key">{key}</span>
                    <input
                      className="prop-val"
                      type="text"
                      value={prop.value}
                      onChange={(e) => {
                        setEditedNote({
                          ...editedNote,
                          metadata: {
                            ...editedNote.metadata,
                            properties: {
                              ...editedNote.metadata.properties,
                              [key]: { ...prop, value: e.target.value }
                            }
                          }
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="meta-item">
              <label><Sparkles size={12} /> AI 어시스턴트 (MCP)</label>
              <div className="mcp-tools-list">
                {availableTools.length > 0 ? (
                  availableTools.map(group => (
                    <div key={group.serverId} className="tool-group">
                      <div className="tool-group-name">{group.serverName}</div>
                      {group.tools.map((tool: any) => (
                        <button
                          key={tool.name}
                          className="tool-btn"
                          disabled={!!isToolLoading}
                          onClick={() => handleCallTool(group.serverUrl, tool.name)}
                        >
                          {isToolLoading === tool.name ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          <span className="truncate">{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="empty-tools">연결된 MCP 도구가 없습니다.</p>
                )}
              </div>
            </div>
          </aside>

          <main className="editor-content">
            {view === 'edit' ? (
              <div className="markdown-editor-wrapper">
                <div className="markdown-toolbar">
                  <button
                    draggable
                    onDragStart={(e) => onToolbarDragStart(e, 'bold')}
                    onClick={() => handleInsertMarkdown('**', '**', '굵은 텍스트')}
                    title="굵게 (Drag 가능)"
                  ><Bold size={16} /></button>
                  <button
                    draggable
                    onDragStart={(e) => onToolbarDragStart(e, 'italic')}
                    onClick={() => handleInsertMarkdown('*', '*', '기울임')}
                    title="기울임"
                  ><Italic size={16} /></button>
                  <button
                    draggable
                    onDragStart={(e) => onToolbarDragStart(e, 'heading')}
                    onClick={() => handleInsertMarkdown('# ', '', '제목')}
                    title="제목"
                  ><Heading1 size={16} /></button>
                  <div className="toolbar-divider" />
                  <button
                    draggable
                    onDragStart={(e) => onToolbarDragStart(e, 'list')}
                    onClick={() => handleInsertMarkdown('- ', '', '리스트')}
                    title="불렛 리스트"
                  ><List size={16} /></button>
                  <button
                    draggable
                    onDragStart={(e) => onToolbarDragStart(e, 'quote')}
                    onClick={() => handleInsertMarkdown('> ', '', '인용')}
                    title="인용문"
                  ><Quote size={16} /></button>
                  <button
                    draggable
                    onDragStart={(e) => onToolbarDragStart(e, 'code')}
                    onClick={() => handleInsertMarkdown('```\n', '\n```', '코드 입력')}
                    title="코드 블록"
                  ><FileCode size={16} /></button>
                  <div className="toolbar-divider" />
                  <button
                    draggable
                    onDragStart={(e) => onToolbarDragStart(e, 'link')}
                    onClick={() => handleInsertMarkdown('[', '](url)', '링크')}
                    title="링크"
                  ><Link size={16} /></button>
                  <button
                    draggable
                    onDragStart={(e) => onToolbarDragStart(e, 'image')}
                    onClick={() => handleInsertMarkdown('![', '](url)', '이미지')}
                    title="이미지"
                  ><Image size={16} /></button>
                </div>
                <textarea
                  className="content-textarea"
                  value={editedNote.content}
                  onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                  onDrop={onEditorDrop}
                  onDragOver={(e) => e.preventDefault()}
                  placeholder="내용(마크다운 지원)을 입력하세요..."
                  autoFocus
                />
              </div>
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
          padding: 1.5rem 2rem;
          background: var(--bg-secondary);
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

        .title-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .save-status {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
          transition: all 0.3s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .save-status.saved {
          color: var(--text-muted);
          background: transparent;
        }

        .save-status.saving {
          color: var(--bg-primary);
          background: #eab308; /* Yellow */
        }

        .title-input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 1.5rem;
          font-weight: 900;
          font-family: 'Nanum Gothic', sans-serif;
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
          padding: 0.6rem 2rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-transform: uppercase;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .save-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
        }

        .save-btn.success {
          background: #22c55e !important;
          color: white !important;
        }

        .save-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .editor-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .editor-meta {
          width: 200px;
          border-right: 1px solid var(--border-glass);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          background: var(--bg-secondary);
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .meta-item label {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-item select, .meta-item input {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          border-radius: 4px;
          padding: 0.4rem 0.6rem;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
          font-family: inherit;
        }

        .meta-item select:focus, .meta-item input:focus {
          border-color: var(--text-secondary);
        }

        .tags-input input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          width: 100%;
          font-size: 0.9rem;
        }

        .markdown-editor-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          overflow: hidden;
        }

        .markdown-toolbar {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.4rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-glass);
        }

        .markdown-toolbar button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          border-radius: 4px;
          cursor: grab;
        }

        .markdown-toolbar button:active {
          cursor: grabbing;
        }

        .markdown-toolbar button:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .toolbar-divider {
          width: 1px;
          height: 16px;
          background: var(--border-glass);
          margin: 0 0.5rem;
        }

        .content-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: var(--text-primary);
          font-size: 1.05rem;
          line-height: 1.65;
          font-family: inherit;
          padding: 1.5rem;
        }

        .editor-content {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow: hidden;
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

        .mcp-tools-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tool-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .tool-group-name {
          font-size: 0.6rem;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .tool-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 700;
          text-align: left;
        }

        .tool-btn:hover:not(:disabled) {
          color: var(--text-primary);
          border-color: var(--text-primary);
        }

        .tool-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-tools {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

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
