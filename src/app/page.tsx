'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Github,
  Settings,
  FileText,
  Star,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Hash,
  Trash2,
  Cloud,
  Info,
  HardDrive,
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { Note, NoteType, StorageConfig } from '@/types/note';
import NoteEditor from '@/components/NoteEditor';
import SettingsModal from '@/components/SettingsModal';
import GuideView from '@/components/GuideView';
import { getStorage } from '@/lib/storage';

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
  const [activeTab, setActiveTab] = useState<'notes' | 'guide'>('notes');

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

  useEffect(() => {
    if (!storageConfig || !storageConfig.enabled) return;
    handleSync(true);
    const interval = setInterval(() => handleSync(true), 60000);
    return () => clearInterval(interval);
  }, [storageConfig]);

  const handleSaveNote = async (updatedNote: Note) => {
    const newNotes = notes.find(n => n.metadata.id === updatedNote.metadata.id)
      ? notes.map(n => n.metadata.id === updatedNote.metadata.id ? updatedNote : n)
      : [...notes, updatedNote];
    setNotes(newNotes);
    localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));
    setIsEditorOpen(false);
    setSelectedNote(null);

    if (storageConfig?.enabled) {
      await handleSync(true);
    }
  };

  const deleteNote = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const noteToDelete = notes.find(n => n.metadata.id === id);
    if (!noteToDelete) return;

    if (confirm('이 노트를 삭제하시겠습니까?')) {
      const newNotes = notes.filter(n => n.metadata.id !== id);
      setNotes(newNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));

      if (storageConfig?.enabled) {
        const storage = getStorage(storageConfig);
        if (storage) {
          setIsSyncing(true);
          try {
            await storage.deleteNote(noteToDelete);
          } catch (e) {
            console.error('Delete failed:', e);
          } finally {
            setIsSyncing(false);
          }
        }
      }
    }
  };

  const deleteSelectedNotes = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`${selectedIds.length}개의 노트를 삭제하시겠습니까?`)) {
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
      } catch (e) {
        console.error('Bulk delete failed:', e);
      } finally {
        setIsSyncing(false);
      }
    }
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
    // 최신 설정을 가져오기 위해 직접 localStorage 확인 (상태 업데이트 지연 방지)
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
      // 현재 메모리에 있는 최신 노트들 업로드
      const currentNotes = JSON.parse(localStorage.getItem('jsonote_notes') || '[]');
      for (const note of currentNotes) {
        await storage.saveNote(note);
      }

      // 서버의 최신 데이터와 병합하여 가져오기
      const resynced = await storage.fetchNotes();

      // 로컬 스토리지 및 상태 업데이트
      setNotes(resynced);
      localStorage.setItem('jsonote_notes', JSON.stringify(resynced));

      if (!silent) alert('동기화 완료');
    } catch (e: any) {
      console.error('동기화 상세 오류:', e);
      if (!silent) alert(`동기화 실패: ${e?.message || '알 수 없는 오류'}`);
    } finally {
      if (!silent) setIsSyncing(false);
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
              {isSelectionMode ? (
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
                    <button className="text-btn" onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }}>취소</button>
                  </div>
                </div>
              ) : (
                <button className="icon-btn-minimal" onClick={() => setIsSelectionMode(true)} title="선택 모드">
                  <CheckSquare size={18} />
                </button>
              )}
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
                        onClick={() => isSelectionMode ? toggleSelection(note.metadata.id, {} as any) : (setSelectedNote(note), setIsEditorOpen(true))}
                      >
                        {isSelectionMode && (
                          <div
                            className={`checkbox-container ${selectedIds.includes(note.metadata.id) ? 'checked' : ''}`}
                            onClick={(e) => toggleSelection(note.metadata.id, e)}
                          >
                            <div className="custom-checkbox" />
                          </div>
                        )}
                        <div className="note-card-main">
                          <div className="note-card-header">
                            <span className="type-label">{note.metadata.type.toUpperCase()}</span>
                            {!isSelectionMode && (
                              <button className="del-btn" onClick={(e) => deleteNote(note.metadata.id, e)}>
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <h3 className="note-card-title">{note.metadata.title || '제목 없음'}</h3>
                          <p className="note-card-preview">{note.content || '내용 없음'}</p>
                          <div className="note-card-footer">
                            <span className="date">{format(new Date(note.metadata.updatedAt), 'yyyy-MM-dd')}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredNotes.length === 0 && (
                    <div className="empty-state">
                      <p>노트가 없습니다.</p>
                    </div>
                  )}
                </motion.section>
              ) : (
                <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GuideView />
                </motion.div>
              )}
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
            onClose={() => { setIsEditorOpen(false); setSelectedNote(null); }}
          />
        )}
      </AnimatePresence>

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
        }

        .checkbox-container {
          padding: 1.5rem 0 1.5rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-glass);
          border-radius: 4px;
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
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
          border: solid var(--bg-primary);
          border-width: 0 2.5px 2.5px 0;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        }

        .note-card-flex {
          display: flex;
          align-items: stretch;
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
