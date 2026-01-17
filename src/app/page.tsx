'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Settings, Search, Trash2, Menu, Info, Star, Cloud, Github, HardDrive, Sun, Moon, Monitor, Smartphone, LinkIcon, Zap, X } from 'lucide-react';
import { format } from 'date-fns';
import { Note, NoteType, StorageConfig } from '@/types/note';
import NoteEditor from '@/components/NoteEditor';
import SettingsModal from '@/components/SettingsModal';
import GuideView from '@/components/GuideView';
import { getStorage } from '@/lib/storage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [storageConfig, setStorageConfig] = useState<StorageConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'notes' | 'guide' | 'mcp'>('notes');
  const [customMcpName, setCustomMcpName] = useState('');
  const [customMcpUrl, setCustomMcpUrl] = useState('');

  // MCP 서버 예시 (로컬에서 실행 시 사용할 URL들)
  const POPULAR_MCP_SERVERS = [
    {
      id: 'notion',
      name: 'Notion',
      url: 'http://localhost:3000/notion/sse',
      description: 'npx @modelcontextprotocol/server-notion 을 통해 로컬에서 실행 후 연결하세요.'
    },
    {
      id: 'github',
      name: 'GitHub',
      url: 'http://localhost:3000/github/sse',
      description: 'npx @modelcontextprotocol/server-github 을 통해 로컬에서 실행 후 연결하세요.'
    },
    {
      id: 'google-maps',
      name: 'Google Maps',
      url: 'http://localhost:3000/google-maps/sse',
      description: '장소 검색 및 지도 데이터 연동'
    }
  ];

  const addCustomMcpServer = () => {
    if (!customMcpName || !customMcpUrl) {
      alert('이름과 URL을 모두 입력해주세요.');
      return;
    }
    const newServer = {
      id: `custom-${Date.now()}`,
      name: customMcpName,
      url: customMcpUrl,
      enabled: true
    };
    const updated = {
      ...storageConfig!,
      mcpServers: [...(storageConfig?.mcpServers || []), newServer]
    };
    handleSaveSettings(updated);
    setCustomMcpName('');
    setCustomMcpUrl('');
  };

  const addMcpServer = (preset: typeof POPULAR_MCP_SERVERS[0]) => {
    const existing = storageConfig?.mcpServers?.find(s => s.id === preset.id);
    if (existing) {
      const updated = {
        ...storageConfig!,
        mcpServers: storageConfig!.mcpServers!.map(s =>
          s.id === preset.id ? { ...s, enabled: true } : s
        )
      };
      handleSaveSettings(updated);
    } else {
      const newServer = { ...preset, enabled: true };
      const updated = {
        ...storageConfig!,
        mcpServers: [...(storageConfig?.mcpServers || []), newServer]
      };
      handleSaveSettings(updated);
    }
  };

  const toggleMcpServer = (id: string) => {
    const updated = {
      ...storageConfig!,
      mcpServers: storageConfig!.mcpServers!.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    };
    handleSaveSettings(updated);
  };

  useEffect(() => {
    const savedNotes = localStorage.getItem('jsonote_notes');
    const savedConfig = localStorage.getItem('jsonote_storage_config');
    const savedTheme = localStorage.getItem('jsonote_theme') as 'dark' | 'light';
    const savedView = localStorage.getItem('jsonote_view') as 'desktop' | 'mobile';

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedConfig) setStorageConfig(JSON.parse(savedConfig));
    if (savedTheme) setTheme(savedTheme || 'dark');
    if (savedView) setViewMode(savedView || 'desktop');

    if (!savedNotes) {
      const mockNotes: Note[] = [
        {
          metadata: {
            id: '1',
            title: '제이소노트 프로젝트 비전',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'general',
            tags: ['비전', '제이소노트'],
          },
          content: 'GitHub 연동을 통한 궁극의 JSON 기반 노트 앱 구축.',
        }
      ];
      setNotes(mockNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(mockNotes));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jsonote_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jsonote_view', viewMode);
  }, [viewMode]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Custom UI State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

  const showConfirm = (title: string, message: string, onConfirm: () => void, isDanger = false) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
      isDanger
    });
  };

  useEffect(() => {
    if (!storageConfig || !storageConfig.enabled) return;
    handleSync(true);
    const interval = setInterval(() => handleSync(true), 60000);
    return () => clearInterval(interval);
  }, [storageConfig]);

  const handleSaveNote = async (updatedNote: Note) => {
    // 1. 로컬 상태 즉시 업데이트
    const newNotes = notes.map(n => n.metadata.id === updatedNote.metadata.id ? updatedNote : n);
    if (!notes.find(n => n.metadata.id === updatedNote.metadata.id)) {
      newNotes.push(updatedNote); // New note support
    }

    setNotes(newNotes);
    localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));

    // 에디터 상태 동기화 및 UI 목록 갱신을 위해 선택된 상태 업데이트
    setSelectedNote(updatedNote);

    // 2. 원격 저장소에 즉시 다이렉트 푸시
    if (storageConfig?.enabled) {
      const storage = getStorage(storageConfig);
      if (storage) {
        try {
          await storage.saveNote(updatedNote);
          console.log('Remote save successful');
        } catch (error) {
          console.error('Remote save failed:', error);
          showToast('원격 저장소 반영에 실패했습니다. 네트워크를 확인하세요.', 'error');
          // 에러를 throw하지 않음 - 로컬 저장은 성공했으므로 편집기는 정상 진행
        }
      }
    }
  };

  const deleteNote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const noteToDelete = notes.find(n => n.metadata.id === id);
    if (!noteToDelete) return;

    showConfirm(
      '노트 삭제',
      `'${noteToDelete.metadata.title}' 노트를 영구히 삭제하시겠습니까?`,
      async () => {
        const newNotes = notes.filter(n => n.metadata.id !== id);
        setNotes(newNotes);
        localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));
        setIsEditorOpen(false);
        setSelectedNote(null);

        if (storageConfig?.enabled) {
          const storage = getStorage(storageConfig);
          if (storage) {
            setIsSyncing(true);
            try {
              await storage.deleteNote(noteToDelete);
              showToast('노트가 삭제되었습니다.', 'success');
            } catch (e) {
              console.error('Delete failed:', e);
              showToast('삭제 중 오류가 발생했습니다.', 'error');
            } finally {
              setIsSyncing(false);
            }
          }
        } else {
          showToast('노트가 삭제되었습니다.', 'success');
        }
      },
      true
    );
  };

  const deleteSelectedNotes = async () => {
    if (selectedIds.length === 0) return;

    showConfirm(
      '일괄 삭제',
      `${selectedIds.length}개의 노치를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      async () => {
        setIsSyncing(true);
        try {
          const storage = storageConfig?.enabled ? getStorage(storageConfig) : null;

          if (storage) {
            for (const id of selectedIds) {
              const noteToDelete = notes.find(n => n.metadata.id === id);
              if (noteToDelete) await storage.deleteNote(noteToDelete);
            }
          }

          const remainingNotes = notes.filter(n => !selectedIds.includes(n.metadata.id));
          setNotes(remainingNotes);
          localStorage.setItem('jsonote_notes', JSON.stringify(remainingNotes));
          setSelectedIds([]);
          setIsSelectionMode(false);
          showToast(`${selectedIds.length}개의 노트를 삭제했습니다.`, 'success');
        } catch (e) {
          console.error('Bulk delete failed:', e);
          showToast('일부 노트를 삭제하는 중 오류가 발생했습니다.', 'error');
        } finally {
          setIsSyncing(false);
        }
      },
      true
    );
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotes.map(n => n.metadata.id));
    }
  };

  const createNewNote = () => {
    const newNote: Note = {
      metadata: {
        id: Math.random().toString(36).substr(2, 9),
        title: '새로운 노트',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'general',
        tags: [],
      },
      content: '',
    };
    setSelectedNote(newNote);
    setIsEditorOpen(true);
  };

  const handleSync = async (silent: boolean = false) => {
    const currentConfigStr = localStorage.getItem('jsonote_storage_config');
    const currentConfig = currentConfigStr ? JSON.parse(currentConfigStr) : storageConfig;

    if (!currentConfig || !currentConfig.enabled) {
      if (!silent) setIsSettingsOpen(true);
      return;
    }

    const storage = getStorage(currentConfig);
    if (!storage) return;

    if (!silent) setIsSyncing(true);
    try {
      // 1. 원격 저장소에서 최신 데이터 가져오기 (리모트 삭제 반영을 위함)
      const remoteNotes = await storage.fetchNotes();

      // 2. 로컬 데이터와 병합 및 동기화
      const localNotesStr = localStorage.getItem('jsonote_notes');
      const localNotes: Note[] = localNotesStr ? JSON.parse(localNotesStr) : [];

      // 원격 데이터를 기준으로 최신화 (원격에 없으면 로컬에서도 삭제)
      // 단, 방금 로컬에서 생성되어 아직 업로드되지 않은 데이터는 유지해야 함
      // 여기서는 '완전한 동기화'를 위해 원격 상태를 최종 진실로 간주함
      setNotes(remoteNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(remoteNotes));

      console.log('Sync complete: Local state reconciled with remote.');
      if (!silent) showToast('동기화가 완료되었습니다.', 'success');
    } catch (error) {
      console.error('Sync failed:', error);
      if (!silent) showToast('동기화에 실패했습니다. 설정을 확인해주세요.', 'error');
    } finally {
      if (!silent || isSyncing) setIsSyncing(false);
    }
  };

  const handleSaveSettings = (config: StorageConfig) => {
    setStorageConfig(config);
    localStorage.setItem('jsonote_storage_config', JSON.stringify(config));
    setIsSettingsOpen(false);
    // 설정 저장 즉시 동기화 트리거
    setTimeout(() => handleSync(true), 1000);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleViewMode = () => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop');

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || n.metadata.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className={`layout-container ${viewMode}-view`}>
      <div className="app-shell">
        <motion.aside
          initial={false}
          animate={{
            width: isSidebarOpen ? (viewMode === 'mobile' ? '100%' : '240px') : '0',
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="sidebar"
        >
          <div className="sidebar-header">
            <span className="logo-text">JSONOTE</span>
            <button onClick={() => setIsSidebarOpen(false)} className="icon-btn mobile-only">
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-content scroll-area">
            <button className="new-note-btn" onClick={createNewNote}>
              <Plus size={18} />
              <span>새 노트</span>
            </button>

            <nav className="sidebar-nav">
              <div className="nav-group">
                <label>메뉴</label>
                <button
                  className={`nav-item ${activeTab === 'notes' && filterType === 'all' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('notes'); setFilterType('all'); if (viewMode === 'mobile') setIsSidebarOpen(false); }}
                >
                  <FileText size={16} />
                  <span>모든 노트</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('guide'); if (viewMode === 'mobile') setIsSidebarOpen(false); }}
                >
                  <Info size={16} />
                  <span>사용 가이드</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'mcp' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('mcp'); if (viewMode === 'mobile') setIsSidebarOpen(false); }}
                >
                  <Zap size={16} />
                  <span>MCP 도구</span>
                </button>
              </div>

              <div className="nav-group">
                <label>필터</label>
                <button
                  className={`nav-item ${activeTab === 'notes' && filterType === 'journal' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('notes'); setFilterType('journal'); if (viewMode === 'mobile') setIsSidebarOpen(false); }}
                >
                  <Star size={16} />
                  <span>저널</span>
                </button>
              </div>

              <div className="nav-group">
                <label>저장소</label>
                <div className="nav-item-static">
                  {storageConfig?.provider === 's3' ? <Cloud size={16} /> :
                    storageConfig?.provider === 'github' ? <Github size={16} /> : <HardDrive size={16} />}
                  <span className="truncate">{storageConfig?.provider?.toUpperCase() || 'LOCAL'}</span>
                </div>
              </div>
            </nav>
          </div>

          <div className="sidebar-footer">
            <button className="nav-item-minimal" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={16} />
              <span>설정</span>
            </button>
            <div className="toggle-row">
              <button onClick={toggleTheme} className="icon-btn-minimal">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={toggleViewMode} className="icon-btn-minimal">
                {viewMode === 'desktop' ? <Smartphone size={16} /> : <Monitor size={16} />}
              </button>
            </div>
          </div>
        </motion.aside>

        <main className="main-content">
          <header className="content-header">
            <div className="header-left">
              <button onClick={() => setIsSidebarOpen(true)} className={`icon-btn ${isSidebarOpen ? 'hidden' : ''}`}>
                <Menu size={20} />
              </button>
              <div className="breadcrumb desktop-only">
                <span className="current">{activeTab === 'notes' ? '노트 목록' : '사용 가이드'}</span>
              </div>
            </div>

            <div className="header-center desktop-only">
              {activeTab === 'notes' && (
                <div className="search-bar">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="header-right">
              {selectedIds.length > 0 ? (
                <div className="selection-actions">
                  <div
                    className={`checkbox-wrapper ${selectedIds.length === filteredNotes.length && filteredNotes.length > 0 ? 'checked' : ''}`}
                    onClick={toggleSelectAll}
                    title="전체 선택"
                  >
                    <div className="custom-checkbox" />
                    <span className="selection-count">{selectedIds.length}개 선택</span>
                  </div>
                  <div className="action-buttons">
                    <button className="text-btn danger" onClick={deleteSelectedNotes}>선택 삭제</button>
                    <button className="text-btn" onClick={() => setSelectedIds([])}>취소</button>
                  </div>
                </div>
              ) : null}
              {isSyncing && (
                <div className="sync-indicator">
                  <Cloud size={14} className="animate-spin" />
                  <span className="desktop-only">동기화 중...</span>
                </div>
              )}
            </div>
          </header>

          <div className="main-scroll-area scroll-area">
            <AnimatePresence mode="wait">
              {activeTab === 'notes' ? (
                <motion.section
                  key="notes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`notes-container ${viewMode === 'mobile' ? 'list-view' : 'grid-view'}`}
                >
                  <AnimatePresence initial={false}>
                    {filteredNotes.map((note) => (
                      <motion.div
                        key={note.metadata.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`note-card-flex ${selectedIds.includes(note.metadata.id) ? 'selected' : ''}`}
                        onClick={() => selectedIds.length > 0 ? toggleSelection(note.metadata.id, {} as any) : (setSelectedNote(note), setIsEditorOpen(true))}
                      >
                        <div
                          className={`checkbox-container ${selectedIds.includes(note.metadata.id) ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(note.metadata.id, e);
                          }}
                        >
                          <div className="custom-checkbox" />
                        </div>
                        <div className="note-card-main">
                          <div className="note-card-header">
                            <span className="type-label">{note.metadata.type.toUpperCase()}</span>
                          </div>
                          <h3 className="note-card-title">
                            {note.metadata.title || '제목 없음'} · <span className="filename-badge">{note.metadata.customFilename || note.metadata.id}.json</span>
                          </h3>
                          <p className="note-card-preview">{note.content || '내용 없음'}</p>
                          <div className="note-card-footer">
                            <span className="date">{format(new Date(note.metadata.updatedAt), 'yyyy-MM-dd')}</span>
                          </div>
                        </div>
                        {selectedIds.length === 0 && (
                          <button className="del-btn-card" onClick={(e) => deleteNote(note.metadata.id, e)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredNotes.length === 0 && (
                    <div className="empty-state">
                      <p>노트가 없습니다.</p>
                    </div>
                  )}
                </motion.section>
              ) : activeTab === 'guide' ? (
                <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GuideView />
                </motion.div>
              ) : activeTab === 'mcp' ? (
                <motion.div key="mcp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mcp-panel">
                  <div className="mcp-section">
                    <h2>인기 MCP 도구</h2>
                    <div className="mcp-presets">
                      {POPULAR_MCP_SERVERS.map(server => {
                        const isActive = storageConfig?.mcpServers?.some(s => s.id === server.id && s.enabled);
                        const isAdded = storageConfig?.mcpServers?.some(s => s.id === server.id);
                        return (
                          <div key={server.id} className="mcp-preset-card">
                            <div className="mcp-preset-header">
                              <Zap size={20} />
                              <h3>{server.name}</h3>
                            </div>
                            <p>{server.description}</p>
                            <button
                              className={`mcp-add-btn ${isActive ? 'active' : ''}`}
                              onClick={() => isAdded ? toggleMcpServer(server.id) : addMcpServer(server)}
                            >
                              {isActive ? '활성화됨' : isAdded ? '비활성화됨' : '추가'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mcp-section">
                    <h2>커스텀 MCP 서버 추가</h2>
                    <div className="mcp-custom-form">
                      <input
                        type="text"
                        placeholder="서버 이름 (예: My Custom MCP)"
                        value={customMcpName}
                        onChange={(e) => setCustomMcpName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="MCP 서버 URL (예: http://localhost:3000/sse)"
                        value={customMcpUrl}
                        onChange={(e) => setCustomMcpUrl(e.target.value)}
                      />
                      <button onClick={addCustomMcpServer} className="mcp-add-custom-btn">
                        추가
                      </button>
                    </div>
                    <div className="mcp-setup-guide">
                      <h3>💡 MCP 서버를 어떻게 실행하나요?</h3>
                      <p>
                        대부분의 MCP 서버(Notion, GitHub 등)는 기본적으로 <code>StdIO</code> 방식으로 작동합니다.
                        웹 앱인 JSONOTE에서 사용하려면 이를 <code>SSE</code>(HTTP) 방식으로 호스팅해야 합니다.
                      </p>
                      <div className="command-box">
                        <code>npx @modelcontextprotocol/inspector &lt;command&gt;</code>
                      </div>
                      <p className="mcp-hint">
                        <strong>Notion 예시:</strong><br />
                        1. Notion API 토큰을 발급받습니다.<br />
                        2. 터미널에서 실행: <code>NOTION_API_KEY=xxx npx @modelcontextprotocol/server-notion</code><br />
                        3. SSE 브리지(프록시)를 통해 URL을 얻은 후 위 '커스텀 MCP'에 등록하세요.
                      </p>
                    </div>
                  </div>
                  {storageConfig?.mcpServers && storageConfig.mcpServers.length > 0 && (
                    <div className="mcp-section">
                      <h2>내 MCP 도구</h2>
                      <div className="mcp-list">
                        {storageConfig.mcpServers.map(server => (
                          <div key={server.id} className={`mcp-item ${server.enabled ? 'enabled' : ''}`}>
                            <div className="mcp-info">
                              <strong>{server.name}</strong>
                              <small>{server.url}</small>
                            </div>
                            <div className="mcp-actions">
                              <button
                                className="mcp-test-btn"
                                onClick={async () => {
                                  try {
                                    const tools = await mcpClientManager.listTools(server.url);
                                    showToast(`${server.name}: 연결 성공! (${tools.length}개의 도구 발견)`, 'success');
                                  } catch (e) {
                                    showToast(`${server.name}: 연결 실패 - ${(e as Error).message}`, 'error');
                                  }
                                }}
                              >
                                테스트
                              </button>
                              <button onClick={() => toggleMcpServer(server.id)}>
                                {server.enabled ? '비활성화' : '활성화'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal config={storageConfig} onSave={handleSaveSettings} onClose={() => setIsSettingsOpen(false)} />
        )}
        {isEditorOpen && selectedNote && (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onDelete={deleteNote}
            onClose={() => { setIsEditorOpen(false); setSelectedNote(null); }}
            mcpServers={storageConfig?.mcpServers}
            storageConfig={storageConfig || undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
        isDanger={confirmState.isDanger}
      />

      <style jsx>{`
        .layout-container {
          height: 100vh;
          width: 100vw;
          background: var(--bg-primary);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .app-shell {
          display: flex;
          width: 100%;
          height: 100%;
          border: 1px solid var(--border-glass);
          position: relative;
          overflow: hidden;
        }

        .mobile-view .app-shell {
          width: 380px;
          height: 800px;
          border: none;
          box-shadow: 0 32px 80px rgba(0,0,0,0.8);
        }

        .sidebar {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          z-index: 100;
          height: 100%;
        }

        /* Mobile sidebar behavior */
        .mobile-view .sidebar,
        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: 20px 0 50px rgba(0,0,0,0.3);
          }
        }

        .sidebar-header {
          padding: 2.5rem 1.5rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-text {
          font-family: 'Outfit';
          font-weight: 900;
          font-size: 1.5rem;
          letter-spacing: -0.05em;
        }

        .sidebar-content {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .new-note-btn {
          width: 100%;
          padding: 1rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-transform: uppercase;
          font-size: 0.85rem;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-group label {
          font-size: 0.6rem;
          font-weight: 900;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding-left: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .nav-item.active {
          color: var(--text-primary);
          background: var(--bg-tertiary);
          text-decoration: underline;
        }

        .nav-item-static {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .nav-item-minimal {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .toggle-row {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn-minimal {
          padding: 0.6rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-glass);
          flex: 1;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          min-width: 0; /* Critical for flex stability */
          height: 100%;
        }

        .content-header {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--border-glass);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-center {
          flex: 1;
          max-width: 400px;
          margin: 0 1rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.5rem;
          border-bottom: 1px solid var(--border-glass);
        }

        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          width: 100%;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .selection-actions {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-right: 1.5rem;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          user-select: none;
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .text-btn.danger {
          background: #ff4444;
          color: #ffffff;
          font-weight: 900;
        }

        .text-btn {
          color: var(--text-primary);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-sm);
        }

        .checkbox-container {
          width: 60px; /* 고정 너비 */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .custom-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-glass); /* 항상 보이는 테두리 */
          border-radius: 4px;
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
        }

        .custom-checkbox:hover {
          border-color: var(--text-secondary);
        }

        .checked .custom-checkbox, .checkbox-container.checked .custom-checkbox {
          border-color: var(--text-primary);
          background: var(--text-primary);
        }

        .checked .custom-checkbox::after, .checkbox-container.checked .custom-checkbox::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 10px;
          border: solid var(--bg-primary); /* Checkmark color contrast with checkbox background */
          border-width: 0 2.5px 2.5px 0;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        }

        .note-card-flex {
          display: flex;
          flex-direction: row;
          align-items: stretch; /* 전체 높이에 맞춤 */
          gap: 0;
          background: transparent;
          border-bottom: 1px solid var(--border-glass);
          transition: var(--transition-fast);
          cursor: pointer;
        }

        .note-card-flex:hover {
          background: var(--bg-secondary);
        }

        .note-card-flex.selected {
          background: var(--bg-tertiary);
        }

        .note-card-main {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .type-label {
          font-size: 0.6rem;
          font-weight: 900;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .note-card-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filename-badge {
          background: var(--text-primary);
          color: var(--bg-primary);
          padding: 0.15rem 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 800;
          border-radius: 2px;
          letter-spacing: 0;
          text-transform: none;
        }

        .note-card-preview {
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .note-card-footer {
          margin-top: 0.5rem;
        }

        .date {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .selection-count {
          font-size: 0.75rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .sync-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .main-scroll-area {
          flex: 1;
          padding: 2.5rem 1.5rem;
          overflow-y: auto;
        }

        .mobile-view .main-scroll-area {
          padding: 1.5rem 1rem;
        }

        .notes-container {
          display: grid;
          gap: 1rem;
          width: 100%;
        }

        .grid-view { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
        .list-view { grid-template-columns: 1fr; }

        .note-card {
          padding: 1.5rem;
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          cursor: pointer;
        }

        .note-card:hover {
          border-color: var(--text-primary);
        }

        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .del-btn {
          padding: 0.4rem;
          color: var(--text-muted);
          transition: all 0.2s;
          border-radius: 4px;
        }

        .del-btn:hover {
          color: #ff4444;
          background: rgba(255, 68, 68, 0.1);
        }

        .del-btn-card {
          width: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .del-btn-card:hover {
          color: #ff4444;
          background: rgba(255, 68, 68, 0.1);
        }

        /* MCP Panel Styles */
        .mcp-panel {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .mcp-section {
          margin-bottom: 3rem;
        }

        .mcp-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .mcp-presets {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .mcp-preset-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .mcp-preset-card:hover {
          border-color: var(--text-primary);
        }

        .mcp-preset-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .mcp-preset-header h3 {
          font-size: 1.1rem;
          margin: 0;
        }

        .mcp-preset-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .mcp-add-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          font-weight: 700;
          transition: all 0.2s;
        }

        .mcp-add-btn:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
        }

        .mcp-add-btn.active {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .mcp-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mcp-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
        }

        .mcp-item.enabled {
          border-color: #22c55e;
        }

        .mcp-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mcp-info strong {
          font-size: 1rem;
        }

        .mcp-info small {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .mcp-actions {
          display: flex;
          gap: 0.5rem;
        }

        .mcp-item button {
          padding: 0.5rem 1rem;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          font-weight: 700;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .mcp-item button:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
        }

        .mcp-test-btn {
          background: transparent !important;
          color: var(--text-muted) !important;
        }

        .mcp-test-btn:hover {
          color: var(--text-primary) !important;
        }

        .mcp-custom-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mcp-custom-form input {
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 1rem;
        }

        .mcp-custom-form input:focus {
          outline: none;
          border-color: var(--text-primary);
        }

        .mcp-add-custom-btn {
          padding: 0.75rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 700;
          transition: all 0.2s;
        }

        .mcp-add-custom-btn:hover {
          opacity: 0.8;
        }

        .mcp-hint {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .mcp-hint a {
          color: var(--text-primary);
          text-decoration: underline;
        }

        .mcp-setup-guide {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(var(--accent-rgb), 0.05);
          border-radius: var(--radius-md);
          border: 1px dashed var(--border-glass);
        }

        .mcp-setup-guide h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mcp-setup-guide p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .command-box {
          background: #000;
          color: #0f0;
          padding: 1rem;
          border-radius: var(--radius-sm);
          font-family: 'Fira Code', monospace;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          overflow-x: auto;
        }

        .command-box code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .type-label {
          font-size: 0.6rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }

        .note-card-title {
          font-size: 1.25rem;
          font-weight: 900;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .note-card-preview {
          font-size: 0.95rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .note-card-footer {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: var(--text-muted);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.85rem;
        }

        .breadcrumb span {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.8rem;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .hidden { display: none; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .icon-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        @media (max-width: 640px) {
          .header-center { margin: 0 0.5rem; }
          .main-scroll-area { padding: 1.5rem 1rem; }
        }
      `}</style>
    </div>
  );
}
