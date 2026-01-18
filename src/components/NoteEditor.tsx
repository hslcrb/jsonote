'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Tag, Maximize2, ChevronLeft, Eye, Edit3, FileCode, Trash2, Sparkles, Loader2, Bold, Italic, List, Code, Link, Image, Quote, Heading1, CheckCircle, ExternalLink, Plus, Layers, GitBranch, Database, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Note, NoteType } from '@/types/note';
import { mcpClientManager } from '@/lib/mcp/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ToastType } from './Toast';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => Promise<void>;
  onDelete: (id: string) => void;
  onClose: () => void;
  mcpServers?: { id: string, name: string, url: string, enabled: boolean }[];
  storageConfig?: { provider: string; owner?: string; repo?: string; branch?: string };
  allNotes?: Note[];
  showToast?: (message: string, type: ToastType) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, isDanger?: boolean) => void;
  showPrompt?: (title: string, message: string, defaultValue: string, onConfirm: (value: string) => void) => void;
}


export default function NoteEditor({
  note,
  onSave,
  onDelete,
  onClose,
  mcpServers = [],
  storageConfig,
  allNotes = [],
  showToast,
  showConfirm,
  showPrompt
}: NoteEditorProps) {
  const [editedNote, setEditedNote] = useState<Note>({ ...note });
  const [view, setView] = useState<'edit' | 'preview' | 'json'>('edit');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [availableTools, setAvailableTools] = useState<{ serverId: string, serverName: string, serverUrl: string, tools: any[] }[]>([]);
  const [isToolLoading, setIsToolLoading] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [isGitGlowing, setIsGitGlowing] = useState(false);

  // Fetch tool lists from MCP servers on load / 로드 시 MCP 서버들에서 도구 목록 가져오기
  React.useEffect(() => {
    const fetchAllTools = async () => {
      const toolLists = [];
      const failedServers = [];

      for (const server of mcpServers.filter(s => s.enabled)) {
        try {
          const tools = await mcpClientManager.listTools(server.url);
          toolLists.push({
            serverId: server.id,
            serverName: server.name,
            serverUrl: server.url,
            tools: tools || []
          });
        } catch (e) {
          // Silent warning for connection issues to avoid console noise
          console.warn(`[MCP] Could not connect to ${server.name} (${server.url}). It might be offline.`);
          failedServers.push(server.name);
        }
      }

      setAvailableTools(toolLists);

      if (failedServers.length > 0) {
        showToast?.(`${failedServers.join(', ')} 서버 연결에 실패했습니다.`, 'error');
      }
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
      showToast?.(`도구 실행 실패: ${(e as Error).message}`, 'error');
    } finally {
      setIsToolLoading(null);
    }
  };


  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = document.querySelector('.content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const realText = editedNote.content;
    const selection = realText.substring(start, end) || defaultText;
    const before = realText.substring(0, start);
    const after = realText.substring(end);

    const newContent = before + (prefix ? prefix : '') + (selection ? selection : '') + (suffix ? suffix : '') + after;

    setEditedNote(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos + (selection === defaultText ? defaultText.length : selection.length));
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
    setSaveStatus('saving');

    if (isManual) {
      setIsGitGlowing(true);
    }

    try {
      await onSave(updatedNote);
      setIsSaved(true);
      setSaveStatus('success');

      if (isManual) {
        setTimeout(() => setIsGitGlowing(false), 1000);
      }

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('idle');
      if (isManual) {
        setIsGitGlowing(false);
        showToast?.('저장에 실패했습니다. 네트워크 또는 GitHub 설정을 확인해주세요.', 'error');
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
    <div className={`editor-root ${isFullScreen ? 'fullscreen' : ''}`}>
      <div className="editor-container">
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
            {/* GitHub Button (Indicator) */}
            <button
              className={`action-btn github-btn ${isGitGlowing ? 'glow-active' : ''}`}
              title={storageConfig?.repo ? `GitHub 연동됨: ${storageConfig.owner}/${storageConfig.repo}` : 'GitHub 연동 필요'}
              onClick={() => {
                if (storageConfig?.repo) {
                  window.open(`https://github.com/${storageConfig.owner}/${storageConfig.repo}`, '_blank');
                } else {
                  showToast?.('GitHub 저장소가 설정되지 않았습니다.', 'info');
                }
              }}
            >
              <GitBranch size={16} />
              <span className="btn-label">GitHub</span>
            </button>

            {/* Save / Confirm Button */}
            <button
              className={`action-btn save-btn ${saveStatus === 'success' ? 'success' : ''}`}
              onClick={() => handleSave(true)}
              title="저장 및 확인"
            >
              {saveStatus === 'saving' ? <Loader2 size={16} className="animate-spin" /> :
                saveStatus === 'success' ? <CheckCircle size={16} /> : <Save size={16} />}
              <span className="btn-label">{saveStatus === 'saving' ? '저장 중...' : '저장'}</span>
            </button>

            <button className="icon-btn" onClick={onClose} title="닫기">
              <ChevronRight size={20} />
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
                <option value="general">일반 문서</option>
                <option value="todo">투두 리스트</option>
                <option value="database">데이터베이스</option>
                <option value="task">프로젝트 할 일</option>
                <option value="meeting">회의록</option>
                <option value="journal">개인 저널</option>
                <option value="code">기술 코드</option>
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
                  showPrompt?.('새 속성', '속성 이름을 입력하세요', '', (key) => {
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
                  });
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
                    onClick={() => handleInsertMarkdown('```\n', '\n```', '코드 블록')}
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
                    onClick={() => handleInsertMarkdown('![', '](https://)', '이미지 설명')}
                    title="이미지 추가 (URL)"
                  ><Image size={16} /></button>
                </div>
                {editedNote.metadata.type === 'todo' ? (
                  <div className="todo-editor-wrapper">
                    <div className="todo-header">
                      <h3><CheckCircle size={16} /> 체크리스트</h3>
                      <button className="add-todo-btn" onClick={() => {
                        const newContent = (editedNote.content || '').trim() + (editedNote.content ? '\n' : '') + '- [ ] ';
                        setEditedNote({ ...editedNote, content: newContent });
                      }}>
                        <Plus size={14} /> 항목 추가
                      </button>
                    </div>
                    <div className="todo-items">
                      {editedNote.content.split('\n').map((line, idx) => {
                        const match = line.match(/^\s*-\s*\[([ xX])\]\s*(.*)/);
                        if (!match) return <div key={idx} className="todo-line-raw">{line}</div>;
                        const isChecked = match[1].toLowerCase() === 'x';
                        const text = match[2];

                        return (
                          <div key={idx} className="todo-item-row">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newLines = editedNote.content.split('\n');
                                newLines[idx] = line.replace(/\[[ xX]\]/, e.target.checked ? '[x]' : '[ ]');
                                setEditedNote({ ...editedNote, content: newLines.join('\n') });
                              }}
                            />
                            <input
                              type="text"
                              className={`todo-text ${isChecked ? 'completed' : ''}`}
                              value={text}
                              onChange={(e) => {
                                const newLines = editedNote.content.split('\n');
                                newLines[idx] = line.replace(text, e.target.value);
                                setEditedNote({ ...editedNote, content: newLines.join('\n') });
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="content-textarea"
                    value={editedNote.content}
                    onChange={(e) => {
                      setEditedNote({ ...editedNote, content: e.target.value });
                    }}
                    onDrop={onEditorDrop}
                    onDragOver={(e) => e.preventDefault()}
                    placeholder="내용(마크다운 지원)을 입력하세요..."
                    autoFocus
                  />
                )}
              </div>
            ) : view === 'preview' ? (
              <div className="markdown-preview scroll-area">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                >
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
      </div >

      <style jsx>{`
        .editor-root {
          width: 100%;
          height: 100%;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
        }

        .editor-root.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2000;
        }

        .editor-container {
          width: 90%; /* Original width, now relative to editor-root */
          height: 90%; /* Original height, now relative to editor-root */
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          margin: auto; /* Center the container if not fullscreen */
        }

        /* Remove .editor-container.fullscreen as it's handled by .editor-root.fullscreen */
        /* .editor-container.fullscreen {
          width: 100%;
          height: 100%;
        } */

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
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .save-btn.success {
          background: var(--text-primary) !important;
          color: var(--bg-primary) !important;
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

        .meta-item select, .meta-item > input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          border-radius: 4px;
          padding: 0.4rem 0.6rem;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
        }

        .meta-item select:focus, .meta-item > input:focus {
          border-color: var(--text-secondary);
        }

        .input-with-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          border-radius: 4px;
          padding: 0.4rem 0.6rem;
          color: var(--text-muted);
          width: 100%;
          box-sizing: border-box;
        }

        .input-with-icon input {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          color: var(--text-primary) !important;
          font-size: 0.85rem;
          flex: 1;
          width: 100%;
          outline: none;
        }

        .prop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .add-prop-btn {
          font-size: 0.65rem;
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border: 1px solid var(--border-glass);
          border-radius: 4px;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-weight: 700;
        }

        .properties-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .prop-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          border-radius: 4px;
        }

        .prop-key {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .prop-val {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-size: 0.85rem !important;
          color: var(--text-primary) !important;
          width: 100% !important;
          outline: none;
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

        .image-loading {
          display: inline-block;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px dashed var(--border-glass);
          color: var(--text-muted);
          font-size: 0.8rem;
          margin: 1rem 0;
        }

        .markdown-img {
          max-width: 100%;
          border-radius: 8px;
          border: 1px solid var(--border-glass);
          margin: 1rem 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        .icon-btn:hover {
          color: var(--text-primary);
        }

        .icon-btn[title="삭제"]:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
        }

        @media (max-width: 768px) {
          .editor-container { width: 100%; height: 100%; border: none; }
          .editor-meta { display: none; }
          .editor-content { padding: 1.5rem; }
          .header-left { gap: 0.5rem; }
          .title-input { font-size: 1.25rem; }
        }
        .todo-editor-wrapper {
          padding: 2rem;
          height: 100%;
          overflow-y: auto;
        }

        .todo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .todo-header h3 {
          font-size: 1.25rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .add-todo-btn {
          background: var(--text-primary);
          color: var(--bg-primary);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .todo-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .todo-item-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-glass);
        }

        .todo-item-row input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .todo-text {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
        }

        .todo-text.completed {
          opacity: 0.5;
          text-decoration: line-through;
        }

        .todo-line-raw {
          padding: 0.25rem 0.5rem;
          opacity: 0.6;
          font-size: 0.85rem;
        }
      `}</style>
    </div >
  );
}
