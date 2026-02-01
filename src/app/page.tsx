'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Settings, Search, Trash2, Menu, Info, Star, Cloud, Github, HardDrive, Sun, Moon, Monitor, Smartphone, LinkIcon, Zap, X, Table, Layout, ChevronRight, ChevronDown, HardHat, CheckCircle, Database } from 'lucide-react';
import { format } from 'date-fns';
import { Note, NoteType, StorageConfig } from '@/types/note';
import NoteEditor from '@/components/NoteEditor';
import SettingsModal from '@/components/SettingsModal';
import GuideView from '@/components/GuideView';
import { getStorage } from '@/lib/storage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import PromptDialog from '@/components/PromptDialog';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [isWarmMode, setIsWarmMode] = useState(false);
  const [warmIntensity, setWarmIntensity] = useState(30);

  const [filterType, setFilterType] = useState<NoteType | 'all'>('all');
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'guide'>('notes');
  const [currentView, setCurrentView] = useState<'list' | 'table' | 'board'>('list');
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const savedNotes = localStorage.getItem('jsonote_notes');
    const savedConfig = localStorage.getItem('jsonote_storage_config');
    const savedTheme = localStorage.getItem('jsonote_theme') as 'dark' | 'light';
    const savedWarm = localStorage.getItem('jsonote_warm') === 'true';
    const savedIntensity = localStorage.getItem('jsonote_warm_intensity');

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedConfig) setStorageConfig(JSON.parse(savedConfig));
    if (savedTheme) setTheme(savedTheme || 'dark');
    setIsWarmMode(savedWarm);
    if (savedIntensity) setWarmIntensity(parseInt(savedIntensity));

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
    localStorage.setItem('jsonote_warm', isWarmMode.toString());
    localStorage.setItem('jsonote_warm_intensity', warmIntensity.toString());
  }, [isWarmMode, warmIntensity]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Recursive Tree Rendering Function / 계층 구조 렌더링 함수
  const renderNoteTree = (parentId: string | null = null, level: number = 0) => {
    const children = notes.filter(n => (n.metadata.parentId || null) === parentId);

    if (children.length === 0 && level > 0) return null;

    return (
      <div className="tree-level" style={{ paddingLeft: level > 0 ? '1rem' : '0' }}>
        {children.map(note => {
          const hasChildren = notes.some(n => n.metadata.parentId === note.metadata.id);
          const isExpanded = expandedFolderIds.includes(note.metadata.id);

          return (
            <div key={note.metadata.id} className="tree-item-group">
              <div
                className={`tree-item ${selectedNote?.metadata.id === note.metadata.id ? 'active' : ''}`}
                onClick={() => { setSelectedNote(note); setIsEditorOpen(true); }}
              >
                <div
                  className="expander"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFolderIds(prev =>
                      isExpanded ? prev.filter(id => id !== note.metadata.id) : [...prev, note.metadata.id]
                    );
                  }}
                >
                  {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span style={{ width: 14 }} />}
                </div>
                <FileText size={14} />
                <span className="truncate">{note.metadata.title || '제목 없음'}</span>
              </div>
              {isExpanded && renderNoteTree(note.metadata.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

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

  const [promptState, setPromptState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    defaultValue: '',
    onConfirm: () => { }
  });

  const closePrompt = () => setPromptState(prev => ({ ...prev, isOpen: false }));

  const showPrompt = (title: string, message: string, defaultValue: string, onConfirm: (value: string) => void) => {
    setPromptState({
      isOpen: true,
      title,
      message,
      defaultValue,
      onConfirm: (value: string) => {
        onConfirm(value);
        closePrompt();
      }
    });
  };

  useEffect(() => {
    if (!storageConfig || !storageConfig.enabled) return;
    handleSync(true);
    const interval = setInterval(() => handleSync(true), 60000);
    return () => clearInterval(interval);
  }, [storageConfig]);

  const handleSaveNote = async (updatedNote: Note) => {
    // 1. Immediately update local state / 1. 로컬 상태 즉시 업데이트
    const newNotes = notes.map(n => n.metadata.id === updatedNote.metadata.id ? updatedNote : n);
    if (!notes.find(n => n.metadata.id === updatedNote.metadata.id)) {
      newNotes.push(updatedNote); // New note support
    }

    setNotes(newNotes);
    localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));

    // Update selected state for editor sync and list refresh / 에디터 상태 동기화 및 UI 목록 갱신을 위해 선택된 상태 업데이트
    setSelectedNote(updatedNote);

    // 2. Direct push to remote repository / 2. 원격 저장소에 즉시 다이렉트 푸시
    if (storageConfig?.enabled) {
      const storage = getStorage(storageConfig);
      if (storage) {
        try {
          await storage.saveNote(updatedNote);
          console.log('Remote save successful');
        } catch (error) {
          console.error('Remote save failed:', error);
          showToast('원격 저장소 반영에 실패했습니다. 네트워크를 확인하세요.', 'error');
          // Don't throw error - local save succeeded, so editor proceeds / 에러를 throw하지 않음 - 로컬 저장은 성공했으므로 편집기는 정상 진행
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

  const createNewNote = (type: NoteType = 'general') => {
    const newNote: Note = {
      metadata: {
        id: Math.random().toString(36).substr(2, 9),
        title: type === 'todo' ? t('editor.syntax.todo') : type === 'database' ? t('views.table') : t('editor.untitled'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: type,
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
      // 1. Fetch latest data from remote repository / 1. 원격 저장소에서 최신 데이터 가져오기 (리모트 삭제 반영을 위함)
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
      if (!silent) showToast(t('settings.success'), 'success');
    } catch (error) {
      console.error('Sync failed:', error);
      if (!silent) showToast(t('settings.fail'), 'error');
    } finally {
      if (!silent || isSyncing) setIsSyncing(false);
    }
  };

  const handleSaveSettings = (config: StorageConfig) => {
    setStorageConfig(config);
    localStorage.setItem('jsonote_storage_config', JSON.stringify(config));
    setIsSettingsOpen(false);
    // Trigger sync immediately after saving settings / 설정 저장 즉시 동기화 트리거
    setTimeout(() => handleSync(true), 1000);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleWarmMode = () => setIsWarmMode(prev => !prev);

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || n.metadata.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className={`layout-container`}>
      {isWarmMode && (
        <div
          className="warm-overlay"
          style={{
            backgroundColor: `rgba(255, 160, 0, ${(warmIntensity / 100) * 0.38})`,
            filter: `saturate(${100 + warmIntensity * 0.8}%) sepia(${warmIntensity * 0.25}%) brightness(${100 - warmIntensity * 0.03}%)`
          }}
        />
      )}
      <div className="app-shell">
        <motion.aside
          initial={false}
          animate={{
            width: isSidebarOpen ? '240px' : '0',
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="sidebar"
        >
          <div className="sidebar-header">
            <img src="/logo.svg" alt="JSONOTE Logo" style={{ height: '32px', filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
            <button onClick={() => setIsSidebarOpen(false)} className="icon-btn mobile-only">
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-content scroll-area">
            <div className="new-actions">
              <button className="new-note-btn primary" onClick={() => createNewNote('general')}>
                <Plus size={18} />
                <span>{t('sidebar.new_page')}</span>
              </button>
              <div className="new-grid">
                <button className="new-sub-btn" onClick={() => createNewNote('todo')}>
                  <CheckCircle size={14} /> <span>투두</span>
                </button>
                <button className="new-sub-btn" onClick={() => createNewNote('database')}>
                  <Database size={14} /> <span>DB</span>
                </button>
              </div>
            </div>
            <nav className="sidebar-nav">
              <div className="nav-group">
                <label>메뉴</label>
                <button
                  className={`nav-item ${activeTab === 'notes' && filterType === 'all' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('notes'); setFilterType('all'); }}
                >
                  <FileText size={16} />
                  <span>{t('sidebar.notes')}</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`}
                  onClick={() => setActiveTab('guide')}
                >
                  <Info size={16} />
                  <span>{t('sidebar.guide')}</span>
                </button>
              </div>

              <div className="nav-group">
                <label>워크스페이스</label>
                <div className="tree-container">
                  {renderNoteTree(null)}
                </div>
              </div>

              <div className="nav-group">
                <label>필터</label>
                <button
                  className={`nav-item ${activeTab === 'notes' && filterType === 'journal' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('notes'); setFilterType('journal'); }}
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
              <span>{t('sidebar.settings')}</span>
            </button>
            <div className="toggle-row">
              <div className="language-switcher-mini">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="lang-select-minimal"
                >
                  <option value="en">🇺🇸 EN</option>
                  <option value="ko">🇰🇷 KO</option>
                  <option value="ja">🇯🇵 JA</option>
                </select>
              </div>
              <button onClick={toggleTheme} className="icon-btn-minimal" title="테마 전환">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={toggleWarmMode} className={`icon-btn-minimal ${isWarmMode ? 'active' : ''}`} title="나이트 모드 (블루라이트 차단)">
                <Zap size={16} />
              </button>
            </div>
            <div className={`warm-control-panel ${isWarmMode ? 'active' : ''}`}>
              <div className="intensity-row">
                <div className="intensity-label">차단 강도</div>
                <div className="intensity-value">{warmIntensity}%</div>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={warmIntensity}
                onChange={(e) => setWarmIntensity(parseInt(e.target.value))}
                className="warm-slider"
              />
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
                <span className="current">{activeTab === 'notes' ? t('sidebar.notes') : t('sidebar.guide')}</span>
              </div>
            </div>

            <div className="header-center desktop-only">
              {activeTab === 'notes' && (
                <div className="search-bar">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={`${t('sidebar.search')}...`}
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
                  <span className="desktop-only">{t('editor.save_status.saving')}</span>
                </div>
              )}
            </div>
          </header>

          <div className="main-scroll-area scroll-area">
            <AnimatePresence mode="wait">
              {activeTab === 'notes' ? (
                <motion.section
                  key="notes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="notes-container"
                >
                  <div className="view-header">
                    <div className="view-switcher">
                      <button className={currentView === 'list' ? 'active' : ''} onClick={() => setCurrentView('list')}><Menu size={14} /> {t('views.list')}</button>
                      <button className={currentView === 'table' ? 'active' : ''} onClick={() => setCurrentView('table')}><Table size={14} /> {t('views.table')}</button>
                      <button className={currentView === 'board' ? 'active' : ''} onClick={() => setCurrentView('board')}><Layout size={14} /> {t('views.board')}</button>
                    </div>
                  </div>

                  {currentView === 'list' ? (
                    <div className="notes-list-view">
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
                    </div>
                  ) : currentView === 'table' ? (
                    <div className="table-view-container">
                      <table className="notion-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}><div className="custom-checkbox" /></th>
                            <th style={{ width: '300px' }}>{t('table.name')}</th>
                            <th style={{ width: '120px' }}>{t('table.type')}</th>
                            <th style={{ width: '200px' }}>{t('table.tags')}</th>
                            <th style={{ width: '150px' }}>{t('table.updated')}</th>
                            <th style={{ width: '100px' }}>{t('table.actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredNotes.map(note => (
                            <tr key={note.metadata.id} onClick={() => { setSelectedNote(note); setIsEditorOpen(true); }}>
                              <td><div className={`custom-checkbox ${selectedIds.includes(note.metadata.id) ? 'checked' : ''}`} /></td>
                              <td><div className="table-cell-title"><FileText size={14} /> {note.metadata.title}</div></td>
                              <td><span className="type-badge">{note.metadata.type}</span></td>
                              <td><div className="table-tags">{note.metadata.tags.map(t => <span key={t} className="tag">{t}</span>)}</div></td>
                              <td>{format(new Date(note.metadata.updatedAt), 'MM-dd HH:mm')}</td>
                              <td>
                                <button className="icon-btn-sm" onClick={(e) => { e.stopPropagation(); deleteNote(note.metadata.id); }}>
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr className="add-row" onClick={() => createNewNote('database')}>
                            <td colSpan={6}>
                              <Plus size={14} /> {t('table.add_row')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : currentView === 'board' ? (
                    <div className="board-view-container">
                      {['general', 'todo', 'database', 'task', 'meeting', 'journal', 'code'].map(type => (
                        <div key={type} className="board-column">
                          <div className="column-header">
                            <span className="column-title">{type.toUpperCase()}</span>
                            <span className="column-count">{filteredNotes.filter(n => n.metadata.type === type).length}</span>
                            <button className="add-board-item" onClick={() => createNewNote(type as NoteType)}><Plus size={14} /></button>
                          </div>
                          <div className="board-cards">
                            {filteredNotes.filter(n => n.metadata.type === type).map(note => (
                              <div key={note.metadata.id} className="board-card" onClick={() => { setSelectedNote(note); setIsEditorOpen(true); }}>
                                <h4>{note.metadata.title}</h4>
                                <div className="card-meta">
                                  {note.metadata.tags.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                                </div>
                                <div className="card-footer">
                                  <span className="type-badge-mini">{note.metadata.type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {filteredNotes.length === 0 && (
                    <div className="empty-state">
                      <p>{t('sidebar.no_results')}</p>
                    </div>
                  )}
                </motion.section>
              ) : activeTab === 'guide' ? (
                <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GuideView />
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
          <div className="inline-editor-backdrop" onClick={() => setIsEditorOpen(false)}>
            <div className="inline-editor-container" onClick={e => e.stopPropagation()}>
              <NoteEditor
                note={selectedNote}
                onSave={handleSaveNote}
                onDelete={deleteNote}
                onClose={() => { setIsEditorOpen(false); setSelectedNote(null); }}
                storageConfig={storageConfig || undefined}
                allNotes={notes}
                showToast={showToast}
                showConfirm={showConfirm}
                showPrompt={showPrompt}
              />
            </div>
          </div>
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

      <PromptDialog
        isOpen={promptState.isOpen}
        title={promptState.title}
        message={promptState.message}
        defaultValue={promptState.defaultValue}
        onConfirm={promptState.onConfirm}
        onCancel={closePrompt}
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
          font-family: 'Nanum Gothic';
          font-weight: 900;
          font-size: 1.5rem;
          letter-spacing: -0.05em;
        }

        .sidebar-content {
          flex: 1;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
        }

        .new-actions {
          margin: 0 1rem 2.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .new-note-btn {
          width: 100%;
          padding: 0.85rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          transition: var(--transition-fast);
        }

        .new-note-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .new-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .new-sub-btn {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: var(--transition-fast);
        }

        .new-sub-btn:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          margin-bottom: 2.5rem;
        }

        .icon-btn-sm {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: var(--text-muted);
          transition: var(--transition-fast);
        }

        .icon-btn-sm:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .type-badge-mini {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .nav-group label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding-left: 1rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          margin: 0 0.5rem;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: var(--radius-full);
          transition: var(--transition-fast);
        }

        .nav-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-item.active {
          color: var(--text-primary);
          background: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
          font-weight: 800;
        }

        .nav-item.disabled {
          display: none;
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
          border-radius: var(--radius-full);
          flex: 1;
          transition: var(--transition-fast);
        }

        .icon-btn-minimal:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          min-width: 0; /* Critical for flex stability */
          height: 100%;
          position: relative; /* For inline editor positioning */
        }

        .inline-editor-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .inline-editor-container {
          width: 100%;
          height: 95%;
          background: var(--bg-primary);
          border-top-left-radius: var(--radius-lg);
          border-top-right-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 -20px 50px rgba(0,0,0,0.4);
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
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          border-radius: 99px;
          transition: all 0.2s;
        }

        .search-bar:focus-within {
          border-color: var(--text-secondary);
          background: var(--bg-tertiary);
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
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-glass);
          font-weight: 700;
        }

        .text-btn.danger:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
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
          padding: 0;
        }
        .mobile-view .notes-container {
          padding: 1rem;
        }

        .notes-container {
          padding: 2.5rem;
          max-width: 1000px;
          margin: 0 auto;
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
          color: var(--text-primary);
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
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
          color: var(--text-primary);
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
        }

        .del-btn-small:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }

        /* Tree Sidebar Styles */
        .tree-container {
          padding: 0;
        }
        .tree-level {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .tree-item-group {
          display: flex;
          flex-direction: column;
        }
        .tree-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          margin: 0.1rem 0.5rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }
        .tree-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .tree-item.active {
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-weight: 700;
          box-shadow: var(--shadow-sm);
        }
        .expander {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }
        .expander:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Database View Styles */
        .view-header {
          padding-bottom: 0.75rem;
          margin-bottom: 1rem;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .view-switcher {
          display: flex;
          gap: 0.5rem;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: 8px;
        }
        .view-switcher button {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          border-radius: 6px;
          color: var(--text-muted);
        }
        .view-switcher button.active {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        /* Table View */
        .table-view-container {
          overflow-x: auto;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-glass);
          width: 100%;
        }
        .notion-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .notion-table th {
          text-align: left;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-glass);
          color: var(--text-muted);
          font-weight: 600;
        }
        .notion-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-glass);
          cursor: pointer;
        }
        .notion-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .table-cell-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }
        .type-badge {
          padding: 2px 6px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        /* Board View */
        .board-view-container {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          padding-bottom: 1rem;
          width: 100%;
        }
        .board-column {
          flex: 0 0 300px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
        }
        .column-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .board-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .board-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .board-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
          border-color: var(--text-primary);
        }
        .board-card h4 {
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .type-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .note-card-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .note-card-preview {
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.6;
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

        .warm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 9999;
          transition: background 0.4s ease-out, filter 0.4s ease-out;
        }

        .icon-btn-minimal.active {
          color: var(--text-primary);
        }

        .warm-control-panel {
          max-height: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .warm-control-panel.active {
          max-height: 80px;
          opacity: 1;
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-glass);
        }

        .intensity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .intensity-label {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .intensity-value {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .warm-slider {
          width: 100%;
          cursor: pointer;
          accent-color: var(--text-primary);
          height: 4px;
          -webkit-appearance: none;
          background: var(--bg-tertiary);
          border-radius: 2px;
          outline: none;
        }

        .warm-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: var(--text-primary);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid var(--bg-primary);
        }
        @media (max-width: 640px) {
          .header-center { margin: 0 0.5rem; }
          .main-scroll-area { padding: 1.5rem 1rem; }
        }

        .language-switcher-mini {
          display: flex;
          align-items: center;
        }

        .lang-select-minimal {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          font-family: inherit;
          text-transform: uppercase;
        }

        .lang-select-minimal:hover {
          border-color: var(--text-secondary);
          color: var(--text-primary);
        }

        .lang-select-minimal option {
          background: var(--bg-primary);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
