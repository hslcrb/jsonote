'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Github,
  Settings,
  Folder,
  FileText,
  Clock,
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
  Type,
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

  // States: Theme & Device View & Main content tab
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'notes' | 'guide'>('notes');

  // Load persistence
  useEffect(() => {
    const savedNotes = localStorage.getItem('jsonote_notes');
    const savedConfig = localStorage.getItem('jsonote_storage_config');
    const savedTheme = localStorage.getItem('jsonote_theme') as 'dark' | 'light';
    const savedView = localStorage.getItem('jsonote_view') as 'desktop' | 'mobile';

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedConfig) setStorageConfig(JSON.parse(savedConfig));
    if (savedTheme) setTheme(savedTheme);
    if (savedView) setViewMode(savedView);

    if (!savedNotes) {
      const mockNotes: Note[] = [
        {
          metadata: {
            id: '1',
            title: 'Project jsonote Vision',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'general',
            tags: ['vision', 'jsonote'],
          },
          content: 'Building the ultimate JSON-based note taking app with GitHub integration.',
        }
      ];
      setNotes(mockNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(mockNotes));
    }
  }, []);

  // Theme & View effects
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jsonote_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jsonote_view', viewMode);
  }, [viewMode]);

  // Auto-sync
  useEffect(() => {
    if (!storageConfig || !storageConfig.enabled) return;
    const interval = setInterval(() => handleSync(true), 120000); // Poll every 2 mins
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
    if (confirm('정말 이 노트를 삭제하시겠습니까?')) {
      const newNotes = notes.filter(n => n.metadata.id !== id);
      setNotes(newNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));
    }
  };

  const createNewNote = () => {
    const newNote: Note = {
      metadata: {
        id: Math.random().toString(36).substr(2, 9),
        title: '제목 없는 노트',
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
    if (!storage) {
      if (!silent) alert('지원되지 않는 저장소 방식입니다.');
      return;
    }

    if (!silent) setIsSyncing(true);
    try {
      // Step 1: Push local updates to remote
      for (const note of notes) {
        await storage.saveNote(note);
      }

      // Step 2: Fetch latest from remote
      const resynced = await storage.fetchNotes();
      setNotes(resynced);
      localStorage.setItem('jsonote_notes', JSON.stringify(resynced));

      if (!silent) alert('동기화가 성공적으로 완료되었습니다!');
    } catch (e) {
      console.error('Sync error:', e);
      if (!silent) alert('동기화 중 오류가 발생했습니다.');
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
      <div className="app-shell shadow-2xl">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: isSidebarOpen ? (viewMode === 'mobile' ? '100%' : '280px') : '0',
            x: isSidebarOpen ? 0 : (viewMode === 'mobile' ? '-100%' : -280),
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="sidebar"
        >
          <div className="sidebar-header">
            <div className="logo-container">
              <div className="logo-icon">J</div>
              <span className="logo-text">jsonote</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="icon-btn mobile-only">
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-content scroll-area">
            <button className="new-note-btn" onClick={createNewNote}>
              <Plus size={20} />
              <span>새 노트 작성</span>
            </button>

            <nav className="sidebar-nav">
              <div className="nav-group">
                <label>Main</label>
                <button
                  className={`nav-item ${activeTab === 'notes' && filterType === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('notes');
                    setFilterType('all');
                    if (viewMode === 'mobile') setIsSidebarOpen(false);
                  }}
                >
                  <FileText size={18} />
                  <span>모든 노트</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('guide');
                    if (viewMode === 'mobile') setIsSidebarOpen(false);
                  }}
                >
                  <Info size={18} />
                  <span>소개 및 가이드</span>
                </button>
              </div>

              <div className="nav-group">
                <label>Favorites</label>
                <button
                  className={`nav-item ${activeTab === 'notes' && filterType === 'journal' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('notes');
                    setFilterType('journal');
                    if (viewMode === 'mobile') setIsSidebarOpen(false);
                  }}
                >
                  <Star size={18} />
                  <span>저널</span>
                </button>
              </div>

              <div className="nav-group">
                <label>Storage</label>
                <div className="nav-item-static">
                  {storageConfig?.provider === 's3' ? <Cloud size={18} /> :
                    storageConfig?.provider === 'github' ? <Github size={18} /> : <HardDrive size={18} />}
                  <span className="truncate">{storageConfig?.provider?.toUpperCase() || 'Local'}</span>
                  <span className="badge">{notes.length}</span>
                </div>
              </div>
            </nav>
          </div>

          <div className="sidebar-footer">
            <button className="nav-item" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={18} />
              <span>설정</span>
            </button>
            <div className="toggle-group">
              <button
                onClick={toggleTheme}
                className="icon-btn"
                title={theme === 'dark' ? '라이트 모드로 변경' : '다크 모드로 변경'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={toggleViewMode}
                className="icon-btn"
                title={viewMode === 'desktop' ? '모바일 뷰 시뮬레이션' : '데스크탑 뷰'}
              >
                {viewMode === 'desktop' ? <Smartphone size={18} /> : <Monitor size={18} />}
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="content-header">
            <div className="header-left">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`icon-btn ${isSidebarOpen ? 'hidden' : ''}`}
              >
                <Menu size={20} />
              </button>
              <div className="breadcrumb desktop-only">
                <span className="text-muted">Workspace</span>
                <ChevronRight size={14} className="text-muted" />
                <span className="current">{activeTab === 'notes' ? 'Notes' : 'User Guide'}</span>
              </div>
            </div>

            <div className="header-center desktop-only">
              {activeTab === 'notes' && (
                <div className="search-bar">
                  <Search size={18} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Search notes, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="header-right">
              <button
                className={`sync-btn ${isSyncing ? 'animate-pulse' : ''}`}
                onClick={() => handleSync()}
                disabled={isSyncing}
                title="데이터 동기화"
              >
                <Cloud size={18} className={isSyncing ? 'animate-spin' : ''} />
                <span className="desktop-only">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
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
                  transition={{ duration: 0.2 }}
                  className={`notes-container ${viewMode === 'mobile' ? 'list-view' : 'grid-view'}`}
                >
                  <AnimatePresence initial={false}>
                    {filteredNotes.map((note) => (
                      <motion.div
                        key={note.metadata.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="note-card"
                        onClick={() => {
                          setSelectedNote(note);
                          setIsEditorOpen(true);
                        }}
                      >
                        <div className="note-card-header">
                          <div className={`type-tag type-${note.metadata.type}`}>
                            <Hash size={10} />
                            {note.metadata.type === 'general' ? 'General' :
                              note.metadata.type === 'meeting' ? 'Meeting' :
                                note.metadata.type === 'task' ? 'To-do' :
                                  note.metadata.type === 'journal' ? 'Journal' : 'Code'}
                          </div>
                          <button className="del-btn-minimal" onClick={(e) => deleteNote(note.metadata.id, e)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h3 className="note-card-title">{note.metadata.title || 'Untitled Note'}</h3>
                        <p className="note-card-preview">{note.content || 'No content yet...'}</p>
                        <div className="note-card-footer">
                          <span className="date">
                            {format(new Date(note.metadata.updatedAt), 'MMM dd')}
                          </span>
                          <div className="tags">
                            {note.metadata.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="tag">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredNotes.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon-box">
                        <FileText size={48} />
                      </div>
                      <p>No notes found matching your search.</p>
                      <button className="new-note-btn-minimal" onClick={createNewNote}>
                        Create your first note
                      </button>
                    </div>
                  )}
                </motion.section>
              ) : (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <GuideView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            config={storageConfig}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
          />
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
          overflow: hidden;
          background-color: var(--bg-primary);
          transition: background-color 0.4s ease;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* App Shell - The core container */
        .app-shell {
          display: flex;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Desktop Mode: Full Screen */
        .desktop-view .app-shell {
          width: 100%;
          height: 100%;
        }

        /* Mobile Simulation Mode: Phone Frame */
        .mobile-view {
          background-color: #08080a;
          background-image: 
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
        }

        .mobile-view .app-shell {
          width: 420px;
          height: 880px;
          max-height: 90vh;
          border-radius: 48px;
          border: 8px solid #1a1a1c;
          box-shadow: 
            0 50px 100px -20px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          margin: auto;
        }

        /* Sidebar Styling */
        .sidebar {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-glass);
          z-index: 100;
          overflow: hidden;
        }

        .mobile-view .sidebar {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 200;
          border-right: none;
          box-shadow: 20px 0 50px rgba(0,0,0,0.5);
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--accent-gradient);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-family: 'Outfit';
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .logo-text {
          font-size: 1.4rem;
          font-weight: 800;
          font-family: 'Outfit';
          letter-spacing: -0.01em;
          background: linear-gradient(to bottom, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-content {
          flex: 1;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          overflow-y: auto;
        }

        .new-note-btn {
          width: 100%;
          padding: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-weight: 700;
          color: white;
          background: var(--accent-gradient);
          border-radius: 14px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .new-note-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .nav-group label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          padding-left: 1rem;
          margin-bottom: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.9rem 1.1rem;
          border-radius: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.03);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-primary);
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
        }

        .badge {
          margin-left: auto;
          font-size: 0.75rem;
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          color: var(--text-muted);
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border-glass);
          background: rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .toggle-group {
          display: flex;
          padding: 0.3rem;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          gap: 0.3rem;
        }

        .toggle-group button {
          flex: 1;
          height: 36px;
          border-radius: 9px;
        }

        /* Main Content Styling */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-width: 0;
          background: var(--bg-primary);
          position: relative;
        }

        .content-header {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(10, 10, 12, 0.8);
          backdrop-filter: blur(20px);
          z-index: 50;
        }

        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .breadcrumb span {
          color: var(--text-muted);
        }

        .breadcrumb span.current {
          color: var(--text-primary);
          font-weight: 700;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 1.25rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          width: 320px;
          transition: all 0.3s;
        }

        .search-bar:focus-within {
          background: rgba(255,255,255,0.06);
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          width: 100%;
        }

        .sync-btn {
          padding: 0.7rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
        }

        .main-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
        }

        .mobile-view .main-scroll-area {
          padding: 1.25rem;
        }

        .notes-container {
          display: grid;
          gap: 1.5rem;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .grid-view {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }

        .list-view {
          grid-template-columns: 1fr;
          max-width: 800px;
        }

        /* Note Cards */
        .note-card {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
        }

        .note-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.4);
        }

        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .type-tag {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .type-general { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .type-meeting { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
        .type-journal { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
        .type-task { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

        .note-card-title {
          font-size: 1.2rem;
          font-family: 'Outfit';
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .note-card-preview {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .note-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-glass);
        }

        .date { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .tag { font-size: 0.75rem; color: var(--accent-primary); font-weight: 700; }

        /* Icon Buttons */
        .icon-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 0 2rem;
        }

        .nav-item-static {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.9rem 1.1rem;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .del-btn-minimal {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .del-btn-minimal:hover {
          background: rgba(244, 63, 94, 0.1);
          color: #f43f5e;
          transform: scale(1.1);
        }

        .empty-icon-box {
          width: 80px;
          height: 80px;
          background: var(--bg-tertiary);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .new-note-btn-minimal {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-primary);
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .new-note-btn-minimal:hover {
          background: var(--accent-gradient);
          color: white;
          transform: translateY(-2px);
        }

        /* Custom Scrollbar for premium feel */
        .scroll-area::-webkit-scrollbar {
          width: 5px;
        }
        .scroll-area::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 640px) {
          .search-bar { width: 100%; }
        }

        /* Utils */
        .hidden { display: none; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .text-muted { color: var(--text-muted); }
        .text-nowrap { white-space: nowrap; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
