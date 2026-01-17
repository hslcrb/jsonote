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
  HardDrive
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

  useEffect(() => {
    if (!storageConfig || !storageConfig.enabled) return;
    const interval = setInterval(() => handleSync(true), 120000);
    return () => clearInterval(interval);
  }, [storageConfig, notes]);

  const handleSaveNote = (updatedNote: Note) => {
    const newNotes = notes.find(n => n.metadata.id === updatedNote.metadata.id)
      ? notes.map(n => n.metadata.id === updatedNote.metadata.id ? updatedNote : n)
      : [...notes, updatedNote];
    setNotes(newNotes);
    localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));
    setIsEditorOpen(false);
    setSelectedNote(null);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 노트를 삭제하시겠습니까?')) {
      const newNotes = notes.filter(n => n.metadata.id !== id);
      setNotes(newNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));
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
    if (!storageConfig || !storageConfig.enabled) {
      if (!silent) setIsSettingsOpen(true);
      return;
    }
    const storage = getStorage(storageConfig);
    if (!storage) return;
    if (!silent) setIsSyncing(true);
    try {
      for (const note of notes) await storage.saveNote(note);
      const resynced = await storage.fetchNotes();
      setNotes(resynced);
      localStorage.setItem('jsonote_notes', JSON.stringify(resynced));
      if (!silent) alert('동기화 완료');
    } catch (e) {
      if (!silent) alert('동기화 실패');
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  const handleSaveSettings = (config: StorageConfig) => {
    setStorageConfig(config);
    localStorage.setItem('jsonote_storage_config', JSON.stringify(config));
    setIsSettingsOpen(false);
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
              <button className="sync-btn" onClick={() => handleSync()} disabled={isSyncing}>
                <Cloud size={16} className={isSyncing ? 'animate-spin' : ''} />
                <span className="desktop-only">{isSyncing ? '동기화 중' : '동기화'}</span>
              </button>
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
                        className="note-card"
                        onClick={() => { setSelectedNote(note); setIsEditorOpen(true); }}
                      >
                        <div className="note-card-header">
                          <span className="type-label">{note.metadata.type.toUpperCase()}</span>
                          <button className="del-btn" onClick={(e) => deleteNote(note.metadata.id, e)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h3 className="note-card-title">{note.metadata.title || '제목 없음'}</h3>
                        <p className="note-card-preview">{note.content || '내용 없음'}</p>
                        <div className="note-card-footer">
                          <span className="date">{format(new Date(note.metadata.updatedAt), 'yyyy-MM-dd')}</span>
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
        }

        .mobile-view .app-shell {
          width: 380px;
          height: 800px;
          border: 2px solid var(--text-primary);
        }

        .sidebar {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
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
          gap: 2rem;
        }

        .new-note-btn {
          width: 100%;
          padding: 0.8rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-transform: uppercase;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .nav-group label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .nav-item.active {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .nav-item-static {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item-minimal {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .toggle-row {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn-minimal {
          padding: 0.5rem;
          color: var(--text-muted);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .content-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--border-glass);
        }

        .header-center {
          flex: 1;
          max-width: 400px;
          margin: 0 2rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-bottom: 1px solid var(--border-glass);
        }

        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          width: 100%;
        }

        .sync-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .main-scroll-area {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .notes-container {
          display: grid;
          gap: 1rem;
        }

        .grid-view { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
        .list-view { grid-template-columns: 1fr; }

        .note-card {
          padding: 1.5rem;
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .note-card-title {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .note-card-preview {
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .note-card-footer {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .empty-state {
          padding: 4rem;
          text-align: center;
          color: var(--text-muted);
        }

        .breadcrumb span {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .hidden { display: none; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>
    </div>
  );
}
